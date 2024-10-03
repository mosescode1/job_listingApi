const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");


router.post("/signup", authController.signUpJobSeeker);
router.post("/login", authController.loginJobSeeker);
// router.post("/forgetPassword", authController.forgetPassword);
// router.post("/resetPassword/:token", authController.resetPassword);




router
	.get("/", authController.protect, userController.allJobSeekers)

// router.route("/:id")
// 	.get(userController.getUser)
// 	.patch(userController.updateUser)
// 	.delete(userController.deleteUser)








module.exports = router;