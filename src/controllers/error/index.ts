import { AppError } from '../../utils/AppError';
import { Config } from '../../config';
import { Response, ErrorRequestHandler } from 'express';

const errProd = (err: any, res: Response) => {
	// Operational errors we want to display to the client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	} else {
		// Log the error (can be sent to a monitoring service here)
		console.error('ERROR 💥:', err);
		// Send a generic error message to the client
		res.status(500).json({
			status: 'error',
			message: 'Something went wrong!',
		});
	}
};

const errDev = (err: any, res: Response) => {
	console.log(err);
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		//stack: err.stack,
	});
};

const prismaClientValidationError = () => {
	return new AppError({ message: 'Wrong Infomation passed', statusCode: 404 });
};

const handleJsonWebTokenError = () => {
	return new AppError({
		message: 'Please provide a valid json token',
		statusCode: 401,
	});
};

export const globalError: ErrorRequestHandler = (err, _, res) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (res.headersSent) {
		return;
	}

	if (Config.environment === 'development') {
		errDev(err, res);
	} else if (Config.environment === 'production') {
		// Create a copy of the error object to handle properties safely
		let error: any = { ...err };
		error.message = err.message || 'An unknown error occurred';

		if (err.name === 'JsonWebTokenError') {
			error = handleJsonWebTokenError();
		}
		if (err.name === 'TokenExpiredError') {
			error = handleJsonWebTokenError();
		}
		if (err.name === 'PrismaClientValidationError') {
			error = prismaClientValidationError();
		}
		errProd(error, res);
	}
};
