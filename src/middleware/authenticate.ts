import { AppError } from '../utils/AppError';
import jwtFeatures from '../utils/jwtFeature';
import { redisClient } from '../redis/redisClient';
import { prisma } from '../../prisma/client';
import { NextFunction, Request, Response } from 'express';
// const { decode } = require("jsonwebtoken");

/**
 * Protect endpoint
 */

const protect = async (req: Request, _: Response, next: NextFunction) => {
	if (
		!req.headers.authorization ||
		!req.headers.authorization.startsWith('Bearer')
	) {
		return next(
			new AppError({
				message: 'Missing Authentication Header',
				statusCode: 401,
			})
		);
	}

	const token = req.headers.authorization.split(' ')[1];
	const decoded = jwtFeatures.verifyToken(token);

	if (!decoded) {
		return next(
			new AppError({
				message: 'Unauthorized ! No token provided',
				statusCode: 401,
			})
		);
	}

	if (typeof decoded !== 'object' || !('id' in decoded)) {
		return next(new AppError({ message: 'Invalid token', statusCode: 401 }));
	}

	const authTokenKey = `auth:${decoded.id}`;

	const redisToken = await redisClient.get(authTokenKey);

	if (!redisToken) {
		return next(
			new AppError({ message: 'Token has expired', statusCode: 401 })
		);
	}

	const jobseeker = await prisma.jobSeeker.findUnique({
		where: {
			id: decoded.id,
		},
	});

	if (!jobseeker)
		return next(
			new AppError({
				message: 'User with this token is no longer available',
				statusCode: 403,
			})
		);

	req.userId = decoded.id;
	console.log(req.userId);

	//req.app.locals.userId = decoded.id;// set userId in app.locals
	next();
};

const empProtect = async (req: Request, _: Response, next: NextFunction) => {
	if (
		!req.headers.authorization ||
		!req.headers.authorization.startsWith('Bearer')
	) {
		return next(
			new AppError({
				message: 'Missing Authentication Header',
				statusCode: 401,
			})
		);
	}

	const token = req.headers.authorization.split(' ')[1];
	const decoded = jwtFeatures.verifyToken(token);

	if (!decoded) {
		return next(new AppError({ message: 'Unauthorized', statusCode: 401 }));
	}

	if (typeof decoded !== 'object' || !('id' in decoded)) {
		return next(new AppError({ message: 'Invalid token', statusCode: 401 }));
	}

	const authTokenKey = `auth:${decoded.id}`;

	const redisToken = await redisClient.get(authTokenKey);

	if (!redisToken) {
		return next(
			new AppError({ message: 'Token has expired', statusCode: 401 })
		);
	}

	const emp = await prisma.employer.findUnique({
		where: {
			id: decoded.id,
		},
	});

	if (!emp)
		return next(
			new AppError({
				message: 'User with this token is no longer available',
				statusCode: 403,
			})
		);

	req.userId = decoded.id;
	next();
};
export { protect, empProtect };
