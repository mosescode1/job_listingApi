const prisma = require("../../prisma/client");
const AppError = require("../../utils/AppError");
const argon2 = require("argon2");
const ApiFeatures = require("../../utils/apiFeatures");

class JobSeekerController {
	/**
	 * Get all job seekers
	 * @param {req} req
	 * @param {res} res
	 */
	static async allJobSeekers(req, res) {
		const features = new ApiFeatures(req.query).pagination().sorting();
		let users = await prisma.jobSeeker.findMany(features.queryOptions);

		res.status(200).json({
			status: "successs",
			message: "All job seekers",
			count: users.length,
			data: {
				users,
			},
		});
	}

	/**
	 * Get job seeker by id
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 * @returns
	 */

	static async jobSeekerById(req, res, next) {
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
				new AppError(`No Jobseeker Found with id:${req.userId}`),
				404
			);
		}

		res.status(200).json({
			status: "OK",
			message: "Job seeker",
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

	static async updateJobSeeker(req, res, next) {
		const jobSeeker = await prisma.jobSeeker.findUnique({
			where: {
				id: req.userId,
			},
		});

		if (!jobSeeker) {
			return next(
				new AppError(`No Job seeker Found with id:${req.userId}`),
				404
			);
		}

		const { password, ...rest } = req.body;

		let hashPassword;
		if (password) {
			try {
				hashPassword = await argon2.hash(password, { hashLength: 40 });
				rest.password = hashPassword;
			} catch (err) {
				return next(new AppError(err.message, 404));
			}
		}

		const updated = await prisma.jobSeeker.update({
			where: {
				email: jobSeeker.email,
			},
			data: { ...rest },
		});

		res.status(200).json({
			status: "OK",
			message: "Job seeker details updated successfully.",
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
	static async deleteJobSeeker(req, res) {
		await prisma.jobSeeker.delete({
			where: {
				id: req.userId,
			},
		});

		res.status(204).json({
			status: "OK",
			message: "Job seeker account deleted successfully.",
		});
	}
}

module.exports = JobSeekerController;
