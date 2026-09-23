require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/crm',
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  SENTRY_DSN: process.env.SENTRY_DSN,
  REDIS_URL: process.env.REDIS_URL,
  DASHBOARD_CACHE_TTL: Number(process.env.DASHBOARD_CACHE_TTL) || 60,
};

module.exports = env;

