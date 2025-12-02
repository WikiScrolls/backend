import { body, param, query } from 'express-validator';

/**
 * Validation for creating an interaction
 */
export const validateCreateInteraction = [
  body('articleId')
    .notEmpty()
    .withMessage('Article ID is required')
    .isUUID()
    .withMessage('Article ID must be a valid UUID'),
  
  body('interactionType')
    .notEmpty()
    .withMessage('Interaction type is required')
    .isIn(['LIKE', 'VIEW', 'SAVE'])
    .withMessage('Interaction type must be one of: LIKE, VIEW, SAVE'),
];

/**
 * Validation for deleting an interaction
 */
export const validateDeleteInteraction = [
  body('articleId')
    .notEmpty()
    .withMessage('Article ID is required')
    .isUUID()
    .withMessage('Article ID must be a valid UUID'),
  
  body('interactionType')
    .notEmpty()
    .withMessage('Interaction type is required')
    .isIn(['LIKE', 'SAVE'])
    .withMessage('Interaction type must be one of: LIKE, SAVE (VIEW cannot be deleted)'),
];

/**
 * Validation for getting user interactions with optional filtering
 */
export const validateGetUserInteractions = [
  query('type')
    .optional()
    .isIn(['LIKE', 'VIEW', 'SAVE'])
    .withMessage('Type must be one of: LIKE, VIEW, SAVE'),
];

/**
 * Validation for getting article interactions
 */
export const validateGetArticleInteractions = [
  param('articleId')
    .isUUID()
    .withMessage('Article ID must be a valid UUID'),
];

/**
 * Validation for checking if interaction exists
 */
export const validateCheckInteraction = [
  param('articleId')
    .isUUID()
    .withMessage('Article ID must be a valid UUID'),
  
  query('type')
    .notEmpty()
    .withMessage('Interaction type is required')
    .isIn(['LIKE', 'VIEW', 'SAVE'])
    .withMessage('Type must be one of: LIKE, VIEW, SAVE'),
];

/**
 * Validation for checking all interactions (liked, saved) for an article
 */
export const validateCheckAllInteractions = [
  param('articleId')
    .isUUID()
    .withMessage('Article ID must be a valid UUID'),
];

/**
 * Validation for getting liked/saved articles with pagination
 */
export const validateGetInteractionArticles = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

/**
 * Validation for getting another user's liked articles
 */
export const validateGetUserLikedArticles = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
