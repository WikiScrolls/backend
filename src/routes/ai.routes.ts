import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validateRequest';
import { body, param } from 'express-validator';

const router = Router();

// All AI routes require admin authentication
router.use(authenticate, isAdmin);

/**
 * @route   POST /api/ai/process-article
 * @desc    Process Wikipedia article with AI (generate summary, tags, and audio)
 * @access  Admin
 */
router.post(
  '/process-article',
  [
    body('content').notEmpty().withMessage('Content is required').isString(),
    body('title').notEmpty().withMessage('Title is required').isString(),
    body('wikipediaUrl').notEmpty().withMessage('Wikipedia URL is required').isURL(),
    body('categoryId').notEmpty().withMessage('Category ID is required').isUUID(),
    body('publishedDate').notEmpty().withMessage('Published date is required').isISO8601(),
    body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL'),
    handleValidationErrors,
  ],
  aiController.processArticle
);

/**
 * @route   POST /api/ai/regenerate-summary/:articleId
 * @desc    Regenerate AI summary for an article
 * @access  Admin
 */
router.post(
  '/regenerate-summary/:articleId',
  [
    param('articleId').isUUID().withMessage('Invalid article ID'),
    body('content').notEmpty().withMessage('Content is required').isString(),
    handleValidationErrors,
  ],
  aiController.regenerateSummary
);

/**
 * @route   POST /api/ai/regenerate-audio/:articleId
 * @desc    Regenerate audio for an article
 * @access  Admin
 */
router.post(
  '/regenerate-audio/:articleId',
  [
    param('articleId').isUUID().withMessage('Invalid article ID'),
    handleValidationErrors,
  ],
  aiController.regenerateAudio
);

export default router;
