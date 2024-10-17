const catchAsync = require("../../utils/catchAsync");
const redisClient = require("../../redis/redisClient");
const prisma = require("../../prisma/client");

const status = catchAsync(async (req, res, next) => {
	const redisStatus = redisClient.isAlive();
	const serverStatus = "online";
	let prismaStatus;

	try {
		prisma.$connect();
		prismaStatus = "online";
	} catch (err) {
		prismaStatus = "offline";
		console.log(err);
	}

	res.status(200).json({
		serverStatus,
		redisStatus,
		prismaStatus,
	});
});

module.exports = {
	status,
};
