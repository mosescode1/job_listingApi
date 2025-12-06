import { createClient, RedisClientType } from 'redis';
import { Config } from '../config';

class RedisClient {
	private client!: RedisClientType;

	constructor() {
		this.connectRedis();
	}

	async connectRedis() {
		if (Config.environment === 'development') {
			this.client = createClient();
		} else {
			this.client = createClient({
				url: Config.redis.url,
			});
		}

		this.client.on('error', (err) => console.error('Redis Client Error:', err));

		try {
			await this.client.connect(); // Ensure the connection is established
			console.log('Connected to Redis');
		} catch (err) {
			console.error('Error connecting to Redis:', err);
		}
	}

	isAlive(): boolean {
		return this.client.isOpen;
	}

	async get(key: string): Promise<string | null> {
		try {
			return await this.client.get(key);
		} catch (err: any) {
			console.error(`Error getting key ${key}: ${err.message}`);
			return null;
		}
	}

	async set(
		key: string,
		value: string,
		duration: number
	): Promise<string | null> {
		try {
			return await this.client.set(key, value, {
				EX: duration,
				NX: true,
			});
		} catch (err: any) {
			console.error(`Error setting key ${key}: ${err.message}`);
			return null;
		}
	}

	async del(key: string): Promise<void> {
		try {
			await this.client.del(key);
		} catch (err: any) {
			console.error(`Error deleting key ${key}: ${err.message}`);
		}
	}

	async delPattern(pattern: string): Promise<void> {
		try {
			// Use SCAN instead of KEYS for better performance in production
			const keys: string[] = [];
			let cursor = 0;

			do {
				const result = await this.client.scan(cursor, {
					MATCH: pattern,
					COUNT: 100,
				});
				cursor = result.cursor;
				keys.push(...result.keys);
			} while (cursor !== 0);

			if (keys.length > 0) {
				await this.client.del(keys);
			}
		} catch (err: any) {
			console.error(`Error deleting pattern ${pattern}: ${err.message}`);
		}
	}
}
const redisClient = new RedisClient();

export { redisClient };
