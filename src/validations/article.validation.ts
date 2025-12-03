import { body, param, query } from 'express-validator';

/**
 * Validation for creating an article
 */
export const validateCreateArticle = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters')
    .trim(),
  
  body('wikipediaUrl')
    .notEmpty()
    .withMessage('Wikipedia URL is required')
    .isURL()
    .withMessage('Must be a valid URL')
    .trim(),
  
  body('aiSummary')
    .optional()
    .isString()
    .withMessage('AI summary must be a string')
    .trim(),
  
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string')
    .trim(),
  
  body('audioUrl')
    .optional()
    .isURL()
    .withMessage('Audio URL must be a valid URL')
    .trim(),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL')
    .trim(),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .trim(),
  
  body('publishedDate')
    .optional()
    .isISO8601()
    .withMessage('Published date must be a valid ISO 8601 date'),
  
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
];

/**
 * Validation for updating an article
 */
export const validateUpdateArticle = [
  param('id')
    .isUUID()
    .withMessage('Article ID must be a valid UUID'),
  
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters')
    .trim(),
  
  body('wikipediaUrl')
    .optional()
    .isURL()
    .withMessage('Must be a valid URL')
    .trim(),
  
  body('aiSummary')
    .optional()
  .isString()
    .withMessage('AI summary must be a string')
    .trim(),

  body('audioUrl')
    .optional()
    .isURL()
    .withMessage('Audio URL must be a valid URL')
    .trim(),

  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL')
    .trim(),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .trim(),
  
  body('publishedDate')
    .optional()
    .isISO8601()
    .withMessage('Published date must be a valid ISO 8601 date'),
  
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('isProcessed')
    .optional()
    .isBoolean()
    .withMessage('isProcessed must be a boolean'),
];

/**
 * Validation for getting an article by ID
 */
export const validateGetArticle = [
  param('id')
    .isUUID()
    .withMessage('Article ID must be a valid UUID'),
];

/**
 * Validation for deleting an article
 */
export const validateDeleteArticle = [
  param('id')
    .isUUID()
    .withMessage('Article ID must be a valid UUID'),
];

/**
 * Validation for listing articles with pagination and filtering
 */
export const validateListArticles = [
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
    .isIn(['createdAt', 'title', 'publishedDate', 'viewCount', 'likeCount'])
    .withMessage('Sort by must be one of: createdAt, title, publishedDate, viewCount, likeCount'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage("Sort order must be either 'asc' or 'desc'"),
];

/**
 * Validation for incrementing view count
 */
export const validateIncrementViewCount = [
  param('id')
    .isUUID()
    .withMessage('Article ID must be a valid UUID'),
];

/**
 * Validation for searching articles
 */
export const validateSearchArticles = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isString()
    .withMessage('Search query must be a string')
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters')
    .trim(),
  
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
    .isIn(['createdAt', 'title', 'publishedDate', 'viewCount', 'likeCount'])
    .withMessage('Sort by must be one of: createdAt, title, publishedDate, viewCount, likeCount'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage("Sort order must be either 'asc' or 'desc'"),
];

/**
 * Validation for upserting an article (PageRank integration)
 */
export const validateUpsertArticle = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters')
    .trim(),
  
  body('wikipediaUrl')
    .notEmpty()
    .withMessage('Wikipedia URL is required')
    .isURL()
    .withMessage('Must be a valid URL')
    .trim(),
  
  body('wikipediaId')
    .optional()
    .isString()
    .withMessage('Wikipedia ID must be a string')
    .trim(),
  
  body('aiSummary')
    .optional()
    .isString()
    .withMessage('AI summary must be a string')
    .trim(),
  
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string')
    .trim(),
  
  body('audioUrl')
    .optional()
    .isURL()
    .withMessage('Audio URL must be a valid URL')
    .trim(),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL')
    .trim(),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .trim(),
  
  body('publishedDate')
    .optional()
    .isISO8601()
    .withMessage('Published date must be a valid ISO 8601 date'),
  
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
];

/**
 * Validation for batch upserting articles (PageRank integration)
 */
export const validateUpsertBatch = [
  body('articles')
    .isArray({ min: 1, max: 100 })
    .withMessage('Articles must be an array with 1-100 items'),
  
  body('articles.*.title')
    .notEmpty()
    .withMessage('Each article must have a title')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters')
    .trim(),
  
  body('articles.*.wikipediaUrl')
    .notEmpty()
    .withMessage('Each article must have a Wikipedia URL')
    .isURL()
    .withMessage('Must be a valid URL')
    .trim(),
  
  body('articles.*.wikipediaId')
    .optional()
    .isString()
    .withMessage('Wikipedia ID must be a string')
    .trim(),
  
  body('articles.*.aiSummary')
    .optional()
    .isString()
    .withMessage('AI summary must be a string')
    .trim(),
  
  body('articles.*.content')
    .optional()
    .isString()
    .withMessage('Content must be a string')
    .trim(),
  
  body('articles.*.imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL')
    .trim(),
  
  body('articles.*.tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

/**
 * Validation for getting article by Wikipedia ID
 */
export const validateGetByWikipediaId = [
  param('wikipediaId')
    .notEmpty()
    .withMessage('Wikipedia ID is required')
    .isString()
    .withMessage('Wikipedia ID must be a string'),
];

/**
 * Validation for getting article by Wikipedia URL
 */
export const validateGetByWikipediaUrl = [
  query('url')
    .notEmpty()
    .withMessage('Wikipedia URL is required')
    .isURL()
    .withMessage('Must be a valid URL')
    .trim(),
];
