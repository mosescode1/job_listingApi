const express = require("express");
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const EmployerAuthController = require("../controllers/auth/employer-auth");
const authenticate = require("../middleware/authenticate");
const EmployerController = require("../controllers/employer");

// AUTH
router.post("/signup", catchAsync(EmployerAuthController.signup));
router.post("/login", catchAsync(EmployerAuthController.login));
router.post(
	"/forgetPassword",
	catchAsync(EmployerAuthController.forgotPassword)
);
router.post(
	"/resetPassword/:token",
	catchAsync(EmployerAuthController.resetPassword)
);
router.post("/refresh", catchAsync(EmployerAuthController.newAccessToken));
router.get(
	"/logout",
	catchAsync(authenticate.protect),
	catchAsync(EmployerAuthController.logout)
);

// EMP Profile
router
	.get(
		"/",
		catchAsync(authenticate.protect),
		catchAsync(EmployerController.allEmployers)
	)
	.get(
		"/profile",
		catchAsync(authenticate.protect),
		catchAsync(EmployerController.employerById)
	)
	.patch(
		"/profile",
		catchAsync(authenticate.protect),
		catchAsync(EmployerController.updateEmployer)
	)
	.delete(
		"/profile",
		catchAsync(authenticate.protect),
		catchAsync(EmployerController.deleteEmployer)
	);

//// Employer JOB OPERATIONS
router
	.post(
		"/job",
		catchAsync(authenticate.protect),
		catchAsync(EmployerController.createJob)
	)
	.get(
		"/job",
		catchAsync(authenticate.protect),
		catchAsync(EmployerController.allEmployerJobs)
	)
	.get(
		"/job/:jobId",
		catchAsync(authenticate.protect),
		catchAsync(EmployerController.employerById)
	)
	.patch(
		"/job/:jobId",
		catchAsync(authenticate.protect),
		catchAsync(EmployerController.updatejob)
	)
	.delete(
		"/job/:jobId",
		catchAsync(authenticate.protect),
		catchAsync(EmployerController.deleteJob)
	);

module.exports = router;
