import { AppError } from '../../utils/AppError';
import { prisma } from '../../../prisma/client';
import ApiFeatures from '../../utils/apiFeatures';
import validateFields from '../../utils/helpers/validate-req-body';
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { redisClient } from '../../redis/redisClient';

class JobController {
	/**
	 * Get all jobs
	 * @param {req} req
	 * @param {res} res
	 */
	static async allJobs(req: Request, res: Response) {
		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 10;

		const features = new ApiFeatures(req.query)
			.pagination()
			.sorting()
			.categorySearching();

		const activeJobsQuery: Prisma.JobFindManyArgs = {
			...features.queryOptions,
			where: {
				...features.queryOptions.where,
				status: 'Active',
			},
		};

		// Create cache key based on query parameters
		const cacheKey = `jobs:active:page:${page}:limit:${limit}:sort:${req.query.sort || 'default'}:search:${req.query.search || 'none'}`;
		
		// Try to get from cache first
		const cached = await redisClient.get(cacheKey);
		if (cached) {
			return res.status(200).json(JSON.parse(cached));
		}

		// Execute queries in parallel for better performance
		const [jobs, jobcount] = await Promise.all([
			prisma.job.findMany(activeJobsQuery),
			prisma.job.count({
				where: activeJobsQuery.where,
			}),
		]);

		const hasMore = page * limit < jobcount;
		const nextPage = hasMore ? page + 1 : null;

		const response = {
			status: 'success',
			message: jobs.length ? 'All Jobs' : 'No Available Job',
			total: jobcount,
			count: jobs.length,
			data: jobs,
			hasMore,
			nextPage,
		};

		// Cache for 5 minutes (300 seconds) - shorter TTL for frequently changing data
		await redisClient.set(cacheKey, JSON.stringify(response), 300);

		res.status(200).json(response);
	}

	/**
	 * Post new jobs for job seekers
	 * @param {req} req
	 * @param {res} res
	 */
	static async createJob(req: Request, res: Response, next: NextFunction) {
		const empId = req.userId;
		const requiredFields = [
			'title',
			'pay',
			'type',
			'location',
			'shortRoleDescription',
			'fullRoleDescription',
			'keyResponsibility',
			'qualificationAndExperience',
			'methodOfApplication',
			'deadline',
			'jobCategory',
		];
		validateFields(req, requiredFields);

		const { jobCategory, ...data } = req.body;
		
		// Fetch only necessary employer fields
		const employerDetails = await prisma.employer.findUnique({
			where: { id: empId },
			select: {
				companyName: true,
				companyDescription: true,
			},
		});

		if (!employerDetails) {
			return next(
				new AppError({ message: 'Employer not found', statusCode: 404 })
			);
		}

		const jobs = await prisma.job.create({
			data: {
				...data,
				company: employerDetails.companyName,
				aboutCompany: employerDetails.companyDescription,
				employer: { connect: { id: req.userId } },
				jobCategory: { connect: { id: jobCategory } },
			},
			include: {
				jobCategory: true,
			},
		});

		// Invalidate job listings cache when new job is created
		await redisClient.del('jobs:active:page:1:limit:10:sort:default:search:none');

		res.status(201).json({
			status: 'OK',
			message: 'Job posted successfully.',
			data: {
				jobs,
			},
		});
	}

	/**
	 * Fetch job by ID
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */
	static async jobById(req: Request, res: Response, next: NextFunction) {
		const jobId = req.params.jobId;
		// Don't include all applications by default - only fetch job category
		const job = await prisma.job.findUnique({
			where: {
				id: jobId,
			},
			include: {
				jobCategory: true,
			},
		});

		if (!job) {
			return next(new AppError({ message: 'Job not found', statusCode: 404 }));
		}

		res.status(200).json({
			status: 'success',
			message: 'Job',
			data: {
				job,
			},
		});
	}

	/**
	 * Get a single job posted by an employer
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */

	static async employerJobById(req: Request, res: Response, _: NextFunction) {
		const jobId = req.params.jobId;
		const empJob = await prisma.employer.findUnique({
			where: {
				id: req.userId,
			},
			select: {
				jobsPosted: {
					where: {
						id: jobId,
					},
				},
			},
		});

		res.status(200).json({
			status: 'success',
			message: 'Employer Job by Id',
			data: empJob,
		});
	}

	/**
	 * Update single job posted by an employer
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */

	static async updateJob(req: Request, res: Response, _: NextFunction) {
		const jobId = req.params.jobId;
		const { jobCategory, ...data } = req.body;

		const updated = await prisma.employer.update({
			where: {
				id: req.userId,
			},
			data: {
				jobsPosted: {
					update: {
						where: {
							id: jobId,
						},
						data: {
							...data,
							jobCategory: jobCategory
								? { connect: { id: jobCategory } }
								: undefined,
						},
					},
				},
			},
			select: {
				jobsPosted: {
					where: {
						id: jobId,
					},
				},
			},
		});

		// Invalidate job listings cache when job is updated
		await redisClient.del('jobs:active:page:1:limit:10:sort:default:search:none');

		res.status(200).json({
			status: 'OK',
			message: 'Job updated successfully.',
			data: updated,
		});
	}

	/**
	 * Delete single job posted by an employer
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */
	static async deleteJob(req: Request, res: Response, _: NextFunction) {
		const jobId = req.params.jobId;
		await prisma.employer.update({
			where: {
				id: req.userId,
			},
			data: {
				jobsPosted: {
					deleteMany: [{ id: jobId }],
				},
			},
		});

		// Invalidate job listings cache when job is deleted
		await redisClient.del('jobs:active:page:1:limit:10:sort:default:search:none');

		res.status(204).json({
			status: 'OK',
			message: 'Message deleted successfully.',
		});
	}

	/**
	 * Jobseeker Apply for a particular job
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */
	static async jobApply(req: Request, res: Response, next: NextFunction) {
		const userId = req.userId;
		const jobId = req.params.jobId;

		if (!jobId)
			return next(
				new AppError({ message: 'Job Id is required', statusCode: 400 })
			);

		validateFields(req, ['proposal', 'resumeUrl']);

		const { proposal, resumeUrl } = req.body;

		// Fetch jobseeker and job in parallel for better performance
		const [jobseeker, job, applied] = await Promise.all([
			prisma.jobSeeker.findUnique({
				where: { id: userId },
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					phone: true,
				},
			}),
			prisma.job.findUnique({
				where: { id: jobId },
				select: {
					id: true,
					status: true,
				},
			}),
			prisma.application.findFirst({
				where: {
					jobSeekerId: userId,
					jobId: jobId,
				},
				select: { id: true },
			}),
		]);

		if (!jobseeker)
			return next(
				new AppError({ message: 'Jobseeker not found', statusCode: 404 })
			);

		if (!job)
			return next(new AppError({ message: 'Job not found', statusCode: 404 }));

		if (job.status !== 'Active') {
			return next(
				new AppError({
					message: 'Job is not active, you cannot apply',
					statusCode: 403,
				})
			);
		}

		if (applied) {
			return next(
				new AppError({
					message: 'You have already applied for this job',
					statusCode: 403,
				})
			);
		}

		// Create application and increment applicant count in a transaction
		const [appliedJob] = await prisma.$transaction([
			prisma.application.create({
				data: {
					firstName: jobseeker.firstName,
					lastName: jobseeker.lastName,
					email: jobseeker.email,
					phone: jobseeker.phone,
					proposal,
					resumeUrl,
					jobSeekerId: userId,
					jobId: jobId,
				},
			}),
			prisma.job.update({
				where: { id: jobId },
				data: {
					noOfApplicants: {
						increment: 1,
					},
				},
			}),
		]);

		res.status(201).json({
			status: 'OK',
			message: 'Application successful',
			data: appliedJob,
		});
	}

	/**
	 * Employer Updates applicant  Status
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */
	static async jobStatusUpdate(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const userId = req.userId;
		const jobId = req.params.jobId;
		const applicationId = req.params.applicationId;

		let { status } = req.body;

		if (!status) {
			status = null;
		}

		const empJob = await prisma.job.findUnique({
			where: {
				id: jobId,
				employerId: userId,
			},
		});

		if (!empJob)
			return next(
				new AppError({
					message: 'Job with this id not found or you are not the employer',
					statusCode: 404,
				})
			);

		const applicantion = await prisma.application.findUnique({
			where: {
				id: applicationId,
			},
		});

		if (!applicantion)
			return next(
				new AppError({
					message: 'Application with this id not found',
					statusCode: 404,
				})
			);

		const updated = await prisma.application.update({
			where: {
				id: applicationId,
			},
			data: {
				status,
			},
		});

		res.json({
			status: 'success',
			message: `Application Status Updated to ${updated.status}`,
			data: {
				updated,
			},
		});
	}

	/**
	 * Job Categories
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */

	static async JobCategories(req: Request, res: Response, _: NextFunction) {
		const features = new ApiFeatures(req.query).sorting();
		const queryOptions: Prisma.JobCategoryFindManyArgs = features.queryOptions;
		
		// Try to get categories from cache first
		const cacheKey = 'job:categories';
		const cached = await redisClient.get(cacheKey);
		
		if (cached) {
			const categories = JSON.parse(cached);
			return res.json({
				status: 'success',
				count: categories.length,
				data: categories,
			});
		}

		// Fetch from database if not cached
		const categories = await prisma.jobCategory.findMany(queryOptions);
		
		// Cache for 1 hour (3600 seconds)
		await redisClient.set(cacheKey, JSON.stringify(categories), 3600);

		res.json({
			status: 'success',
			count: categories.length,
			data: categories,
		});
	}
}
export { JobController };
