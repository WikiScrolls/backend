import { body, param } from 'express-validator';

/**
 * Validation for creating a feed
 */
export const validateCreateFeed = [
  body('articleIds')
    .optional()
    .isArray()
    .withMessage('Article IDs must be an array'),
  
  body('articleIds.*')
    .optional()
    .isUUID()
    .withMessage('Each article ID must be a valid UUID'),
];

/**
 * Validation for updating a feed
 */
export const validateUpdateFeed = [
  body('articleIds')
    .optional()
    .isArray()
    .withMessage('Article IDs must be an array'),
  
  body('articleIds.*')
    .optional()
    .isUUID()
    .withMessage('Each article ID must be a valid UUID'),
  
  body('currentPosition')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current position must be a non-negative integer'),
];

/**
 * Validation for updating feed position
 */
export const validateUpdateFeedPosition = [
  body('position')
    .notEmpty()
    .withMessage('Position is required')
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer'),
];

/**
 * Validation for regenerating feed
 */
export const validateRegenerateFeed = [
  body('articleIds')
    .notEmpty()
    .withMessage('Article IDs are required')
    .isArray()
    .withMessage('Article IDs must be an array'),
  
  body('articleIds.*')
    .isUUID()
    .withMessage('Each article ID must be a valid UUID'),
];

/**
 * Validation for getting a feed by user ID
 */
export const validateGetFeedByUserId = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
];

/**
 * Validation for updating a feed by user ID
 */
export const validateUpdateFeedByUserId = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  body('articleIds')
    .optional()
    .isArray()
    .withMessage('Article IDs must be an array'),
  
  body('articleIds.*')
    .optional()
    .isUUID()
    .withMessage('Each article ID must be a valid UUID'),
  
  body('currentPosition')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current position must be a non-negative integer'),
];

/**
 * Validation for deleting a feed by user ID
 */
export const validateDeleteFeedByUserId = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
];
