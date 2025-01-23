import { prisma } from '../../../prisma/client';
import { AppError } from '../../utils/AppError';
import argon2 from 'argon2';
import ApiFeatures from '../../utils/apiFeatures';
import { averageSalary, monthlyApplicantData } from '../../utils/helpers/utils';
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

class EmployerController {
	/**
	 * Get all employers
	 * @param {req} req
	 * @param {res} res
	 */
	static async allEmployers(req: Request, res: Response) {
		const features = new ApiFeatures(req.query).pagination().sorting();
		const employers = await prisma.employer.findMany({
			...(features.queryOptions as Prisma.EmployerFindManyArgs),
		});

		res.status(200).json({
			status: 'OK',
			message: 'All employers',
			count: employers.length,
			data: {
				employers,
			},
		});
	}

	/**
	 * Get employer by id
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 * @returns
	 */

	static async employerById(req: Request, res: Response, next: NextFunction) {
		const employer = await prisma.employer.findUnique({
			where: {
				id: req.userId,
			},
			include: {
				jobsPosted: {
					include: {
						applications: true,
						jobCategory: true,
					},
				},
			},
		});

		if (!employer) {
			return next(
				new AppError({
					message: `No employer Found with id:${req.userId}`,
					statusCode: 404,
				})
			);
		}

		res.status(200).json({
			status: 'OK',
			message: 'Employer Profile',
			data: {
				employer,
			},
		});
	}

	/**
	 * Update employer details
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 * @returns
	 */

	static async updateEmployer(req: Request, res: Response, next: NextFunction) {
		const employer = await prisma.employer.findUnique({
			where: {
				id: req.userId,
			},
		});
		if (!employer) {
			return next(
				new AppError({
					message: `No Employer Found with id:${req.userId}`,
					statusCode: 404,
				})
			);
		}

		const { password, createdAt, updatedAt, ...rest } = req.body;

		if (createdAt || updatedAt) {
			return next(
				new AppError({
					message: 'You cannot update createdAt or updatedAt',
					statusCode: 404,
				})
			);
		}

		let hashPassword;
		if (password) {
			try {
				hashPassword = await argon2.hash(password, { hashLength: 40 });
				rest.password = hashPassword;
			} catch (error: any) {
				return next(new AppError({ message: error.message, statusCode: 404 }));
			}
		}

		const updated = await prisma.employer.update({
			where: {
				email: employer.email,
			},
			data: { ...rest },
		});

		res.status(200).json({
			status: 'OK',
			message: 'Employer details updated successfully.',
			data: {
				employer: updated,
			},
		});
	}

	/**
	 * Delete employer account
	 * @param {req} req
	 * @param {res} res
	 */
	static async deleteEmployer(req: Request, res: Response) {
		await prisma.employer.delete({
			where: {
				id: req.userId,
			},
		});

		res.status(204).json({
			status: 'OK',
			message: 'Employer account deleted successfully.',
		});
	}

	/**
	 * Get all jobs posted by an employer
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */

	static async allEmployerJobs(req: Request, res: Response) {
		try {
			const employerJobs = await prisma.employer.findUnique({
				where: {
					id: req.userId,
				},
				include: {
					jobsPosted: {
						include: {
							applications: true,
							jobCategory: true,
						},
					},
				},
			});

			if (!employerJobs) {
				return res.status(404).json({
					status: 'error',
					message: 'Employer not found',
				});
			}

			const allJobs = employerJobs.jobsPosted;

			res.status(200).json({
				status: 'OK',
				message: 'All jobs posted',
				count: allJobs.length,
				data: allJobs,
			});
		} catch (error: any) {
			res.status(500).json({
				status: 'error',
				message: error.message,
			});
		}
	}

	/**
	 * Get all applicants who applied for a job
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */

	static async viewApplicants(req: Request, res: Response, next: NextFunction) {
		const jobId = req.params.jobId;
		const empId = req.userId;

		if (!jobId) {
			return next(
				new AppError({ message: 'Job ID is required', statusCode: 404 })
			);
		}
		const jobDetails = await prisma.job.findUnique({
			where: {
				id: jobId,
				employerId: empId,
			},
		});
		const applicants = await prisma.job
			.findUnique({
				where: {
					id: jobId,
					employerId: empId,
				},
			})
			.applications();

		res.status(200).json({
			status: 'success',
			message: 'All applicants',
			data: {
				title: jobDetails ? jobDetails.title : 'unknown',
				applicants,
			},
		});
	}

	/**
	 * Get a particular applicant profile who applied for a job
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */
	static async viewApplicantProfile(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const { jobSeekerId: userId, jobId } = req.params;

		// Find the applicant and include their details
		const applicant = await prisma.jobSeeker.findUnique({
			where: {
				id: userId,
			},
			include: {
				address: true,
				skills: true,
				portfolio: true,
				certification: true,
				experience: true,
				education: true,
				applications: {
					where: {
						jobId: jobId, // Filter applications by the specified jobId
					},
				},
			},
		});

		if (!applicant) {
			return next(
				new AppError({ message: 'Applicant not found', statusCode: 404 })
			);
		}

		(applicant.password as any) = undefined;
		(applicant.refreshToken as any) = undefined;

		res.status(200).json({
			status: 'OK',
			message: 'Job seeker',
			data: {
				applicant,
			},
		});
	}

	/**
	 * Get Employer Overview
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */

	static async employerOverview(req: Request, res: Response) {
		const monthNames = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sept',
			'Oct',
			'Nov',
			'Dec',
		];

		const empId = req.userId;

		// * LOGIC
		const [overview, applicantsPerMonth, jobCategoryData] = await Promise.all([
			// NOTE: Fetch employer overview
			prisma.employer.findUnique({
				where: {
					id: empId,
				},
				select: {
					companyName: true,
					_count: {
						select: {
							jobsPosted: true, // This counts the number of jobs posted by the employer
						},
					},
					jobsPosted: {
						select: {
							_count: {
								select: {
									applications: true, // This counts the number of applicants per job
								},
							},
							status: true,
						},
					},
				},
			}),

			// NOTE: Fetch the number of applicants per month
			prisma.application.groupBy({
				by: ['createdAt'],
				where: {
					job: {
						employerId: empId,
					},
				},
				_count: {
					id: true,
				},
				orderBy: {
					createdAt: 'asc',
				},
			}),

			// NOTE: Fetch the number of jobs in each category
			prisma.jobCategory.findMany({
				where: {
					jobs: {
						some: {
							employerId: empId,
						},
					},
				},
				select: {
					name: true, // Category name
					jobs: {
						where: {
							employerId: empId,
						},
						select: {
							jobCategory: true, // Count of jobs in this category for this employer
						},
					},
				},
			}),
		]);

		// TODO: Fetch the average salary per month
		const averageSalaryPerMonth = await prisma.job.groupBy({
			by: ['posted'], // Groups jobs by the 'posted' date
			where: {
				employerId: empId, // Filters jobs by the given employer ID
			},
			_max: {
				averagePay: true,
			},
			_count: true,
		});

		// NOTE Processing the result
		const monthlyApplicants = monthlyApplicantData(
			applicantsPerMonth,
			monthNames
		);
		const averagePay = averageSalary(averageSalaryPerMonth, monthNames);

		console.log(monthlyApplicants);

		// * NOTE Total number of jobs posted by the employer

		const totalJobsPosted = overview?._count.jobsPosted;
		const totalApplicants = overview?.jobsPosted.reduce(
			(acc, jobsPosted) => acc + jobsPosted._count.applications,
			0
		);

		// * NOTE Count the number of active jobs
		const activeJobs = overview?.jobsPosted.filter(
			(job) => job.status === 'Active'
		).length;

		// * NOTE: Count the number of jobs in each category
		const categoryData = jobCategoryData.map((item) => {
			return {
				name: item.name,
				count: item.jobs.length,
			};
		});

		// NOTE: SEND RESULT
		res.status(200).json({
			status: 'success',
			message: 'Employer Overview',
			data: {
				totalJobsPosted,
				totalApplicants,
				activeJobs,
				averagePay,
				monthlyApplicants,
				jobCategoryData: categoryData,
			},
		});
	}
}

export default EmployerController;
