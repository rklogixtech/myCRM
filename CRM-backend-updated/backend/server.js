const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const logger = require('./src/utils/logger');
const { PORT, NODE_ENV } = require('./src/config/env');

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

