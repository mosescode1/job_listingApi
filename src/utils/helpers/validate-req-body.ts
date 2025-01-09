import { Request } from 'express';
import { AppError } from '../AppError';

function validateFields(req: Request, fields: string[]) {
	for (const field of fields) {
		if (!req.body[field]) {
			throw new AppError({
				message: `Missing required field: ${field}`,
				statusCode: 400,
			});
		}
	}
}

export default validateFields;
