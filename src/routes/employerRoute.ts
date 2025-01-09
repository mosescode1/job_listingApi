import express from 'express';
import { catchAsync } from '../utils/catchAsync';
import EmployerAuthController from '../controllers/auth/employer-auth';
import { empProtect } from '../middleware/authenticate';
import EmployerController from '../controllers/employer';
import { JobController } from '../controllers/Jobs';

export const employerRouter = express.Router();
// AUTH
employerRouter.post(
	'/signup',
	catchAsync(EmployerAuthController.signup) as any
);
employerRouter.post('/login', catchAsync(EmployerAuthController.login) as any);
employerRouter.post(
	'/forgetPassword',
	catchAsync(EmployerAuthController.forgotPassword) as any
);
employerRouter.post(
	'/resetPassword/:token',
	catchAsync(EmployerAuthController.resetPassword) as any
);
employerRouter.post(
	'/refresh',
	catchAsync(EmployerAuthController.newAccessToken) as any
);
employerRouter.get(
	'/logout',
	catchAsync(empProtect) as any,
	catchAsync(EmployerAuthController.logout) as any
);

//* EMP Profile
employerRouter
	.get('/', catchAsync(EmployerController.allEmployers) as any)
	.get(
		'/profile',
		catchAsync(empProtect) as any,
		catchAsync(EmployerController.employerById) as any
	)
	.patch(
		'/profile',
		catchAsync(empProtect) as any,
		catchAsync(EmployerController.updateEmployer) as any
	)
	.delete(
		'/profile',
		catchAsync(empProtect) as any,
		catchAsync(EmployerController.deleteEmployer) as any
	);

// * Employer JOB OPERATIONS
employerRouter
	.post(
		'/job',
		catchAsync(empProtect) as any,
		catchAsync(JobController.createJob) as any
	)
	.get(
		'/job',
		catchAsync(empProtect) as any,
		catchAsync(EmployerController.allEmployerJobs) as any
	)
	.get(
		'/job/:jobId',
		catchAsync(empProtect) as any,
		catchAsync(JobController.jobById) as any
	)
	.get(
		'/job/:jobId/applicants',
		catchAsync(empProtect) as any,
		catchAsync(EmployerController.viewApplicants) as any
	)
	.get(
		'/job/applicant/:jobSeekerId/:jobId',
		catchAsync(empProtect) as any,
		catchAsync(EmployerController.viewApplicantProfile) as any
	)

	.patch(
		'/job/:jobId',
		catchAsync(empProtect) as any,
		catchAsync(JobController.updateJob) as any
	)
	.patch(
		'/job/:jobId/status/:applicationId',
		catchAsync(empProtect) as any,
		catchAsync(JobController.jobStatusUpdate) as any
	)
	.delete(
		'/job/:jobId',
		catchAsync(empProtect) as any,
		catchAsync(JobController.deleteJob) as any
	);

employerRouter.get(
	'/overview',
	catchAsync(empProtect) as any,
	catchAsync(EmployerController.employerOverview) as any
);
