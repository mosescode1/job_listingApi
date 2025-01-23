import argon2 from 'argon2';
import jwtFeatures from '../../utils/jwtFeature';
import { redisClient } from '../../redis/redisClient';
import validateFields from '../../utils/helpers/validate-req-body';
import { prisma } from '../../../prisma/client';
import { AppError } from '../../utils/AppError';
import { generateResetToken, verifyResetToken } from '../../utils/resetToken';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

class EmployerAuthController {
	/**config
	 * Create new employer account
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 * @returns
	 */
	static async signup(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<any> {
		validateFields(req, [
			'email',
			'password',
			'companyName',
			'companyAddress',
			'companyDescription',
		]);
		const { email, password, companyName, companyAddress, companyDescription } =
			req.body;

		const findEmp = await prisma.employer.findUnique({
			where: {
				email: email,
			},
		});

		if (findEmp) {
			return next(
				new AppError({ message: 'Employer already exists', statusCode: 400 })
			);
		}

		let hashPassword: string;
		try {
			hashPassword = await argon2.hash(password, { hashLength: 40 });
		} catch (err: any) {
			return next(new AppError({ message: err.message, statusCode: 404 }));
		}

		const emp = await prisma.employer.create({
			data: {
				email,
				companyName,
				password: hashPassword,
				companyAddress,
				companyWebsite: req.body.companyWebsite || null,
				phone: req.body.phone || null,
				companyDescription,
				avatarUrl: req.body.avatarUrl || null,
			},
		});

		(emp as any).password = undefined;
		res.status(201).json({
			status: 'OK',
			message: 'Employer account created successfully.',
			data: {
				employer: emp,
			},
		});
	}

	/**
	 * Sign in employer
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 * @returns
	 */
	static async login(req: Request, res: Response, next: NextFunction) {
		validateFields(req, ['email', 'password']);
		const { email, password } = req.body;

		const emp = await prisma.employer.findUnique({
			where: {
				email: email,
			},
			select: {
				password: true,
				id: true,
				email: true,
				companyName: true,
				companyWebsite: true,
				companyAddress: true,
				phone: true,
				companyDescription: true,
				avatarUrl: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!emp) {
			return next(
				new AppError({ message: 'Employer not found', statusCode: 404 })
			);
		}

		const verified = await argon2.verify(emp.password, password);

		if (!verified) {
			return next(
				new AppError({ message: 'Invalid credentials', statusCode: 401 })
			);
		}

		const token = await jwtFeatures.signToken(emp.id);
		const refreshToken = await jwtFeatures.refreshToken(emp.id);

		await prisma.employer.update({
			where: { email: email },
			data: { refreshToken },
		});

		const authTokenKey = `auth:${emp.id}`;
		await redisClient.set(authTokenKey, refreshToken, 60 * 60 * 24 * 30);

		emp.password = null as any;
		res.status(200).json({
			status: 'OK',
			message: 'Login successful.',
			accessToken: token,
			refreshToken,
			data: { employer: emp },
		});
	}

	/**
	 * Log employer out
	 * @param {req} req
	static async logout(req: CustomRequest, res: Response, next: NextFunction) {
	 * @param {next} next
	 * @returns
	 */
	static async logout(req: Request, res: Response, next: NextFunction) {
		try {
			const empId = req.userId;
			const authTokenKey = `auth:${empId}`;
			await redisClient.del(authTokenKey);
			await prisma.jobSeeker.update({
				where: {
					id: empId,
				},
				data: {
					refreshToken: null,
				},
			});

			res.status(200).json({ message: 'Logged out successfully' });
		} catch (err: any) {
			return next(new AppError({ message: err.message, statusCode: 404 }));
		}
	}

	/**
	 * Generate new access token
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 * @returns
	 */

	static async newAccessToken(req: Request, res: Response, next: NextFunction) {
		validateFields(req, ['refreshToken']);
		const { refreshToken } = req.body;
		const emp = await prisma.employer.findFirst({
			where: { refreshToken },
		});
		if (!emp)
			return next(
				new AppError({ message: 'Invalid refresh token', statusCode: 401 })
			);

		const decoded = await jwtFeatures.verifyRefreshToken(refreshToken);
		if (!decoded)
			return next(
				new AppError({ message: 'Invalid Refresh token', statusCode: 401 })
			);

		const newAccessToken = jwtFeatures.signToken(emp.id);
		res.status(200).json({ accessToken: newAccessToken });
	}

	/**
	 *
	 * @param {req} req
	 * @param {res} res
	 * @param {next} next
	 * @returns
	 */

	static async forgotPassword(req: Request, res: Response, next: NextFunction) {
		validateFields(req, ['email']);

		const { email } = req.body;
		const emp = await prisma.employer.findUnique({
			where: {
				email: email,
			},
		});

		if (!emp) {
			return next(
				new AppError({
					message: `Employer with ${email} doesnot Exist`,
					statusCode: 404,
				})
			);
		}

		const resetToken = crypto.randomBytes(32).toString('hex');
		const token = generateResetToken(resetToken);

		await redisClient.set(`resetToken:${emp.id}`, token, 60 * 60);

		const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/employer/resetPassword/${resetToken}?emp_id=${emp.id}`;

		res.status(200).json({
			status: 'success',
			message: 'Kindly reset your password using the link provided.',
			resetUrl,
			resetToken,
		});
	}

	static async resetPassword(req: Request, res: Response, next: NextFunction) {
		const resetToken = req.params.token;
		const empId = req.query.emp_id as string;

		if (!empId) {
			return next(
				new AppError({ message: 'Invalid reset token', statusCode: 400 })
			);
		}

		validateFields(req, ['newPassword', 'confirmPassword']);
		const { newPassword, confirmPassword } = req.body;

		if (newPassword !== confirmPassword) {
			return next(
				new AppError({ message: 'Passwords do not match', statusCode: 400 })
			);
		}

		if (!resetToken) {
			return next(
				new AppError({ message: 'Invalid reset token', statusCode: 400 })
			);
		}

		const storedHash = await redisClient.get(`resetToken:${empId}`);

		if (!storedHash) {
			return next(
				new AppError({ message: 'Invalid reset token', statusCode: 403 })
			);
		}

		// !. verify reset token
		const verifyToken = verifyResetToken(resetToken, storedHash);

		if (!verifyToken) {
			return next(
				new AppError({ message: 'Invalid reset token', statusCode: 403 })
			);
		}

		const emp = await prisma.employer.findUnique({
			where: {
				id: empId,
			},
		});

		if (!emp) {
			return next(
				new AppError({ message: 'Employer not found', statusCode: 404 })
			);
		}

		let hashPassword;
		try {
			hashPassword = await argon2.hash(newPassword, { hashLength: 40 });
		} catch (err: any) {
			return next(new AppError({ message: err.message, statusCode: 404 }));
		}

		await prisma.employer.update({
			where: {
				email: emp.email,
			},
			data: {
				password: hashPassword,
			},
		});

		await redisClient.del(`resetToken:${empId}`);

		res.status(200).json({
			status: 'success',
			message: 'Employer Password updated successfully.',
		});
	}
}

export default EmployerAuthController;
