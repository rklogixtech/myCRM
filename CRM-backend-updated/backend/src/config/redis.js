const Redis = require('ioredis');
const logger = require('../utils/logger');
const { REDIS_URL } = require('./env');

let client = null;
let isReady = false;

/**
 * Creates (or returns existing) Redis client.
 * The app must keep working even if Redis is down/unconfigured —
 * caching is a performance optimization, not a hard dependency.
 */
const getRedisClient = () => {
  if (client) return client;

  if (!REDIS_URL) {
    logger.warn('REDIS_URL not set — dashboard caching disabled, falling back to direct DB reads');
    return null;
  }

  client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => Math.min(times * 200, 2000),
    lazyConnect: true,
  });

  client.on('connect', () => {
    isReady = true;
    logger.info('Redis connected');
  });

  client.on('error', (err) => {
    isReady = false;
    logger.error(`Redis error: ${err.message}`);
  });

  client.on('close', () => {
    isReady = false;
  });

  client.connect().catch((err) => {
    logger.error(`Redis initial connection failed: ${err.message}`);
  });

  return client;
};

const isRedisReady = () => isReady;

module.exports = { getRedisClient, isRedisReady };
