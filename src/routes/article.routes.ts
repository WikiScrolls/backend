import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { 
  validateCreateArticle, 
  validateUpdateArticle, 
  validateGetArticle, 
  validateDeleteArticle,
  validateListArticles,
  validateIncrementViewCount,
  validateSearchArticles
} from '../validations/article.validation';
import { handleValidationErrors } from '../middleware/validateRequest';
import { authenticate, isAdmin } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimiter';

const router = Router();
const articleController = new ArticleController();

// Public/authenticated user routes
router.get('/search', authenticate, validateSearchArticles, handleValidationErrors, articleController.searchArticles);
router.get('/', authenticate, validateListArticles, handleValidationErrors, articleController.getArticles);
router.get('/:id', authenticate, validateGetArticle, handleValidationErrors, articleController.getArticleById);
router.post('/:id/view', authenticate, validateIncrementViewCount, handleValidationErrors, articleController.incrementViewCount);

// Admin-only routes
router.post('/', authenticate, isAdmin, createLimiter, validateCreateArticle, handleValidationErrors, articleController.createArticle);
router.put('/:id', authenticate, isAdmin, validateUpdateArticle, handleValidationErrors, articleController.updateArticle);
router.delete('/:id', authenticate, isAdmin, validateDeleteArticle, handleValidationErrors, articleController.deleteArticle);

export default router;
