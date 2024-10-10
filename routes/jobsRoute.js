const express = require("express");
const router = express.Router();
const jobController = require("../controllers/Jobs/jobController");
const authController = require("../controllers/jobseeker/authController");



router
	.get("/", jobController.jobsAll)
	.get("/:jobId", jobController.jobById)
	.get("/:jobId/apply", authController.protect, jobController.jobApply) // JOB APPLICATION





module.exports = router;