import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import {
  validateCreateArticle,
  validateUpdateArticle,
  validateGetArticle,
  validateDeleteArticle,
  validateListArticles,
} from '../validations/article.validation';
import { handleValidationErrors } from '../middleware/validateRequest';
import { authenticate, isAdmin } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimiter';

const router = Router();
const articleController = new ArticleController();

// Public routes (read-only for users)
router.get('/', validateListArticles, handleValidationErrors, articleController.getArticles);
router.get('/:id', validateGetArticle, handleValidationErrors, articleController.getArticleById);
router.post('/:id/view', validateGetArticle, handleValidationErrors, articleController.incrementViewCount);

// Admin-only routes
router.post(
  '/',
  authenticate,
  isAdmin,
  createLimiter,
  validateCreateArticle,
  handleValidationErrors,
  articleController.createArticle
);

router.put(
  '/:id',
  authenticate,
  isAdmin,
  validateUpdateArticle,
  handleValidationErrors,
  articleController.updateArticle
);

router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validateDeleteArticle,
  handleValidationErrors,
  articleController.deleteArticle
);

export default router;
