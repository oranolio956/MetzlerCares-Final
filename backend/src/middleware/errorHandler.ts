import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  if (err instanceof AppError) {
    if (err.isOperational) {
      logger.warn('Operational error:', {
        statusCode: err.statusCode,
        message: err.message,
        path: req.path,
        method: req.method,
      });
    } else {
      logger.error('Application error:', {
        statusCode: err.statusCode,
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });
    }
  } else {
    logger.error('Unexpected error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Send error response
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      ...(err instanceof ValidationError && err.fields && { fields: err.fields }),
    });
  } else {
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    });
  }
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
