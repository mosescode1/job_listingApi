import express from 'express';
import authenticate from '../middleware/authenticate';
import JobController from '../controllers/Jobs';
import catchAsync from '../utils/catchAsync';

export const jobRouter = express.Router();

jobRouter
	.get('/', catchAsync(JobController.allJobs))
	.get('/categories', catchAsync(JobController.JobCategories))
	.get('/:jobId', catchAsync(JobController.jobById))
	.post(
		'/:jobId/apply',
		catchAsync(authenticate.protect),
		catchAsync(JobController.jobApply)
	);
