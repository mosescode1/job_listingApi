const express = require("express");
const router = express.Router();
const jobController = require("../controllers/Jobs/jobController");



router
	.get("/", jobController.jobsAll)
	.get("/:jobId", jobController.jobById)





module.exports = router;