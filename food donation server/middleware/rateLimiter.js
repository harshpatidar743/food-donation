const rateLimit = require('express-rate-limit');

const rateLimitErrorHandler = (req, res) => {
  res.status(429).json({
    message: 'Too many requests, please try again later.'
  });
};

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
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
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
