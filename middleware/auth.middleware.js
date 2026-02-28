const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utilis/jwt.utils');


exports.authMiddleware = async (req, res, next) => {
  try {
    console.log("req headers", req.headers);
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token missing',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = await verifyToken(token);

    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
