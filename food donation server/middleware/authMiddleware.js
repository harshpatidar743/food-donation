const jwt = require('jsonwebtoken');

// Protect routes - JWT middleware
const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        res.status(401);
        throw new Error('No token provided');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = { id: decoded.id }; // Assumes token payload has 'id' field

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

module.exports = { protect };

