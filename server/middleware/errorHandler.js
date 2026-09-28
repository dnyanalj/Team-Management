import { AppError } from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let error = err;

  if (err.type === 'entity.parse.failed') {
    error = new AppError('Request body must be valid JSON', 400);
  } else if (err.name === 'CastError') {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new AppError(`An account with this ${field} already exists`, 400);
  } else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new AppError(messages.join(', '), 400);
  } else if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  } else if (err.name === 'TokenExpiredError') {
    error = new AppError('Session expired, please log in again', 401);
  } else if (!(err instanceof AppError)) {
    console.error(err);
    error = new AppError('Something went wrong on the server', 500);
  }

  const statusCode = error.statusCode || 500;
  const response = { success: false, message: error.message };
  if (error.errors) response.errors = error.errors;

  res.status(statusCode).json(response);
}
