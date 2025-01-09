import express from 'express';
import { protect } from '../middleware/authenticate';
import { JobSeekerAuthController } from '../controllers/auth/job-seeker-auth';
import { JobSeekerController } from '../controllers/jobseeker';
import { catchAsync } from '../utils/catchAsync';
import { upload } from '../middleware/upload';

export const jobSeekerRouter = express.Router();
// AUTH
jobSeekerRouter.post(
	'/signup',
	catchAsync(JobSeekerAuthController.signup) as any
);

jobSeekerRouter.post(
	'/login',
	catchAsync(JobSeekerAuthController.login) as any
);

jobSeekerRouter.post(
	'/forgetPassword',
	catchAsync(JobSeekerAuthController.forgotPassword) as any
);
jobSeekerRouter.post(
	'/resetPassword/:token',
	catchAsync(JobSeekerAuthController.resetPassword) as any
);
jobSeekerRouter.post(
	'/refresh',
	catchAsync(JobSeekerAuthController.newAccessToken) as any
);
jobSeekerRouter.get(
	'/logout',
	catchAsync(protect) as any,
	catchAsync(JobSeekerAuthController.logout) as any
);

// JOBSEEKER PROFILE
jobSeekerRouter
	.get('/', catchAsync(JobSeekerController.allJobSeekers) as any)
	.get(
		'/profile',
		catchAsync(protect) as any,
		catchAsync(JobSeekerController.jobSeekerById) as any
	)
	.patch(
		'/profile',
		catchAsync(protect) as any,
		catchAsync(JobSeekerController.updateJobSeeker) as any
	)
	// .patch( // NOTE This route is not implemented in the controller yet
	// 	'/profile/upload',
	// 	catchAsync(protect) as any,
	// 	upload.single('file'),
	// 	catchAsync(JobSeekerController.uploadResume) as any
	// )
	.delete(
		'/profile',
		catchAsync(protect) as any,
		catchAsync(JobSeekerController.deleteJobSeeker) as any
	);

// JOBSEEKER ACTIVITES
jobSeekerRouter
	//   .get("/:userId", catchAsync(JobSeekerController.viewJobSeeker))
	.get(
		'/applications',
		catchAsync(protect) as any,
		catchAsync(JobSeekerController.viewApplications) as any
	);
