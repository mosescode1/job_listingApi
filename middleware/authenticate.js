const AppError = require("../utils/AppError");
const jwtFeatures = require("../utils/jwtFeature");
const redisClient = require("../redis/redisClient");
const prisma = require("../prisma/client");
const config = require("../@config");


/**
 * Protect endpoint
 */
const protect = async (req, _, next) => {
	if (
		!req.headers.authorization ||
		!req.headers.authorization.startsWith("Bearer")
	) {
		return next(new AppError("Missing Authentication Header", 401));
	}

	const token = req.headers.authorization.split(" ")[1];
	const decoded = jwtFeatures.verifyToken(
		token,
		config.jwt.accessSecretToken
	);

	if (!decoded) {
		return next(new AppError("Unauthorized ! No token provided", 401));
	}
	const authTokenKey = `auth:${decoded.id}`;
	const redisToken = await redisClient.get(authTokenKey);
	if (!redisToken) {
		return next(new AppError("Token has expired", 403));
	}

	try {
		await prisma.jobSeeker.findUnique({
			where: {
				id: decoded.id,
			},
		});
	} catch (err) {
		return next(
			new AppError(
				"User with this token is no longer available",
				403
			)
		);
	}

	req.userId = decoded.id;
	next();
};

module.exports = {
	protect,
};
