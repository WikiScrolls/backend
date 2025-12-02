import { Router } from 'express';
import { InteractionController } from '../controllers/interaction.controller';
import {
  validateCreateInteraction,
  validateDeleteInteraction,
  validateGetUserInteractions,
  validateGetArticleInteractions,
  validateCheckInteraction,
  validateCheckAllInteractions,
  validateGetInteractionArticles,
  validateGetUserLikedArticles
} from '../validations/interaction.validation';
import { handleValidationErrors } from '../middleware/validateRequest';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();
const interactionController = new InteractionController();

// All routes require authentication
router.use(authenticate);

// User routes - manage own interactions
router.post('/', validateCreateInteraction, handleValidationErrors, interactionController.createInteraction);
router.delete('/', validateDeleteInteraction, handleValidationErrors, interactionController.deleteInteraction);
router.get('/me', validateGetUserInteractions, handleValidationErrors, interactionController.getMyInteractions);
router.get('/me/liked', validateGetInteractionArticles, handleValidationErrors, interactionController.getMyLikedArticles);
router.get('/me/saved', validateGetInteractionArticles, handleValidationErrors, interactionController.getMySavedArticles);

// Check interactions for an article
router.get('/check/:articleId', validateCheckAllInteractions, handleValidationErrors, interactionController.checkAllInteractions);

// View another user's public liked articles
router.get('/users/:userId/liked', validateGetUserLikedArticles, handleValidationErrors, interactionController.getUserLikedArticles);

// Admin routes - view article interactions
router.get('/article/:articleId', isAdmin, validateGetArticleInteractions, handleValidationErrors, interactionController.getArticleInteractions);

export default router;
