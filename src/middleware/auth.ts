import { Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken } from '../utils/token';
import { sendError } from '../utils/response';
import prisma from '../config/database';
import { AuthRequest, User } from '../types';
import { logger } from '../config/logger';

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token and attaches the user to the request
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

    // Get user from database
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

    // Attach user to request
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
};
