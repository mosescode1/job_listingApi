const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const prisma = require("../../prisma/client");
const ApiFeatures = require("../../utils/apiFeatures");

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
			status: "OK",
			total: jobcount,
			count: jobs.length,
			data: jobs,
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
		});

		if (!job) {
			return next(new AppError("No job found with the specifid ID", 404));
		}

		res.status(200).json({
			status: "OK",
			data: job,
		});
	}

	/**
	 * Apply for a particular job
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 */
	static async jobApply(req, res, next) {
		const userId = req.userId;
		const jobId = req.params.jobId;

		if (!userId) {
			return next(new AppError("Missing UserID", 404));
		}


		const user = await prisma.jobSeeker.findUnique({
			where: {
				id: userId,
			}
		})

		if (!user) {
			return next(new AppError("No user Found", 404));
		}

		if (!jobId) {
			return next(new AppError("Missing JobID", 404));
		}

		const appliedJob = await prisma.application.create({
			data: {
				name: `${user.firstName} ${user.lastName}`,
				email: user.email,
				coverLetter: req.body.coverLetter || null,
				resumeUrl: req.body.resumeUrl || null,
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
}

module.exports = JobController;
