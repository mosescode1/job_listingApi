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

module.exports = {
	signToken, verifyToken, refreshToken
}