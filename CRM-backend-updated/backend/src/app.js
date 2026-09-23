const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { initSentry, Sentry } = require('./config/sentry');

// Initialize Sentry (only if SENTRY_DSN is set)
initSentry();

// Import routes
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const dealRoutes = require('./routes/dealRoutes');
const followupRoutes = require('./routes/followupRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global rate limiter
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Sentry error handler (must be after routes, before custom errorHandler)
Sentry.setupExpressErrorHandler(app);

// Custom error handler
app.use(errorHandler);

module.exports = app;
