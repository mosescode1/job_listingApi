const express = require("express");
const router = express.Router();
const userController = require("../controllers/jobseeker/userController");
const authController = require("../controllers/jobseeker/authController");

// AUTH
router.post("/signup", authController.signUpJobSeeker);
router.post("/login", authController.loginJobSeeker);
router.post("/forgetPassword", authController.forgetPassword);
router.post("/resetPassword/:token", authController.resetPassword);




router
	.get("/", userController.allJobSeekers)
	.get("/profile", authController.protect, userController.profileMe)
	.patch("/profile", authController.protect, userController.updateProfile)
	.delete("/profile", authController.protect, userController.deleteUser);


// router.route("/:id")
// 	.get(userController.getUser)
// 	.patch(userController.updateUser)
// 	.delete(userController.deleteUser)








module.exports = router;