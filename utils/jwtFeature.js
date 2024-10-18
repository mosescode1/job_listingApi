const jwt = require("jsonwebtoken");
const config = require("../@config");
const AppError = require("./AppError");


const signToken = id => {
	return jwt.sign({ id },
		config.jwt.accessSecretToken,
		{
			expiresIn: config.jwt.expiry,
		})

}


const refreshToken = id => {
	return jwt.sign(
		{ id },
		config.jwt.refreshSecretToken,
		{
			expiresIn: config.jwt.refreshExpiry,
		}
	);
}

const verifyToken = token => {
	try {
		return jwt.verify(token, config.jwt.accessSecretToken);
	} catch (err) {
		return new AppError(err.message, 404);
	}
}

const verifyRefreshToken = (token) => {
	try {
		return jwt.verify(token, config.jwt.refreshSecretToken);
	}
	catch (err) {
		return new AppError(err.message, 404);
	}
};

module.exports = {
	signToken,
	verifyToken,
	refreshToken,
	verifyRefreshToken,
};