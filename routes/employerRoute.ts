import express from 'express';
import catchAsync from '../utils/catchAsync';
import EmployerAuthController from '../controllers/auth/employer-auth';
import authenticate from '../middleware/authenticate';
import EmployerController from '../controllers/employer';
import JobController from '../controllers/Jobs';

export const employerRouter = express.Router();
// AUTH
employerRouter.post('/signup', catchAsync(EmployerAuthController.signup));
employerRouter.post('/login', catchAsync(EmployerAuthController.login));
employerRouter.post(
	'/forgetPassword',
	catchAsync(EmployerAuthController.forgotPassword)
);
employerRouter.post(
	'/resetPassword/:token',
	catchAsync(EmployerAuthController.resetPassword)
);
employerRouter.post(
	'/refresh',
	catchAsync(EmployerAuthController.newAccessToken)
);
employerRouter.get(
	'/logout',
	catchAsync(authenticate.empProtect),
	catchAsync(EmployerAuthController.logout)
);

//* EMP Profile
employerRouter
	.get('/', catchAsync(EmployerController.allEmployers))
	.get(
		'/profile',
		catchAsync(authenticate.empProtect),
		catchAsync(EmployerController.employerById)
	)
	.patch(
		'/profile',
		catchAsync(authenticate.empProtect),
		catchAsync(EmployerController.updateEmployer)
	)
	.delete(
		'/profile',
		catchAsync(authenticate.empProtect),
		catchAsync(EmployerController.deleteEmployer)
	);

// * Employer JOB OPERATIONS
employerRouter
	.post(
		'/job',
		catchAsync(authenticate.empProtect),
		catchAsync(JobController.createJob)
	)
	.get(
		'/job',
		catchAsync(authenticate.empProtect),
		catchAsync(EmployerController.allEmployerJobs)
	)
	.get(
		'/job/:jobId',
		catchAsync(authenticate.empProtect),
		catchAsync(JobController.jobById)
	)
	.get(
		'/job/:jobId/applicants',
		catchAsync(authenticate.empProtect),
		catchAsync(EmployerController.viewApplicants)
	)
	.get(
		'/job/applicant/:jobSeekerId/:jobId',
		catchAsync(authenticate.empProtect),
		catchAsync(EmployerController.viewApplicantProfile)
	)

	.patch(
		'/job/:jobId',
		catchAsync(authenticate.empProtect),
		catchAsync(JobController.updateJob)
	)
	.patch(
		'/job/:jobId/status/:applicationId',
		catchAsync(authenticate.empProtect),
		catchAsync(JobController.jobStatusUpdate)
	)
	.delete(
		'/job/:jobId',
		catchAsync(authenticate.empProtect),
		catchAsync(JobController.deleteJob)
	);

employerRouter.get(
	'/overview',
	catchAsync(authenticate.empProtect),
	catchAsync(EmployerController.employerOverview)
);
