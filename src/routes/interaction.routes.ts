import { Router } from 'express';
import { InteractionController } from '../controllers/interaction.controller';
import {
  validateCreateInteraction,
  validateDeleteInteraction,
  validateGetUserInteractions,
  validateGetArticleInteractions,
  validateCheckInteraction
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
router.get('/check/:articleId', validateCheckInteraction, handleValidationErrors, interactionController.checkInteraction);

// Admin routes - view article interactions
router.get('/article/:articleId', isAdmin, validateGetArticleInteractions, handleValidationErrors, interactionController.getArticleInteractions);

export default router;
