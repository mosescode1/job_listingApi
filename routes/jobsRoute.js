const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const JobController = require("../controllers/Jobs");
const catchAsync = require("../utils/catchAsync");

router
	.get("/", catchAsync(JobController.allJobs))
	.get("/categories", catchAsync(JobController.JobCategories))
	.get("/:jobId", catchAsync(JobController.jobById))
	.post(
		"/:jobId/apply",
		catchAsync(authenticate.protect),
		catchAsync(JobController.jobApply)
	);


module.exports = router;
