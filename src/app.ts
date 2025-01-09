import express, { Application, Express } from 'express';
import { globalError } from './controllers/error';
import { AppError } from './utils/AppError';
import { statsRouter } from './routes/stats';
import { jobSeekerRouter } from './routes/jobseekerRoute';
import { employerRouter } from './routes/employerRoute';
import { jobRouter } from './routes/jobsRoute';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
export const app: Application = express();

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: 'Too many requests, please try again later.',
});

// Apply the rate limiter to all requests
app.use(limiter);
// Handler for Errors
// * Routes
app.use('/api/v1/status', statsRouter);
app.use('/api/v1/user', jobSeekerRouter);
app.use('/api/v1/employer', employerRouter);
app.use('/api/v1/job', jobRouter);

// Handling undefined Routes
app.use('*', (req, _, next) => {
	next(
		new AppError({
			message: `Route Not Found ${req.originalUrl}`,
			statusCode: 404,
		})
	);
});

app.use(globalError);
