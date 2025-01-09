import { AppError } from '../utils/AppError';
import { Request, Response, NextFunction } from 'express';

const onlyPermit = (...roles: string[]) => {
	return (req: Request, _: Response, next: NextFunction) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError({
					message: 'You do not have permission to perform this action',
					statusCode: 403,
				})
			);
		}
		next();
	};
};

module.exports = {
	onlyPermit,
};
