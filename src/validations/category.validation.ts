import { body, param } from 'express-validator';

/**
 * Validation for creating a category
 */
export const validateCreateCategory = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isString()
    .withMessage('Category name must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
    .trim(),
  
  body('color')
    .optional()
    .isString()
    .withMessage('Color must be a string')
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color code (e.g., #FF5733)')
    .trim(),
];

/**
 * Validation for updating a category
 */
export const validateUpdateCategory = [
  param('id')
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  
  body('name')
    .optional()
    .isString()
    .withMessage('Category name must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
    .trim(),
  
  body('color')
    .optional()
    .isString()
    .withMessage('Color must be a string')
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color code (e.g., #FF5733)')
    .trim(),
];

/**
 * Validation for getting a category by ID
 */
export const validateGetCategory = [
  param('id')
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
];

/**
 * Validation for deleting a category
 */
export const validateDeleteCategory = [
  param('id')
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
];
