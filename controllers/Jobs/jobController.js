const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const prisma = require("../../prisma/client");
const ApiFeatures = require("../../utils/apiFeatures");


const jobsAll = catchAsync(async (req, res, next) => {

	const features = new ApiFeatures(req.query).pagination().sorting();
	const jobs = await prisma.job.findMany(features.queryOptions)
	res.status(200).json({
		status: "OK",
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




module.exports = {
	jobsAll, jobById
}