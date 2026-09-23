const Sentry = require('@sentry/node');
const { SENTRY_DSN, NODE_ENV } = require('./env');

let sentryInitialized = false;

const initSentry = () => {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: NODE_ENV,
      tracesSampleRate: NODE_ENV === 'production' ? 0.1 : 0,
    });
    sentryInitialized = true;
    console.log('Sentry initialized successfully');
  } else {
    console.log('SENTRY_DSN not set — skipping Sentry initialization');
  }
};

module.exports = {
  initSentry,
  Sentry,
  sentryInitialized,
};

