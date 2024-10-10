const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const prisma = require("../../prisma/client");
const argon2 = require("argon2");
const jwtFeatures = require("../../utils/jwtFeature");
const redisClient = require("../../redis/redisClient");
const resetFunc = require("../../utils/resetToken");
const crypto = require("crypto");

// * EMPLOYER CREATION
const signUpEmployer = catchAsync(async (req, res, next) => {
	const { email, password, companyName } = req.body;

	if (!email || !password || !companyName) {
		return next(new AppError("Missing Important Fields", 404));
	}

	const findEmp = await prisma.employer.findUnique({
		where: {
			email: email,
		},
	})

	if (findEmp) {
		return next(new AppError("Employer with this email already exists", 404));
	}

	// hashPassword
	let hashPassword;
	try {
		hashPassword = await argon2.hash(password, { hashLength: 40 });
	} catch (err) {
		return next(new AppError(err.message, 404));
	}

	const emp = await prisma.employer.create({
		data: {
			email,
			companyName,
			password: hashPassword,
			companyWebsite: req.body.companyWebsite || null, // Optional company website URL
			location: req.body.location || null,  // Optional location of the company
			phone: req.body.phone || null,  // Optional phone number
			bio: req.body.bio || null,  // Optional Company description
			avatarUrl: req.body.avatarUrl || null, // Optional avatar

		}
	})

	// ! Did this maybe after register route to the dashbord immediately without login
	// const token = await jwtFeatures.signToken(jobSeeker.id)
	// const authTokenKey = `auth:${jobSeeker.id}`;
	// await redisClient.set(authTokenKey, token, 60 * 60 * 24);

	// ! hides jobseeker password
	emp.password = undefined;
	res.status(201).json({
		status: "OK",
		data: {
			employer: emp,
		},
		// token
	})
})


// *  LOGIN EMP
const loginEmp = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new AppError("Missing Important Fields", 404));
	}

	const emp = await prisma.employer.findUnique({
		where: {
			email: email
		},
		select: {
			password: true,
			id: true,
			email: true,
			companyName: true,
			companyWebsite: true,
			location: true,
			phone: true,
			bio: true,
			avatarUrl: true,
			createdAt: true,
			updatedAt: true,

		}
	})

	if (!emp) {
		return next(new AppError(`No user Found with the email: ${email}`, 404));
	}

	const verified = await argon2.verify(emp.password, password);

	if (!verified) {
		return next(new AppError("Wrong Password", 403))
	}

	const token = await jwtFeatures.signToken(emp.id);
	const refreshToken = await jwtFeatures.refreshToken(emp.id);

	await prisma.employer.update({
		where: { email: email },
		data: { refreshToken }
	});

	const authTokenKey = `auth:${emp.id}`;
	await redisClient.set(authTokenKey, token, 60 * 60);

	//hide password
	emp.password = undefined;
	res.status(200).json({ status: "OK", token, data: { employer: emp } });
})


// * Logout Employer
const logoutEmployer = catchAsync(async (req, res, next) => {
	const empId = req.empId;

	if (!empId) {
		return next(new AppError("Missing Employer Id", 404));
	}

	// SET REFRESH TOKEN TO NULL
	await prisma.jobSeeker.update({
		where: {
			id: empId,
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
	const user = await prisma.employer.findFirst({ where: { refreshToken } });
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
		return next(new AppError("Missing Authentication Header", 403));
	}

	const token = req.headers.authorization.split(" ")[1];

	const decoded = jwtFeatures.verifyToken(token);
	const authTokenKey = `auth:${decoded.id}`;

	const redisToken = await redisClient.get(authTokenKey);
	if (!redisToken) {
		return next(new AppError("Token has expired",))
	}

	try {
		await prisma.employer.findUniqueOrThrow({
			where: {
				id: decoded.id,
			}
		})
	} catch (err) {
		return next(new AppError("Employer with this token is no longer available", 401))
	}


	// ! pass the current empId to the next middleware
	req.empId = decoded.id;
	next()
})


// * Forgotten Password

const forgetPassword = catchAsync(async (req, res, next) => {
	const { email } = req.body;

	if (!email) {
		return next(new AppError("Please Provide an Email", 404));
	}

	const emp = await prisma.employer.findUnique({
		where: {
			email: email
		}
	})

	if (!emp) {
		return next(new AppError("emp With this Email doesnot Exist", 404));
	}

	const resetToken = crypto.randomBytes(32).toString("hex");
	const token = resetFunc.generateResetToken(resetToken);

	await redisClient.set(`resetToken:${emp.id}`, token, 60 * 60);

	const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/employer/resetPassword/${resetToken}?emp_id=${emp.id}`

	res.status(200).json({ status: "success", resetUrl, resetToken });
})



// * RESET PASSWORD
const resetPassword = catchAsync(async (req, res, next) => {
	const resetToken = req.params.token;
	const empId = req.query.emp_id;
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
	const storedHash = await redisClient.get(`resetToken:${empId}`);

	if (!storedHash) {
		return next(new AppError("Reset Token has Expired", 403));
	}

	// !. verify reset token
	const verifyToken = resetFunc.verifyResetToken(resetToken, storedHash);

	if (!verifyToken) {
		return next(new AppError("You Provided an Invalid Reset Token", 403))
	}

	const emp = await prisma.employer.findUnique({
		where: {
			id: empId,
		}
	})

	if (!emp) {
		return next(new AppError("Employer No Longer Available", 404));
	}

	let hashPassword;
	try {
		hashPassword = await argon2.hash(newPassword, { hashLength: 40 });
	} catch (err) {
		return next(new AppError(err.message, 404));
	}

	await prisma.employer.update({
		where: {
			email: emp.email,
		},
		data: {
			password: hashPassword,
		},
	})

	await redisClient.del(`resetToken:${empId}`)

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
	signUpEmployer, loginEmp, protect, forgetPassword,
	resetPassword, accessTo, newTokenGeneration, logoutEmployer
}