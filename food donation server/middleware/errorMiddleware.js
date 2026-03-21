const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Server Error';

  // Handle specific errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed - invalid input data';
    // Extract mongoose validation errors
    if (err.errors) {
      message = Object.values(err.errors).map(val => val.message).join(', ');
    }
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Use err.message if custom
  if (err.message) {
    message = err.message;
  }

  // Log error in development
  console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;

