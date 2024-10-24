const AppError = require("../../utils/AppError");
const prisma = require("../../prisma/client");
const ApiFeatures = require("../../utils/apiFeatures");
const validateFields = require("../../utils/helpers/validate-req-body");

class JobController {
	/**
	 * Get all jobs
	 * @param {req} req
	 * @param {res} res
	 */

	static async allJobs(req, res) {
		const features = new ApiFeatures(req.query).pagination().sorting();
		const jobs = await prisma.job.findMany(features.queryOptions);

		if (jobs.length === 0) {
			res.status(200).json({
				status: "OK",
				message: "No Available Job",
			});
		}

		const jobcount = await prisma.job.count();
		res.status(200).json({
			status: "success",
			message: "All Jobs",
			total: jobcount,
			count: jobs.length,
			data: jobs,
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
	 * Fetch job by ID
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */
	static async jobById(req, res, next) {
		const jobId = req.params.jobId;
		const job = await prisma.job.findUnique({
			where: {
				id: jobId,
			},
			include: {
				applications: true,
				JobCategory: true,
			}
		});

		if (!job) {
			return next(new AppError("No job found with the specifid ID", 404));
		}

		res.status(200).json({
			status: "success",
			message: "Job",
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

	static async employerJobById(req, res) {
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
			status: "success",
			message: "Employer Job by Id",
			data: empJob,
		});
	}

	/**
	 * Update single job posted by an employer
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */

	static async updatejob(req, res) {
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
	static async deleteJob(req, res) {
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




	/**
	 * Jobseeker Apply for a particular job
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */
	static async jobApply(req, res, next) {
		const userId = req.userId;
		const jobId = req.params.jobId;

		validateFields(req, ["firstName", "lastName", "email", "phone", "proposal", "resumeUrl"]);

		const { firstName, lastName, email, phone, proposal, resumeUrl } = req.body;

		if (!userId) {
			return next(new AppError("Missing UserID", 404));
		}

		if (!jobId) {
			return next(new AppError("Missing JobID", 404));
		}

		const job = await prisma.job.findUnique({
			where: {
				id: jobId,
			}
		})

		if (!job) {
			return next(new AppError("No Job Match with this Id", 404));
		}

		const appliedJob = await prisma.application.create({
			data: {
				firstName,
				lastName,
				email,
				phone,
				proposal,
				resumeUrl,
				jobSeekerId: userId,
				jobId: jobId,
			},
		});

		res.status(201).json({
			status: "OK",
			message: "Application successful",
			data: appliedJob,
		});
	}



	static async jobStatusUpdate(req, res, next) {
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
			}
		})

		const applicantion = await prisma.application.findUnique({
			where: {
				id: applicationId,
			}
		})

		if (!applicantion) return next(new AppError("No application with this id Does not Exist", 404));


		if (!empJob) return next(new AppError("This Employer does not have Access to this applicant", 403))

		const updated = await prisma.application.update({
			where: {
				id: applicationId,
			},
			data: {
				status
			}
		})

		res.json({
			status: "success",
			message: `Application Status Updated to ${updated.status}`,
			data: {
				updated
			}
		})
	}
}
module.exports = JobController;
