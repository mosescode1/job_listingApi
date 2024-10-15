const catchAsync = require("../../utils/catchAsync");
const prisma = require("../../prisma/client");
const AppError = require("../../utils/AppError");
const argon2 = require("argon2");
const fieldCheck = require("../../utils/fieldCheck");

// const ApiFeatures = require("../utils/apiFeatures");


const allEmployers = catchAsync(async (req, res, next) => {
	let employers = await prisma.employer.findMany({})

	res.status(200).json({
		status: "OK",
		count: employers.length,
		data: {
			employers,
		}
	})
})

const profileMe = catchAsync(async (req, res, next) => {

	const employer = await prisma.employer.findUnique({
		where: {
			id: req.empId,
		}
	})

	if (!employer) {
		return next(new AppError(`No employer Found with id:${req.userId}`), 404);
	}

	res.status(200).json({
		status: "OK",
		data: {
			employer,
		}
	})
})

const updateProfile = catchAsync(async (req, res, next) => {
	const employer = await prisma.employer.findUnique({
		where: {
			id: req.empId,
		}
	})
	if (!employer) {
		return next(new AppError(`No Employer Found with id:${req.userId}`), 404);
	}


	const { password, createdAt, updatedAt, ...rest } = req.body;

	if (createdAt || updatedAt) {
		return next(new AppError("You cannot update createdAt or updatedAt", 404));
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
			email: employer.email
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

	await prisma.employer.delete({
		where: {
			id: req.empId,
		}
	})

	res.status(204).json({ status: "OK" })
})


// ! JOB CONTROLLERS
const createJob = catchAsync(async (req, res, next) => {
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
		"deadline"
	];

	if (!fieldCheck(req.body, requiredFields)) {
		return next(new AppError("Missing Some Required FIelds", 404))
	}


	let job;
	job = await prisma.job.create({
		data: { ...req.body, employer: { connect: { id: req.empId }, }, }
	})


	res.status(201).json({
		status: "OK",
		data: {
			job
		}
	})
})


const empJobs = catchAsync(async (req, res, next) => {

	const allJob = await prisma.employer.findUnique({
		where: {
			id: req.empId,
		},
	}).jobsPosted();

	res.status(200).json({
		status: "OK",
		count: allJob.length,
		data: allJob

	})

})

const singleJob = catchAsync(async (req, res, next) => {
	const jobId = req.params.jobId;

	const singlejob = await prisma.employer.findUnique({
		where: {
			id: req.empId,
		},
		select: {
			jobsPosted: {
				where: {
					id: jobId,
				}
			}
		}
	})


	res.status(200).json({
		status: "OK",
		data: singlejob
	})
})

const updateJob = catchAsync(async (req, res, next) => {
	const jobId = req.params.jobId;


	const updated = await prisma.employer.update({
		where: {
			id: req.empId,
		},
		data: {
			jobsPosted: {
				update: {
					where: {
						id: jobId
					},
					data: {
						...req.body,
					}
				}
			}
		},
		select: {
			jobsPosted: {
				where: {
					id: jobId
				}
			}
		}
	})

	res.status(200).json({
		status: "OK",
		data: updated
	})
})


const deleteJob = catchAsync(async (req, res, next) => {
	const jobId = req.params.jobId;


	await prisma.employer.update({
		where: {
			id: req.empId,
		},
		data: {
			jobsPosted: {
				deleteMany: [{ id: jobId }]
			}
		},
	})
	res.status(204).json({
		status: "OK",
	})
})


const jobApplication = catchAsync(async (req, res, next) => {
	const jobId = req.params.jobId;
	const empId = req.empId;


	const allApplications = await prisma.employer.findUnique({
		where: {
			id: empId,
		},
		select: {
			jobsPosted: {
				where: {
					id: jobId
				},
				select: {
					applications: true
				},
			}
		}
	});

	res.status(200).json({
		status: "OK",
		data: allApplications
	})

})

module.exports = {
	allEmployers, profileMe, updateProfile,
	deleteUser, createJob, empJobs, updateJob,
	deleteJob, singleJob, jobApplication
}