import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

export const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorMiddleware = (error, _req, res, _next) => {
  let err = error;

  if (err instanceof mongoose.Error.ValidationError) {
  const messages = Object.values(err.errors).map((e) => e.message);
  err = new ApiError(400, `Validation error: ${messages.join(', ')}`);
  } else if (err.name === 'MongoServerError' && err.code === 11000) {
  const fields = Object.keys(err.keyPattern ?? {}).join(', ');
  err = new ApiError(409, `Duplicate value for field(s): ${fields}`);
  } else if (err.name === 'CastError') {
  err = new ApiError(400, 'Invalid resource ID');
  } else if (err.name === 'MulterError') {
  err = new ApiError(400, err.message);
  } else if (err.name === 'ZodError') {
  const messages = err.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join(', ');
  err = new ApiError(400, `Validation error: ${messages}`);
  } else if (!(err instanceof ApiError)) {
  console.error('[error] Unhandled error:', err);
  err = new ApiError(500, 'Internal server error', false);
  }

  if (err.statusCode >= 500) {
  console.error('[error]', err);
  }

  const response = {
  success: false,
  message: err.message,
  data: null,
  };

  if (process.env.NODE_ENV === 'development' && !err.isOperational) {
  response.stack = err.stack;
  }

  res.status(err.statusCode).json(response);
};
