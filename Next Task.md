If you still have proper context, can you make the functions of the model tables in the schema please? CRUD and some basic stuff like login and signup. Each pack should be controller-route-validation for safety (validation file example: 
import { body, param, query } from 'express-validator';

/**
 * Validation for creating activity log
 */
export const validateCreateActivityLog = [
  body('eventType')
    .notEmpty()
    .withMessage('Event type is required')
    .isString()
    .withMessage('Event type must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Event type must be between 1 and 100 characters')
    .trim(),
];

/**
 * Validation for updating activity log
 */
export const validateUpdateActivityLog = [
  param('id').isUUID().withMessage('Activity log ID must be a valid UUID'),
  body('eventType')
    .optional()
    .isString()
    .withMessage('Event type must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Event type must be between 1 and 100 characters')
    .trim(),
];

/**
 * Validation for getting activity log by ID
 */
export const validateGetActivityLog = [
  param('id').isUUID().withMessage('Activity log ID must be a valid UUID'),
];

/**
 * Validation for deleting activity log
 */
export const validateDeleteActivityLog = [
  param('id').isUUID().withMessage('Activity log ID must be a valid UUID'),
];

/**
 * Validation for listing activity logs with pagination and filtering
 */
export const validateListActivityLogs = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('eventType')
    .optional()
    .isString()
    .withMessage('Event type must be a string')
    .isLength({ max: 100 })
    .withMessage('Event type must be less than 100 characters')
    .trim(),
  query('userId')
    .optional()
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'eventType', 'userId'])
    .withMessage('Sort by must be one of: createdAt, eventType, userId'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage("Sort order must be either 'asc' or 'desc'"),
];
)

Also, since there will be admin type routes for the CRUD ones (that users can't access), i think we need to implement only admins functionality (example: 
import { Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/token';
import { sendError } from '../utils/response';
import { isValidSession } from '../utils/redis';
import prisma from '../config/database';
import { AuthRequest, User } from '../types';
import { logger } from '../config/logger';

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token and attaches the user to the request
 * Implements single device login using Redis session validation
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      sendError(
        res,
        'Authentication required',
        [{ field: 'token', message: 'No token provided' }],
        401
      );
      return;
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      sendError(
        res,
        'Authentication failed',
        [{ field: 'token', message: 'Invalid or expired token' }],
        401
      );
      return;
    }

    // Get user from database first to check admin status
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      sendError(
        res,
        'Authentication failed',
        [{ field: 'token', message: 'User not found' }],
        401
      );
      return;
    }

    // Check if token matches active session in Redis (single device login for regular users)
    const sessionIsValid = await isValidSession(payload.id, token, user.isAdmin);
    
    if (!sessionIsValid) {
      logger.warn(`Session invalid for user ${payload.id} - device logged out`);
      sendError(
        res,
        'Session expired',
        [{ field: 'token', message: 'Your session has expired. Please login again.' }],
        401
      );
      return;
    }

    // Attach user to request with type assertion
    req.user = user as unknown as User;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    sendError(
      res,
      'Authentication error',
      [{ field: 'auth', message: 'An error occurred during authentication' }],
      500
    );
  }
};

/**
 * Admin middleware to protect admin-only routes
 * Must be used after authenticate middleware
 */
export const isAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    sendError(
      res,
      'Authentication required',
      [{ field: 'auth', message: 'Authentication required' }],
      401
    );
    return;
  }

  if (!req.user.isAdmin) {
    sendError(
      res,
      'Authorization failed',
      [{ field: 'auth', message: 'Admin privileges required' }],
      403
    );
    return;
  }

  next();
}; do we need to edit the user model this way?)

Lastly, i think a token based approach would be nice (JWT with timeout for proper sessions 
(example:
import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { UserPayload } from '../types';

/**
 * Generate a JWT token for a user
 * @param payload The user payload to encode in the token
 * @returns The generated JWT token
 */
export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

/**
 * Generate a password reset JWT token for a user
 * @param payload The user payload to encode in the token
 * @returns The generated JWT token (expires in 30 minutes)
 */
export const generatePasswordResetToken = (payload: UserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '30m', // Token expires in 30 minutes
  });
};

/**
 * Verify and decode a JWT token
 * @param token The JWT token to verify
 * @returns The decoded user payload if valid, null otherwise
 */
export const verifyToken = (token: string): UserPayload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Extract a token from the Authorization header
 * @param authHeader The Authorization header value
 * @returns The token if present and valid, null otherwise
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
};
)