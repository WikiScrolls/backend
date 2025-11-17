import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { uploadSingle } from '../middleware/upload';
import { authenticate, isAdmin } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimiter';
import { param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validateRequest';

const router = Router();
const uploadController = new UploadController();

// All routes require authentication
router.use(authenticate);

/**
 * Profile Avatar Routes
 */
// Upload avatar for current user
router.post(
  '/avatar',
  createLimiter, // Rate limit to prevent abuse
  uploadSingle,
  uploadController.uploadProfileAvatar
);

// Delete avatar for current user
router.delete(
  '/avatar',
  uploadController.deleteProfileAvatar
);

/**
 * Article Image Routes (Admin only)
 */
// Upload image for an article
router.post(
  '/article/:articleId',
  isAdmin,
  createLimiter,
  param('articleId').isUUID().withMessage('Article ID must be a valid UUID'),
  handleValidationErrors,
  uploadSingle,
  uploadController.uploadArticleImage
);

// Delete image from an article
router.delete(
  '/article/:articleId',
  isAdmin,
  param('articleId').isUUID().withMessage('Article ID must be a valid UUID'),
  handleValidationErrors,
  uploadController.deleteArticleImage
);

export default router;
