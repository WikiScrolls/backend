import jwt, { SignOptions } from 'jsonwebtoken';
import { UserPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for a user
 * @param payload The user payload to encode in the token
 * @returns The generated JWT token
 */
export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
};

/**
 * Generate a password reset JWT token for a user
 * @param payload The user payload to encode in the token
 * @returns The generated JWT token (expires in 30 minutes)
 */
export const generatePasswordResetToken = (payload: UserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30m',
  } as SignOptions);
};

/**
 * Verify and decode a JWT token
 * @param token The JWT token to verify
 * @returns The decoded user payload if valid, null otherwise
 */
export const verifyToken = (token: string): UserPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
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
