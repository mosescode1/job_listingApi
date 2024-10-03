const redis = require('redis');

class RedisClient {
  constructor() {
    this.connectRedis();
  }

  async connectRedis() {
    this.client = redis.createClient();
    this.client.on('error', (err) => console.error('Redis Client Error:', err));

    try {
      await this.client.connect(); // Ensure the connection is established
    } catch (err) {
      console.error('Error connecting to Redis:', err);
    }
  }

  isAlive() {
    return this.client.isOpen;
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error(err);
      null;
    }
  }

  async set(key, value, duration) {
    try {
      return await this.client.set(key, value, {
        EX: duration,
        NX: true
      });
    } catch (err) {
      console.error(`Error setting key ${key}: ${err.message}`);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error(`Error Deleting key ${key}: ${err.message}`);
    }
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
