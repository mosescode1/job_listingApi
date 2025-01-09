import { AppError } from '../../utils/AppError';
import { prisma } from '../../../prisma/client';
import ApiFeatures from '../../utils/apiFeatures';
import validateFields from '../../utils/helpers/validate-req-body';
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

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

		const jobs = await prisma.job.findMany(activeJobsQuery);

		const jobcount = await prisma.job.count({
			where: { status: 'Active' },
		});

		const hasMore = page * limit < jobcount;
		const nextPage = hasMore ? page + 1 : null;

		res.status(200).json({
			status: 'success',
			message: jobs.length ? 'All Jobs' : 'No Available Job',
			total: jobcount,
			count: jobs.length,
			data: jobs,
			hasMore,
			nextPage,
		});
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
		const employerDetails = await prisma.employer.findUnique({
			where: { id: empId },
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
		const job = await prisma.job.findUnique({
			where: {
				id: jobId,
			},
			include: {
				applications: true,
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

		// if (!userId)
		// 	return next(
		// 		new AppError({
		// 			message: 'User with this id not found',
		// 			statusCode: 404,
		// 		})
		// 	);

		const jobseeker = await prisma.jobSeeker.findUnique({
			where: {
				id: userId,
			},
		});

		if (!jobseeker)
			return next(
				new AppError({ message: 'Jobseeker not found', statusCode: 404 })
			);

		const job = await prisma.job.findUnique({
			where: {
				id: jobId,
			},
		});

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

		const applied = await prisma.application.findFirst({
			where: {
				jobSeekerId: jobseeker.id,
				jobId: jobId,
			},
		});

		if (applied) {
			return next(
				new AppError({
					message: 'You have already applied for this job',
					statusCode: 403,
				})
			);
		}

		//  NOTE: Increment the number of applicants for the job
		await prisma.job.update({
			where: {
				id: jobId,
			},
			data: {
				noOfApplicants: {
					increment: 1,
				},
			},
		});

		const appliedJob = await prisma.application.create({
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
		});

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
		const categories = await prisma.jobCategory.findMany(queryOptions);

		res.json({
			status: 'success',
			count: categories.length,
			data: categories,
		});
	}
}
export { JobController };
