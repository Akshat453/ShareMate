import { verifyAccessToken } from '../utils/tokenUtils.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.', errors: [] });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash -refreshTokens');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.', errors: [] });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.', errors: [] });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.', errors: [] });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.id).select('-passwordHash -refreshTokens');
    }
  } catch (error) {
    // Token invalid or expired, continue without user
  }
  next();
};
