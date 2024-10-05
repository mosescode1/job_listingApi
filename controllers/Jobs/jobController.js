const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const prisma = require("../../prisma/client");


const jobsAll = catchAsync(async (req, res, next) => {
	const jobs = await prisma.job.findMany({});

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