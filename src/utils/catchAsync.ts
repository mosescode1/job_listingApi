import { NextFunction, Request, Response } from 'express';

/**
 * Catch async errors
 */
const catchAsync = (
	fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
	return (req: Request, res: Response, next: NextFunction): Promise<any> => {
		return fn(req, res, next).catch(next);
	};
};

export { catchAsync };
