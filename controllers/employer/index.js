const prisma = require("../../prisma/client");
const AppError = require("../../utils/AppError");
const argon2 = require("argon2");
const validateFields = require("../../utils/helpers/validate-req-body");
//const ApiFeatures = require("../../utils/apiFeatures");

class EmployerController {
	/**
	 * Get all employers
	 * @param {req} req
	 * @param {res} res
	 */
	static async allEmployers(req, res) {
		let employers = await prisma.employer.findMany({});

		res.status(200).json({
			status: "OK",
			message: "All employers",
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

	static async employerById(req, res, next) {
		const employer = await prisma.employer.findUnique({
			where: {
				id: req.userId,
			},
		});

		if (!employer) {
			return next(
				new AppError(`No employer Found with id:${req.userId}`),
				404
			);
		}

		res.status(200).json({
			status: "OK",
			message: "Employer",
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

	static async updateEmployer(req, res, next) {
		const employer = await prisma.employer.findUnique({
			where: {
				id: req.userId,
			},
		});
		if (!employer) {
			return next(
				new AppError(`No Employer Found with id:${req.userId}`),
				404
			);
		}

		const { password, createdAt, updatedAt, ...rest } = req.body;

		if (createdAt || updatedAt) {
			return next(
				new AppError("You cannot update createdAt or updatedAt", 404)
			);
		}

		let hashPassword;
		if (password) {
			try {
				hashPassword = await argon2.hash(password, { hashLength: 40 });
				rest.password = hashPassword;
			} catch (err) {
				return next(new AppError(err.message, 404));
			}
		}

		const updated = await prisma.employer.update({
			where: {
				email: employer.email,
			},
			data: { ...rest },
		});

		res.status(200).json({
			status: "OK",
			message: "Employer details updated successfully.",
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
	static async deleteEmployer(req, res) {
		await prisma.employer.delete({
			where: {
				id: req.userId,
			},
		});

		res.status(204).json({
			status: "OK",
			message: "Employer account deleted successfully.",
		});
	}

	/**
	 * Post new jobs for job seekers
	 * @param {req} req
	 * @param {res} res
	 */
	static async createJob(req, res) {
		const requiredFields = [
			"title",
			"company",
			"pay",
			"type",
			"aboutCompany",
			"location",
			"shortRoleDescription",
			"fullRoleDescription",
			"keyResponsibility",
			"qualificationAndExperience",
			"methodOfApplication",
			"deadline",
		];
		validateFields(req, requiredFields);

		let jobs;
		jobs = await prisma.job.create({
			data: { ...req.body, employer: { connect: { id: req.userId } } },
		});

		res.status(201).json({
			status: "OK",
			message: "Job posted successfully.",
			data: {
				jobs,
			},
		});
	}

	/**
	 * Get all jobs posted by an employer
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */

	static async allEmployerJobs(req, res) {
		const allJob = await prisma.employer
			.findUnique({
				where: {
					id: req.userId,
				},
			})
			.jobsPosted();

		res.status(200).json({
			status: "OK",
			message: "All jobs posted ",
			count: allJob.length,
			data: allJob,
		});
	}

	/**
	 * Get a single job posted by an employer
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */

	static async employerJobById(req, res, next) {
		const jobId = req.params.jobId;
		const singlejob = await prisma.employer.findUnique({
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
			status: "OK",
			data: singlejob,
		});
	}

	/**
	 * Update single job posted by an employer
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */

	static async updatejob(req, res, next) {
		const jobId = req.params.jobId;

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
							...req.body,
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
			status: "OK",
			message: "Job updated successfully.",
			data: updated,
		});
	}

	/**
	 * Delete single job posted by an employer
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */
	static async deleteJob(req, res, next) {
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
			status: "OK",
			message: "Message deleted successfully.",
		});
	}
}

module.exports = EmployerController;
