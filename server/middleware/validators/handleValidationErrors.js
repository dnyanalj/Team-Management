import { validationResult } from 'express-validator';
import { AppError } from '../../utils/AppError.js';

export function handleValidationErrors(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  const error = new AppError('Validation failed', 400);
  error.errors = errors;
  next(error);
}
