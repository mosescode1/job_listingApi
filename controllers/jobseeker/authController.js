const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const prisma = require("../../prisma/client");
const argon2 = require("argon2");
const jwtFeatures = require("../../utils/jwtFeature");
const redisClient = require("../../redis/redisClient");
const resetFunc = require("../../utils/resetToken");
const crypto = require("crypto");

// * jOBSEEKER CREATION
const signUpJobSeeker = catchAsync(async (req, res, next) => {
	const { email, password, firstName, lastName, phone, gender, address, jobTitle } = req.body;

	if (!email || !password) {
		return next(new AppError("Email or Password Missing", 404));
	}

	if (!firstName || !lastName) {
		return next(new AppError("firstName and lastName Missing", 404))
	}

	if (!phone || !gender || !address || !jobTitle) {
		return next(new AppError("phone , address, gender, or jobTitle Missing", 404))
	}

	//  Check if User Already Exists
	const findUser = await prisma.jobSeeker.findUnique({
		where: {
			email: email,
		},
	})

	if (findUser) {
		return next(new AppError("JobSeeker with this email already exists", 404));
	}

	// Jash User Password
	let hashPassword;
	try {
		hashPassword = await argon2.hash(password, { hashLength: 40 });
	} catch (err) {
		return next(new AppError(err.message, 404));
	}

	// Create User
	const jobSeeker = await prisma.jobSeeker.create({
		data: {
			firstName,
			email,
			lastName,
			phone,
			jobTitle,
			cv: req.body.cv || null,
			password: hashPassword,
			bio: req.body.bio || null,
			resumeUrl: req.body.resumeUrl || null,
			avatarUrl: req.body.avatarUrl || null,

			address: req.body.address ? {
				create: req.body.address
			} : undefined,  // Handle null or empty array

			experience: req.body.experience?.length ? {
				create: req.body.experience
			} : undefined,

			education: req.body.education?.length ? {
				create: req.body.education
			} : undefined,

			portfolio: req.body.portfolio?.length ? {
				create: req.body.portfolio
			} : undefined,

			certification: req.body.certification?.length ? {
				create: req.body.certification
			} : undefined,  // Fixed to include `create`

			skills: req.body.skills?.length ? {
				create: req.body.skills
			} : undefined
		}
	});

	// ! hides jobseeker password
	jobSeeker.password = undefined;
	// RESPONSE

	res.status(201).json({
		status: "OK",
		data: {
			jobSeeker,
		},
	})
})




// * jOBSEEKER LOGIN
const loginJobSeeker = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// INPUT VALIDATION
	if (!email || !password) {
		return next(new AppError("Missing Important Fields", 404));
	}

	// FIND USER AND RETURN SELECTED FIELDS
	const jobSeeker = await prisma.jobSeeker.findUnique({
		where: {
			email: email
		},
		select: {
			password: true,
			id: true,
			email: true,
			jobTitle: true,
			cv: true,
			firstName: true,
			lastName: true,
			phone: true,
			bio: true,
			resumeUrl: true,
			avatarUrl: true,
			createdAt: true,
			updatedAt: true,
		}
	})

	// NO USER == ERROR
	if (!jobSeeker) {
		return next(new AppError(`No user Found with the email: ${email}`, 404));
	}

	// VERIFY PASSWORD
	const verified = await argon2.verify(jobSeeker.password, password);
	if (!verified) {
		return next(new AppError("Wrong Password", 403))
	}

	const token = await jwtFeatures.signToken(jobSeeker.id)
	const refreshToken = await jwtFeatures.refreshToken(jobSeeker.id);

	// UPDATE REFRESH TOKEN IN THE USER DATABASE
	await prisma.jobSeeker.update({
		where: { email: email },
		data: { refreshToken }
	});

	// STORE TOKEN IN REDIS
	const authTokenKey = `auth:${jobSeeker.id}`;
	await redisClient.set(authTokenKey, token, 60 * 60 * 1);

	jobSeeker.password = undefined; // Hide password

	res.status(200).json({ status: "OK", accessToken: token, refreshToken, data: { jobSeeker } })
})



// * Logout JobSeeker
const logoutJobSeeker = catchAsync(async (req, res, next) => {
	const userId = req.userId;

	// SET REFRESH TOKEN TO NULL
	await prisma.jobSeeker.update({
		where: {
			id: userId,
		},
		data: {
			refreshToken: null
		}
	})
	res.status(200).json({ message: 'Logged out successfully' });
})




// * NEW TOKEN
const newTokenGeneration = catchAsync(async (req, res, next) => {
	// CHECK IF REFRSH TOKEN IS PROVIDED
	const { refreshToken } = req.body;
	if (!refreshToken) return res.status(401).json({ message: 'No token provided' });

	// Gets user with That database
	const user = await prisma.jobSeeker.findFirst({ where: { refreshToken } });
	if (!user) return res.status(403).json({ message: 'Invalid token' });


	// Verify the refresh token
	const decoded = await jwtFeatures.verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
	if (!decoded) return next(new AppError("Refresh Token Expired", 403));

	// Generate a new access token
	const newAccessToken = jwtFeatures.signToken(user.id);
	// Send Response
	res.status(200).json({ accessToken: newAccessToken });
})


// * AUTHENTICATION
const protect = catchAsync(async (req, res, next) => {
	if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
		return next(new AppError("Missing Authentication Header", 401));
	}

	const token = req.headers.authorization.split(" ")[1];

	const decoded = jwtFeatures.verifyToken(token);
	const authTokenKey = `auth:${decoded.id}`;

	const redisToken = await redisClient.get(authTokenKey);
	if (!redisToken) {
		return next(new AppError("Token has expired",))
	}

	try {
		await prisma.jobSeeker.findUniqueOrThrow({
			where: {
				id: decoded.id,
			}
		})
	} catch (err) {
		return next(new AppError("Jobseeker with this token is no longer available", 401))
	}

	// ! pass the current userId to the next middleware
	req.userId = decoded.id;
	next()
})



// * Forgotten Password
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



// * RESET PASSWORD
const resetPassword = catchAsync(async (req, res, next) => {
	const resetToken = req.params.token;
	const userId = req.query.user_id;
	const newPassword = req.body.newPassword;
	const confirmPassword = req.body.confirmPassword;

	if (!confirmPassword) {
		return next(new AppError("Please provide a confirm password", 400));
	}

	if (!newPassword) {
		return next(new AppError("Please provide a new password", 400));
	}

	if (newPassword !== confirmPassword) {
		return next(new AppError("password not Eqaul to confirm password", 400));

	}

	if (!resetToken) {
		return next(new AppError("No resetToken found", 404));
	}

	// ! get the reset token
	const storedHash = await redisClient.get(`resetToken:${userId}`);
	console.log("storedHash", storedHash);

	if (!storedHash) {
		return next(new AppError("Reset Token has Expired", 404));
	}

	// !. verify reset token
	const verifyToken = resetFunc.verifyResetToken(resetToken, storedHash);

	if (!verifyToken) {
		return next(new AppError("You Provided an Invalid Reset Token", 404))
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


// * for permission
const accessTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(new AppError("You donot have permission to perform this operation", 403))
		}
		next();
	}
}




module.exports = {
	loginJobSeeker, signUpJobSeeker, protect,
	forgetPassword, resetPassword, accessTo,
	logoutJobSeeker, newTokenGeneration
}