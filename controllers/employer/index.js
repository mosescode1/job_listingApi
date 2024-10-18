const prisma = require("../../prisma/client");
const AppError = require("../../utils/AppError");
const argon2 = require("argon2");
const validateFields = require("../../utils/helpers/validate-req-body");
const { refreshToken } = require("../../utils/jwtFeature");
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
			message: "Employer Profile",
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



	static async viewApplicants(req, res, next) {
		const jobId = req.params.jobId;
		const empId = req.userId;

		if (!jobId) {
			return next(new Error("Mising Job Id", 404));
		}

		const applicants = await prisma.job.findUnique({
			where: {
				id: jobId,
				employerId: empId,
			},
		}).applications();

		res.status(200).json({
			status: "success",
			message: "All applicants",
			data: {
				applicants
			}
		})
	}

}

module.exports = EmployerController;
