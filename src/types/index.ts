import { Request } from 'express';
import { User as PrismaUser } from '../../generated/prisma/client';

/**
 * Extended Express Request with authenticated user
 */
export interface AuthRequest extends Request {
  user?: User;
}

/**
 * User type for authenticated requests
 */
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

/**
 * JWT Payload structure
 */
export interface UserPayload {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup data
 */
export interface SignupData {
  username: string;
  email: string;
  password: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Standard API response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Interaction type enum
 */
export type InteractionType = 'LIKE' | 'VIEW' | 'SAVE';
