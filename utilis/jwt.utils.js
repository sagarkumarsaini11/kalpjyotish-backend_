const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_KEY';
const JWT_EXPIRES_IN = '7d';

/**
 * Create JWT Token
 */
exports.generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verify JWT Token
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
