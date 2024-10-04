const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const prisma = require("../prisma/client");
const argon2 = require("argon2");
const jwtFeatures = require("../utils/jwtFeature");
const redisClient = require("../redis/redisClient");
const resetFunc = require("../utils/resetToken");
const crypto = require("crypto");

// ? jOBSEEKER CREATION
const signUpJobSeeker = catchAsync(async (req, res, next) => {
	const { email, password, firstName, lastName } = req.body;

	if (!email || !password || !firstName || !lastName) {
		return next(new AppError("Missing Important Fields", 404));
	}

	const findUser = await prisma.jobSeeker.findUnique({
		where: {
			email: email,
		},
	})
	if (findUser) {
		return next(new AppError("JobSeeker with this email already exists", 404));
	}

	// hashPassword
	let hashPassword;
	try {
		hashPassword = await argon2.hash(password, { hashLength: 40 });
	} catch (err) {
		return next(new AppError(err.message, 404));
	}

	const jobSeeker = await prisma.jobSeeker.create({
		data: {
			firstName,
			email,
			lastName,
			password: hashPassword,
			phone: req.body.phone || null,
			location: req.body.location || null,
			bio: req.body.bio || null,
			resumeUrl: req.body.resumeUrl || null,
			avatarUrl: req.body.avatarUrl || null,
		}
	})

	// ! Did this maybe after register route to the dashbord immediately without login
	// const token = await jwtFeatures.signToken(jobSeeker.id)
	// const authTokenKey = `auth:${jobSeeker.id}`;
	// await redisClient.set(authTokenKey, token, 60 * 60 * 24);

	// ! hides jobseeker password
	jobSeeker.password = undefined;
	res.status(201).json({
		status: "OK",
		data: {
			jobSeeker,
		},
		// token
	})
})


// ? jOBSEEKER LOGIN
const loginJobSeeker = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new AppError("Missing Important Fields", 404));
	}

	const jobSeeker = await prisma.jobSeeker.findUnique({
		where: {
			email: email
		},
		select: {
			password: true,
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			phone: true,
			location: true,
			bio: true,
			resumeUrl: true,
			avatarUrl: true,
			createdAt: true,
			updatedAt: true,

		}
	})

	if (!jobSeeker) {
		return next(new AppError(`No user Found with the email: ${email}`, 404));
	}

	const verified = await argon2.verify(jobSeeker.password, password);

	if (!verified) {
		return next(new AppError("Wrong Password", 403))
	}

	const token = await jwtFeatures.signToken(jobSeeker.id)

	const authTokenKey = `auth:${jobSeeker.id}`;

	await redisClient.set(authTokenKey, token, 60 * 60 * 24);

	jobSeeker.password = undefined;
	res.status(200).json({ status: "OK", token, jobSeeker })
})


// ? AUTHENTICATION
const protect = catchAsync(async (req, res, next) => {
	if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
		return next(new AppError("Missing Authentication Header", 403));
	}

	const token = req.headers.authorization.split(" ")[1];

	const decoded = jwtFeatures.verifyToken(token);
	const authTokenKey = `auth:${decoded.id}`;
	const redisToken = await redisClient.get(authTokenKey);

	if (!redisToken) {
		return next(new AppError("Token has expired",))
	}

	// ! pass the current userId to the next middleware
	req.userid = decoded.id;
	next()
})


// ? Forgotten Password

const forgetPassword = catchAsync(async (req, res, next) => {
	const { email } = req.body;

	if (!email) {
		return next(new AppError("Please Provide an Email", 404));
	}

	const user = await prisma.jobSeeker.findUnique({
		where: {
			email: email
		}
	})

	if (!user) {
		return next(new AppError("User With this Email doesnot Exist", 404));
	}

	const resetToken = crypto.randomBytes(32).toString("hex");
	const token = resetFunc.generateResetToken(resetToken);
	console.log(user)

	await redisClient.set(`resetToken:${user.id}`, token, 60 * 60);

	const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/user/resetPassword/${resetToken}?user_id=${user.id}`

	res.status(200).json({ status: "success", resetUrl, resetToken });
})



// ! RESET PASSWORD
const resetPassword = catchAsync(async (req, res, next) => {
	const resetToken = req.params.token;
	const userId = req.query.user_id;
	const newPassword = req.body.newPassword;
	const confirmPassword = req.body.confirmPassword;

	if (!confirmPassword) {
		return next(new AppError("Please provide a confirm password", 401));
	}

	if (!newPassword) {
		return next(new AppError("Please provide a new password", 401));
	}

	if (newPassword !== confirmPassword) {
		return next(new AppError("password not Eqaul to confirm password", 401));

	}

	if (!resetToken) {
		return next(new AppError("No resetToken found", 401));
	}

	// ! get the reset token
	const storedHash = await redisClient.get(`resetToken:${userId}`);
	console.log("storedHash", storedHash);

	if (!storedHash) {
		return next(new AppError("Reset Token has Expired", 403));
	}

	// !. verify reset token
	const verifyToken = resetFunc.verifyResetToken(resetToken, storedHash);

	if (!verifyToken) {
		return next(new AppError("You Provided an Invalid Reset Token", 403))
	}

	const user = await prisma.jobSeeker.findUnique({
		where: {
			id: userId,
		}
	})

	if (!user) {
		return next(new AppError("User No Longer Available", 404));
	}

	let hashPassword;
	try {
		hashPassword = await argon2.hash(newPassword, { hashLength: 40 });
	} catch (err) {
		return next(new AppError(err.message, 404));
	}

	await prisma.jobSeeker.update({
		where: {
			email: user.email,
		},
		data: {
			password: hashPassword,
		},
	})

	await redisClient.del(`resetToken:${userId}`)

	res.status(200).json({ status: "success", message: "User Password updated" });
});


// for permission
const accessTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(new AppError("You donot have permission to perform this operation", 403))
		}
		next();
	}
}




module.exports = {
	loginJobSeeker, signUpJobSeeker, protect, forgetPassword, resetPassword, accessTo
}