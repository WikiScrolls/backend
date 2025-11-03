import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';
import {
  validateCreateFeed,
  validateUpdateFeed,
  validateUpdateFeedPosition,
  validateRegenerateFeed,
  validateGetFeedByUserId,
  validateUpdateFeedByUserId,
  validateDeleteFeedByUserId
} from '../validations/feed.validation';
import { handleValidationErrors } from '../middleware/validateRequest';
import { authenticate, isAdmin } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimiter';

const router = Router();
const feedController = new FeedController();

// All routes require authentication
router.use(authenticate);

// User routes - manage own feed
router.get('/me', feedController.getMyFeed);
router.post('/me', createLimiter, validateCreateFeed, handleValidationErrors, feedController.createFeed);
router.put('/me', validateUpdateFeed, handleValidationErrors, feedController.updateMyFeed);
router.put('/me/position', validateUpdateFeedPosition, handleValidationErrors, feedController.updateFeedPosition);
router.post('/me/regenerate', validateRegenerateFeed, handleValidationErrors, feedController.regenerateFeed);
router.delete('/me', feedController.deleteMyFeed);

// Admin routes - manage any feed
router.get('/', isAdmin, feedController.getAllFeeds);
router.get('/:userId', validateGetFeedByUserId, handleValidationErrors, feedController.getFeedByUserId);
router.put('/:userId', isAdmin, validateUpdateFeedByUserId, handleValidationErrors, feedController.updateFeedByUserId);
router.delete('/:userId', isAdmin, validateDeleteFeedByUserId, handleValidationErrors, feedController.deleteFeedByUserId);

export default router;
