import { prisma } from '../../../prisma/client';
import { AppError } from '../../utils/AppError';
import argon2 from 'argon2';
import ApiFeatures from '../../utils/apiFeatures';
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

class JobSeekerController {
	/**
	 * Get all job seekers
	 * @param {req} req
	 * @param {res} res
	 */
	static async allJobSeekers(req: Request, res: Response) {
		const features = new ApiFeatures(req.query).pagination().sorting();
		let users = await prisma.jobSeeker.findMany(
			features.queryOptions as Prisma.JobSeekerFindManyArgs
		);

		res.status(200).json({
			status: 'successs',
			message: 'All job seekers',
			count: users.length,
			data: {
				users: users.filter((user) => {
					(user as any).refreshToken = undefined;
					return user;
				}),
			},
		});
	}

	/**
	 * job seeker Profile
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 * @returns
	 */

	static async jobSeekerById(req: Request, res: Response, next: NextFunction) {
		const jobSeeker = await prisma.jobSeeker.findUnique({
			where: {
				id: req.userId,
			},
			omit: {
				refreshToken: true,
			},
			include: {
				address: true,
				skills: true,
				portfolio: true,
				certification: true,
				experience: true,
				education: true,
			},
		});
		if (!jobSeeker) {
			return next(
				new AppError({ message: 'Job seeker not found', statusCode: 404 })
			);
		}

		res.status(200).json({
			status: 'OK',
			message: 'Job seeker',
			data: {
				jobSeeker,
			},
		});
	}

	/**
	 * Update job seeker details
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 * @returns
	 */

	static async updateJobSeeker(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const jobSeeker = await prisma.jobSeeker.findUnique({
			where: {
				id: req.userId,
			},
		});

		if (!jobSeeker) {
			return next(
				new AppError({ message: 'Job seeker not found', statusCode: 404 })
			);
		}

		const { password, ...rest } = req.body;

		let hashPassword;
		if (password) {
			try {
				hashPassword = await argon2.hash(password, { hashLength: 40 });
				rest.password = hashPassword;
			} catch (err: any) {
				return next(new AppError({ message: err.message, statusCode: 400 }));
			}
		}

		const updated = await prisma.jobSeeker.update({
			where: {
				email: jobSeeker.email,
			},
			data: { ...rest },
		});

		res.status(200).json({
			status: 'OK',
			message: 'Job seeker details updated successfully.',
			data: {
				jobSeeker: updated,
			},
		});
	}

	/**
	 * Delete job seeker account
	 * @param {req} req
	 * @param {res} res
	 */
	static async deleteJobSeeker(req: Request, res: Response) {
		await prisma.jobSeeker.delete({
			where: {
				id: req.userId,
			},
		});

		res.status(204).json({
			status: 'OK',
			message: 'Job seeker account deleted successfully.',
		});
	}

	/**
	 *  all jobseeker applications
	 * @param {req} req
	 * @param {res} res
	 */
	static async viewApplications(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const userId = req.userId;

		const applications = await prisma.application.findMany({
			where: { jobSeekerId: userId },
			omit: {
				firstName: true,
				lastName: true,
				email: true,
				phone: true,
				updatedAt: true,
				jobSeekerId: true,
			},
		});

		if (!applications || applications.length === 0) {
			return next(
				new AppError({ message: 'No applications found', statusCode: 404 })
			);
		}

		// Fetch full job details for each application
		const applicationsWithJobDetails = await Promise.all(
			applications.map(async (application) => {
				const jobDetails = await prisma.job.findUnique({
					where: { id: application.jobId },
					include: {
						jobCategory: true,
					},
				});

				return {
					...application,
					jobDetails,
				};
			})
		);

		res.status(200).json({
			status: 'success',
			message: 'all applications',
			applications: applicationsWithJobDetails,
		});
	}

	static async uploadPic(req: Request, res: Response) {
		console.log(req);
		const updated = await prisma.jobSeeker.update({
			where: {
				id: req.userId,
			},

			data: {
				avatarUrl: req.file?.path,
			},
		});
		res.status(200).json({
			status: 'success',
			data: {
				updated,
			},
		});
	}
}

export { JobSeekerController };
