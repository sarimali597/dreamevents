import { ApiError } from '../utils/ApiError.js';

export const roleMiddleware =
  (...roles) =>
  (req, _res, next) => {
  const user = req.user;
  if (!user) {
  return next(new ApiError(401, 'Authentication required'));
  }
  if (!roles.includes(user.role)) {
  return next(new ApiError(403, 'You do not have permission to access this resource'));
  }
  return next();
  };
