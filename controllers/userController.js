const catchAsync = require("../utils/catchAsync");
const prisma = require("../prisma/client");
// const ApiFeatures = require("../utils/apiFeatures");


const allJobSeekers = catchAsync(async (req, res, next) => {
	let users = await prisma.jobSeeker.findMany({})

	res.status(200).json({
		status: "successs",
		count: users.length,
		data: {
			users,
		}
	})
})




module.exports = {
	allJobSeekers,
}