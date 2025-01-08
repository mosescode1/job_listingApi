import express from 'express';
import authenticate from '../middleware/authenticate';
import JobSeekerAuthController from '../controllers/auth/job-seeker-auth';
import JobSeekerController from '../controllers/jobseeker';
import catchAsync from '../utils/catchAsync';
import upload from '../middleware/upload';

export const jobSeekerRouter = express.Router();
// AUTH
jobSeekerRouter.post('/signup', catchAsync(JobSeekerAuthController.signup));
jobSeekerRouter.post('/login', catchAsync(JobSeekerAuthController.login));
jobSeekerRouter.post(
	'/forgetPassword',
	catchAsync(JobSeekerAuthController.forgotPassword)
);
jobSeekerRouter.post(
	'/resetPassword/:token',
	catchAsync(JobSeekerAuthController.resetPassword)
);
jobSeekerRouter.post(
	'/refresh',
	catchAsync(JobSeekerAuthController.newAccessToken)
);
jobSeekerRouter.get(
	'/logout',
	catchAsync(authenticate.protect),
	catchAsync(JobSeekerAuthController.logout)
);

// JOBSEEKER PROFILE
jobSeekerRouter
	.get('/', catchAsync(JobSeekerController.allJobSeekers))
	.get(
		'/profile',
		catchAsync(authenticate.protect),
		catchAsync(JobSeekerController.jobSeekerById)
	)
	.patch(
		'/profile',
		catchAsync(authenticate.protect),
		catchAsync(JobSeekerController.updateJobSeeker)
	)
	.patch(
		'/profile/upload',
		authenticate.protect,
		upload.single('file'),
		JobSeekerController.uploadPic
	)
	.delete(
		'/profile',
		catchAsync(authenticate.protect),
		catchAsync(JobSeekerController.deleteJobSeeker)
	);

// JOBSEEKER ACTIVITES
jobSeekerRouter
	//   .get("/:userId", catchAsync(JobSeekerController.viewJobSeeker))
	.get(
		'/applications',
		catchAsync(authenticate.protect),
		catchAsync(JobSeekerController.viewApplications)
	);
