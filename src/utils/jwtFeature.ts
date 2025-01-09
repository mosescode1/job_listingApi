import jwt from 'jsonwebtoken';
import { Config } from '../config';
import { AppError } from './AppError';

const signToken = (id: string) => {
	return jwt.sign({ id }, Config.jwt.accessSecretToken, {
		expiresIn: Config.jwt.expiry,
	});
};

const refreshToken = (id: string) => {
	return jwt.sign({ id }, Config.jwt.refreshSecretToken, {
		expiresIn: Config.jwt.refreshExpiry,
	});
};

const verifyToken = (token: string) => {
	try {
		return jwt.verify(token, Config.jwt.accessSecretToken);
	} catch (err: any) {
		return new AppError({ message: err.message, statusCode: 404 });
	}
};

const verifyRefreshToken = (token: string) => {
	try {
		return jwt.verify(token, Config.jwt.refreshSecretToken);
	} catch (err: any) {
		return new AppError({ message: err.message, statusCode: 404 });
	}
};

export default {
	signToken,
	verifyToken,
	refreshToken,
	verifyRefreshToken,
};
