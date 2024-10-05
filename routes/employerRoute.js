const express = require("express");
const router = express.Router();
const empAuthController = require("../controllers/employer/empAuthController");
const empController = require("../controllers/employer/empController");

// AUTH
router.post("/signup", empAuthController.signUpEmployer);
router.post("/login", empAuthController.loginEmp);
router.post("/forgetPassword", empAuthController.forgetPassword);
router.post("/resetPassword/:token", empAuthController.resetPassword);




router
	.get("/", empController.allEmployers)
	.get("/profile", empAuthController.protect, empController.profileMe)
	.patch("/profile", empAuthController.protect, empController.updateProfile)
	.delete("/profile", empAuthController.protect, empController.deleteUser);

router
	.post("/job", empAuthController.protect, empController.createJob)
	.get("/job", empAuthController.protect, empController.empJobs)
	.get("/job/:jobId", empAuthController.protect, empController.singleJob)
	.patch("/job/:jobId", empAuthController.protect, empController.updateJob)
	.delete("/job/:jobId", empAuthController.protect, empController.deleteJob)



module.exports = router;