const catchAsync = require("../../utils/catchAsync");
const prisma = require("../../prisma/client");
const AppError = require("../../utils/AppError");
const argon2 = require("argon2");

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

const profileMe = catchAsync(async (req, res, next) => {
	const jobSeeker = await prisma.jobSeeker.findUnique({
		where: {
			id: req.userId,
		}
	})
	if (!jobSeeker) {
		return next(new AppError(`No Jobseeker Found with id:${req.userId}`), 404);
	}

	res.status(200).json({
		status: "OK",
		data: {
			jobSeeker,
		}
	})
})

const updateProfile = catchAsync(async (req, res, next) => {
	const jobSeeker = await prisma.jobSeeker.findUnique({
		where: {
			id: req.userId,
		}
	})
	if (!jobSeeker) {
		return next(new AppError(`No Jobseeker Found with id:${req.userId}`), 404);
	}


	const { password, ...rest } = req.body;


	console.log(rest);

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
			email: jobSeeker.email
		},
		data: { ...rest }
	})



	res.status(200).json({
		status: "OK",
		data: {
			jobSeeker: updated,
		}
	});
})

const deleteUser = catchAsync(async (req, res, next) => {

	await prisma.jobSeeker.delete({
		where: {
			id: req.userId,
		}
	})

	res.status(204).json({ status: "OK" })
})

module.exports = {
	allJobSeekers, profileMe, updateProfile, deleteUser
}