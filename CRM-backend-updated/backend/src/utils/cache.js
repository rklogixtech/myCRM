const { getRedisClient, isRedisReady } = require('../config/redis');
const logger = require('./logger');

/**
 * Cache-aside helpers built on Redis.
 * Every method fails "open" — if Redis is unreachable or unconfigured,
 * these resolve to null / no-op instead of throwing, so a cache outage
 * never takes the API down. Callers should always fall back to the DB
 * when get() returns null.
 */

const getCache = async (key) => {
  const client = getRedisClient();
  if (!client || !isRedisReady()) return null;

  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    logger.error(`Cache GET failed for key "${key}": ${err.message}`);
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 60) => {
  const client = getRedisClient();
  if (!client || !isRedisReady()) return false;

  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    return true;
  } catch (err) {
    logger.error(`Cache SET failed for key "${key}": ${err.message}`);
    return false;
  }
};

const deleteCache = async (key) => {
  const client = getRedisClient();
  if (!client || !isRedisReady()) return false;

  try {
    await client.del(key);
    return true;
  } catch (err) {
    logger.error(`Cache DEL failed for key "${key}": ${err.message}`);
    return false;
  }
};

module.exports = { getCache, setCache, deleteCache };
