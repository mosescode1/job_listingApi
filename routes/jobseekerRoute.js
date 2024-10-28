const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const JobSeekerAuthController = require("../controllers/auth/job-seeker-auth");
const JobSeekerController = require("../controllers/jobseeker");
const catchAsync = require("../utils/catchAsync");
const upload = require("../middleware/upload");

// AUTH
router.post(
  "/signup",
  upload.single("file"),
  catchAsync(JobSeekerAuthController.signup)
);
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
  .get("/", catchAsync(JobSeekerController.allJobSeekers))
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
  .patch(
    "/profile/upload",
    authenticate.protect,
    upload.single("file"),
    JobSeekerController.uploadPic
  )
  .delete(
    "/profile",
    catchAsync(authenticate.protect),
    catchAsync(JobSeekerController.deleteJobSeeker)
  );

// JOBSEEKER ACTIVITES
router
//   .get("/:userId", catchAsync(JobSeekerController.viewJobSeeker))
  .get(
    "/applications",
    catchAsync(authenticate.protect),
    catchAsync(JobSeekerController.viewApplications)
  );

module.exports = router;
