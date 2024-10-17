const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const JobController = require("../controllers/Jobs");
const catchAsync = require("../utils/catchAsync");

router
	.get("/", catchAsync(JobController.allJobs))
	.get("/:jobId", catchAsync(JobController.jobById))
	.get(
		"/:jobId/apply",
		catchAsync(authenticate.protect),
		catchAsync(JobController.jobApply)
	);

module.exports = router;
