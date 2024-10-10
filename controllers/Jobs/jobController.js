const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const prisma = require("../../prisma/client");
const ApiFeatures = require("../../utils/apiFeatures");


const jobsAll = catchAsync(async (req, res, next) => {

	const features = new ApiFeatures(req.query).pagination().sorting();
	const jobs = await prisma.job.findMany(features.queryOptions)

	if (jobs.length === 0) {
		res.status(200).json({
			status: "OK",
			message: "No Available Job"
		})
	}

	const jobcount = await prisma.job.count()
	res.status(200).json({
		status: "OK",
		total: jobcount,
		count: jobs.length,
		data: jobs
	})
});


const jobById = catchAsync(async (req, res, next) => {
	const jobId = req.params.jobId;
	const job = await prisma.job.findUnique({
		where: {
			id: jobId
		}
	});

	if (!job) {
		return next(new AppError("No Job with the specifid ID", 404));
	}

	res.status(200).json({
		status: "OK",
		data: job
	})
})


const jobApply = catchAsync(async (req, res, next) => {
	const userId = req.userId;
	const jobId = req.params.jobId;


	if (!userId || !jobId) {
		return next(new AppError("Missing Required Fields", 404));
	}


	const appliedJob = await prisma.application.create({
		data: {
			coverLetter: req.body.coverLetter || null,
			resumeUrl: req.body.resumeUrl || null,
			jobSeekerId: userId,
			jobId: jobId,
		}
	})

	res.status(201).json({
		status: "OK",
		message: "Application successful",
		data: appliedJob
	})
})


module.exports = {
	jobsAll, jobById, jobApply
}