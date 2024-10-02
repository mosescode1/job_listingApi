const catchAsync = require('../utils/catchAsync');
const redisClient = require('../redis/redisClient');

const status = catchAsync(async (req, res) => {
  const redisStatus = redisClient.isAlive();
  const serverStatus = 'online';

  res.status(200).json({
    serverStatus,
    redisStatus,
  });
});

module.exports = {
  status,
};
