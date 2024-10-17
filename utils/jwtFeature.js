const jwt = require("jsonwebtoken");
const config = require("../@config");


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
	return jwt.verify(token, config.jwt.accessSecretToken);
}

const verifyRefreshToken = (token) => {
	return jwt.verify(token, config.jwt.refreshSecretToken);
};

module.exports = {
	signToken,
	verifyToken,
	refreshToken,
	verifyRefreshToken,
};