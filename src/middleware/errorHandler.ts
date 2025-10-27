import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError } from '../utils/errors';
import { Prisma } from '../../generated/prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle AppError (custom errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(process.env.ENVIRONMENT === 'development' && { stack: err.stack }),
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          message: 'A record with this value already exists',
        });
      case 'P2025':
        return res.status(404).json({
          message: 'Record not found',
        });
      default:
        return res.status(400).json({
          message: 'Database error occurred',
          ...(process.env.ENVIRONMENT === 'development' && { error: err.message }),
        });
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: 'Invalid data provided',
      ...(process.env.ENVIRONMENT === 'development' && { error: err.message }),
    });
  }

  // Default error
  res.status(500).json({
    message: process.env.ENVIRONMENT === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.ENVIRONMENT === 'development' && { stack: err.stack }),
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
