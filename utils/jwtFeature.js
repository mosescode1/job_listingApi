const jwt = require("jsonwebtoken");


const signToken = id => {
	return jwt.sign({ id },
		process.env.SECRET_KEY_JWT,
		{
			expiresIn: process.env.SECRET_KEY_JWT_EXPIRES,
		})

}

const verifyToken = token => {
	return jwt.verify(token, process.env.SECRET_KEY_JWT)
}


module.exports = {
	signToken, verifyToken
}