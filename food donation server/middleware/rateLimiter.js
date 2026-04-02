const rateLimit = require('express-rate-limit');

const parsePositiveInt = (value, fallbackValue) => {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallbackValue;
};

const getRetryAfterSeconds = (req) => {
  const resetTime = req.rateLimit?.resetTime;

  if (!(resetTime instanceof Date)) {
    return null;
  }

  const retryAfterMs = resetTime.getTime() - Date.now();

  return Math.max(1, Math.ceil(retryAfterMs / 1000));
};

const formatRetryMessage = (retryAfterSeconds) => {
  if (!retryAfterSeconds) {
    return 'Too many requests, please try again later.';
  }

  if (retryAfterSeconds < 60) {
    return `Too many requests, please try again in about ${retryAfterSeconds} seconds.`;
  }

  const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);
  return `Too many requests, please try again in about ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? '' : 's'}.`;
};

const rateLimitErrorHandler = (req, res) => {
  const retryAfterSeconds = getRetryAfterSeconds(req);

  if (retryAfterSeconds) {
    res.set('Retry-After', String(retryAfterSeconds));
  }

  res.status(429).json({
    message: formatRetryMessage(retryAfterSeconds),
    retryAfterSeconds
  });
};

const isProduction = process.env.NODE_ENV === 'production';
const loginWindowMinutes = parsePositiveInt(
  process.env.LOGIN_RATE_LIMIT_WINDOW_MINUTES,
  isProduction ? 10 : 5
);
const loginMaxAttempts = parsePositiveInt(
  process.env.LOGIN_RATE_LIMIT_MAX,
  isProduction ? 5 : 20
);

// Global limiter: 100 req / 15min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitErrorHandler,
  message: 'Too many requests from this IP'
});

// Strict login limiter: 5 attempts / 10min
const loginLimiter = rateLimit({
  windowMs: loginWindowMinutes * 60 * 1000,
  max: loginMaxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: rateLimitErrorHandler,
  message: 'Too many login attempts'
});

// Contact limiter: 10 / 15min
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitErrorHandler,
  message: 'Too many contact submissions'
});

module.exports = {
  globalLimiter,
  loginLimiter,
  contactLimiter,
  rateLimitErrorHandler
};
