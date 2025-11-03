import { body, param, query } from 'express-validator';

/**
 * Validation for creating a user (admin only)
 */
export const validateCreateUser = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .trim(),
  
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .trim(),
  
  body('passwordHash')
    .notEmpty()
    .withMessage('Password hash is required')
    .isString()
    .withMessage('Password hash must be a string'),
  
  body('isAdmin')
    .optional()
    .isBoolean()
    .withMessage('isAdmin must be a boolean'),
];

/**
 * Validation for updating a user
 */
export const validateUpdateUser = [
  param('id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .trim(),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .trim(),
  
  body('passwordHash')
    .optional()
    .isString()
    .withMessage('Password hash must be a string'),
  
  body('isAdmin')
    .optional()
    .isBoolean()
    .withMessage('isAdmin must be a boolean'),
];

/**
 * Validation for getting a user by ID
 */
export const validateGetUser = [
  param('id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
];

/**
 * Validation for deleting a user
 */
export const validateDeleteUser = [
  param('id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
];

/**
 * Validation for listing users with pagination
 */
export const validateListUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'username', 'email'])
    .withMessage('Sort by must be one of: createdAt, username, email'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage("Sort order must be either 'asc' or 'desc'"),
];
