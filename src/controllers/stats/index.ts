import { catchAsync } from '../../utils/catchAsync';
import { redisClient } from '../../redis/redisClient';
import { prisma } from '../../../prisma/client';
import { Request, Response, NextFunction } from 'express';

const status = catchAsync(
	async (req: Request, res: Response, _: NextFunction) => {
		const redisStatus = redisClient.isAlive();
		const serverStatus = 'online';
		let prismaStatus;

		try {
			prisma.$connect();
			prismaStatus = 'online';
		} catch (err) {
			prismaStatus = 'offline';
			console.log(err);
		}

		res.status(200).json({
			serverStatus,
			redisStatus,
			prismaStatus,
		});
	}
);

export { status };
