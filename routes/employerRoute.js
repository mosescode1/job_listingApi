const express = require("express");
const catchAsync = require("../utils/catchAsync");
const router = express.Router();
const EmployerAuthController = require("../controllers/auth/employer-auth");
const authenticate = require("../middleware/authenticate");
const EmployerController = require("../controllers/employer");
const JobController = require("../controllers/Jobs");

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
  catchAsync(authenticate.empProtect),
  catchAsync(EmployerAuthController.logout)
);

//* EMP Profile
router
  .get(
    "/",
    catchAsync(EmployerController.allEmployers)
  )
  .get(
    "/profile",
    catchAsync(authenticate.empProtect),
    catchAsync(EmployerController.employerById)
  )
  .patch(
    "/profile",
    catchAsync(authenticate.empProtect),
    catchAsync(EmployerController.updateEmployer)
  )
  .delete(
    "/profile",
    catchAsync(authenticate.empProtect),
    catchAsync(EmployerController.deleteEmployer)
  );

// * Employer JOB OPERATIONS
router
  .post(
    "/create-job",
    catchAsync(authenticate.empProtect),
    catchAsync(JobController.createJob)
  )
  .get(
    "/job",
    catchAsync(authenticate.empProtect),
    catchAsync(EmployerController.allEmployerJobs)
  )
  .get(
    "/job/:jobId",
    catchAsync(authenticate.empProtect),
    catchAsync(JobController.jobById)
  )
  .get(
    "/job/:jobId/applicants",
    catchAsync(authenticate.empProtect),
    catchAsync(EmployerController.viewApplicants)
  )
  .get(
    "/job/applicant/:jobSeekerId/:jobId",
    catchAsync(authenticate.empProtect),
    catchAsync(EmployerController.viewApplicantProfile)
  )

  .patch(
    "/job/:jobId",
    catchAsync(authenticate.empProtect),
    catchAsync(JobController.updatejob)
  )
  .patch(
    "/job/:jobId/status/:applicationId",
    catchAsync(authenticate.empProtect),
    catchAsync(JobController.jobStatusUpdate)
  )
  .delete(
    "/job/:jobId",
    catchAsync(authenticate.empProtect),
    catchAsync(JobController.deleteJob)
  );

router.get("/overview",
  catchAsync(authenticate.empProtect),
  catchAsync(EmployerController.employerOverview));

module.exports = router;
