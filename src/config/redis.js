import Redis from 'ioredis';
import config from './config.js';
import logger from '../utils/logger.js';

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  connect() {
    try {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        retryStrategy: (times) => {
          // Stop retrying
          if (times > 3) {
            logger.warn('Redis connection failed after 3 attempts. Running without Redis.');
            return null; 
          }
          const delay = Math.min(times * 1000, 3000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        lazyConnect: true, // Don't connect immediately
        enableReadyCheck: false,
        showFriendlyErrorStack: true,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis connected successfully');
      });

      this.client.on('error', (error) => {
        this.isConnected = false;
        if (!this.errorLogged) {
          logger.warn('Redis not available - running without cache');
          this.errorLogged = true;
        }
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
      // TODO : check here #rana8256
      });

      return this.client;
    } catch (error) {
      logger.error('Failed to create Redis client:', error);
      throw error;
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call connect() first.');
    }
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis disconnected');
    }
  }

  async set(key, value, expirySeconds = null) {
    try {
      if (expirySeconds) {
        return await this.client.setex(key, expirySeconds, JSON.stringify(value));
      }
      return await this.client.set(key, JSON.stringify(value));
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      throw error;
    }
  }

  async del(key) {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      throw error;
    }
  }

  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      throw error;
    }
  }

  async expire(key, seconds) {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      throw error;
    }
  }

  // Hash operations
  async hset(key, field, value) {
    try {
      return await this.client.hset(key, field, JSON.stringify(value));
    } catch (error) {
      logger.error(`Redis HSET error for key ${key}:`, error);
      throw error;
    }
  }

  async hget(key, field) {
    try {
      const data = await this.client.hget(key, field);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Redis HGET error for key ${key}:`, error);
      throw error;
    }
  }

  async hgetall(key) {
    try {
      const data = await this.client.hgetall(key);
      const parsed = {};
      for (const [field, value] of Object.entries(data)) {
        parsed[field] = JSON.parse(value);
      }
      return parsed;
    } catch (error) {
      logger.error(`Redis HGETALL error for key ${key}:`, error);
      throw error;
    }
  }

  // List operations
  async lpush(key, value) {
    try {
      return await this.client.lpush(key, JSON.stringify(value));
    } catch (error) {
      logger.error(`Redis LPUSH error for key ${key}:`, error);
      throw error;
    }
  }

  async lrange(key, start, stop) {
    try {
      const data = await this.client.lrange(key, start, stop);
      return data.map((item) => JSON.parse(item));
    } catch (error) {
      logger.error(`Redis LRANGE error for key ${key}:`, error);
      throw error;
    }
  }

  // Pub/Sub operations
  async publish(channel, message) {
    try {
      return await this.client.publish(channel, JSON.stringify(message));
    } catch (error) {
      logger.error(`Redis PUBLISH error for channel ${channel}:`, error);
      throw error;
    }
  }
}

const redisClient = new RedisClient();

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.warn('Redis connection failed after 3 attempts. Running without Redis.');
      return null; 
    }
    const delay = Math.min(times * 1000, 3000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  lazyConnect: true, // Don't connect immediately
  enableReadyCheck: false,
  showFriendlyErrorStack: true,
})

// shutdown
process.on('beforeExit', async () => {
  await redisClient.disconnect();
});

export default redisClient;
