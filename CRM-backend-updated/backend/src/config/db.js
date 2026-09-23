const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { DATABASE_URL } = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DATABASE_URL);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };

