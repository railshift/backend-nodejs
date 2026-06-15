import Redis from 'ioredis';
import config from './config.js';

export const bullmqConnection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,

  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});