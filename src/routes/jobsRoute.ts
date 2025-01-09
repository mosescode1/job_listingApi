import express from 'express';
import { protect } from '../middleware/authenticate';
import { JobController } from '../controllers/Jobs';
import { catchAsync } from '../utils/catchAsync';

export const jobRouter = express.Router();

jobRouter
	.get('/', catchAsync(JobController.allJobs) as any)
	.get('/categories', catchAsync(JobController.JobCategories) as any)
	.get('/:jobId', catchAsync(JobController.jobById) as any)
	.post(
		'/:jobId/apply',
		catchAsync(protect) as any,
		catchAsync(JobController.jobApply) as any
	);
