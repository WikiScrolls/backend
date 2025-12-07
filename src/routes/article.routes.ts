import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { 
  validateCreateArticle, 
  validateUpdateArticle, 
  validateGetArticle, 
  validateDeleteArticle,
  validateListArticles,
  validateIncrementViewCount,
  validateSearchArticles,
  validateUpsertArticle,
  validateUpsertBatch,
  validateGetByWikipediaId,
  validateGetByWikipediaUrl
} from '../validations/article.validation';
import { handleValidationErrors } from '../middleware/validateRequest';
import { authenticate, isAdmin } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimiter';

const router = Router();
const articleController = new ArticleController();

// Public/authenticated user routes
router.get('/search', authenticate, validateSearchArticles, handleValidationErrors, articleController.searchArticles);
router.get('/wikipedia/url', authenticate, validateGetByWikipediaUrl, handleValidationErrors, articleController.getByWikipediaUrl);
router.get('/wikipedia/:wikipediaId', authenticate, validateGetByWikipediaId, handleValidationErrors, articleController.getByWikipediaId);
router.get('/', authenticate, validateListArticles, handleValidationErrors, articleController.getArticles);
router.get('/:id', authenticate, validateGetArticle, handleValidationErrors, articleController.getArticleById);
router.post('/:id/view', authenticate, validateIncrementViewCount, handleValidationErrors, articleController.incrementViewCount);
// bro
// PageRank integration routes (accessible by authenticated users for FE integration)
router.post('/upsert', authenticate, validateUpsertArticle, handleValidationErrors, articleController.upsertArticle);
router.post('/upsert-batch', authenticate, validateUpsertBatch, handleValidationErrors, articleController.upsertBatch);

// Admin-only routes
router.post('/', authenticate, isAdmin, createLimiter, validateCreateArticle, handleValidationErrors, articleController.createArticle);
router.put('/:id', authenticate, isAdmin, validateUpdateArticle, handleValidationErrors, articleController.updateArticle);
router.delete('/:id', authenticate, isAdmin, validateDeleteArticle, handleValidationErrors, articleController.deleteArticle);

export default router;
