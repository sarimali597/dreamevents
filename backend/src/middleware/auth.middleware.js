import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';

export const authMiddleware = async (req, _res, next) => {
  try {
  const token = req.cookies?.accessToken;
  if (!token) {
  return next(new ApiError(401, 'Authentication required'));
  }

  const payload = verifyAccessToken(token);

  const user = await User.findById(payload._id).select('+password').lean();
  if (!user || user.isDeleted) {
  return next(new ApiError(401, 'User no longer exists'));
  }

  req.user = user;
  return next();
  } catch {
  return next(new ApiError(401, 'Invalid or expired token'));
  }
};
