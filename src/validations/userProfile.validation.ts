import { body, param } from 'express-validator';

/**
 * Validation for creating a user profile
 */
export const validateCreateProfile = [
  body('displayName')
    .optional()
    .isString()
    .withMessage('Display name must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Display name must be between 1 and 100 characters')
    .trim(),
  
  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string')
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
    .trim(),
  
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  
  body('interests.*')
    .optional()
    .isString()
    .withMessage('Each interest must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be between 1 and 50 characters')
    .trim(),
  
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL')
    .trim(),
];

/**
 * Validation for updating a user profile
 */
export const validateUpdateProfile = [
  body('displayName')
    .optional()
    .isString()
    .withMessage('Display name must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Display name must be between 1 and 100 characters')
    .trim(),
  
  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string')
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
    .trim(),
  
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  
  body('interests.*')
    .optional()
    .isString()
    .withMessage('Each interest must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be between 1 and 50 characters')
    .trim(),
  
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL')
    .trim(),
];

/**
 * Validation for getting a profile by user ID
 */
export const validateGetProfileByUserId = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
];

/**
 * Validation for updating a profile by user ID
 */
export const validateUpdateProfileByUserId = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  body('displayName')
    .optional()
    .isString()
    .withMessage('Display name must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Display name must be between 1 and 100 characters')
    .trim(),
  
  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string')
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
    .trim(),
  
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  
  body('interests.*')
    .optional()
    .isString()
    .withMessage('Each interest must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be between 1 and 50 characters')
    .trim(),
  
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL')
    .trim(),
];

/**
 * Validation for deleting a profile by user ID
 */
export const validateDeleteProfileByUserId = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
];
