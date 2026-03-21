const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

// Protect routes - JWT middleware
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        const error = new Error('No token provided');
        error.statusCode = 401;
        return next(error);
      }

      const decoded = jwt.verify(token, jwtSecret);

      req.user = { id: decoded.id }; // Assumes token payload has 'id' field

      return next();
    } catch (error) {
      const authError = new Error('Not authorized, token failed');
      authError.statusCode = 401;
      return next(authError);
    }
  } else {
    const error = new Error('Not authorized, no token');
    error.statusCode = 401;
    return next(error);
  }
};

module.exports = { protect };

