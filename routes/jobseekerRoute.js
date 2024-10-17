const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const JobSeekerAuthController = require("../controllers/auth/job-seeker-auth");
const JobSeekerController = require("../controllers/jobseeker");
const catchAsync = require("../utils/catchAsync");

// AUTH
router.post("/signup", catchAsync(JobSeekerAuthController.signup));
router.post("/login", catchAsync(JobSeekerAuthController.login));
router.post(
	"/forgetPassword",
	catchAsync(JobSeekerAuthController.forgotPassword)
);
router.post(
	"/resetPassword/:token",
	catchAsync(JobSeekerAuthController.resetPassword)
);
router.post("/refresh", catchAsync(JobSeekerAuthController.newAccessToken));
router.get(
	"/logout",
	catchAsync(authenticate.protect),
	catchAsync(JobSeekerAuthController.logout)
);

// JOBSEEKER PROFILE
router
	.get(
		"/",
		catchAsync(authenticate.protect),
		catchAsync(JobSeekerController.allJobSeekers)
	)
	.get(
		"/profile",
		catchAsync(authenticate.protect),
		catchAsync(JobSeekerController.jobSeekerById)
	)
	.patch(
		"/profile",
		catchAsync(authenticate.protect),
		catchAsync(JobSeekerController.updateJobSeeker)
	)
	.delete(
		"/profile",
		catchAsync(authenticate.protect),
		catchAsync(JobSeekerController.deleteJobSeeker)
	);

module.exports = router;
