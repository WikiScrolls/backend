import { Router } from 'express';
import { UserProfileController } from '../controllers/userProfile.controller';
import { 
  validateCreateProfile,
  validateUpdateProfile,
  validateGetProfileByUserId,
  validateUpdateProfileByUserId,
  validateDeleteProfileByUserId
} from '../validations/userProfile.validation';
import { handleValidationErrors } from '../middleware/validateRequest';
import { authenticate, isAdmin } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimiter';

const router = Router();
const userProfileController = new UserProfileController();

// All routes require authentication
router.use(authenticate);

// User routes - manage own profile
router.get('/me', userProfileController.getMyProfile);
router.post('/me', createLimiter, validateCreateProfile, handleValidationErrors, userProfileController.createProfile);
router.put('/me', validateUpdateProfile, handleValidationErrors, userProfileController.updateMyProfile);
router.delete('/me', userProfileController.deleteMyProfile);

// Admin routes - manage any profile
router.get('/', isAdmin, userProfileController.getAllProfiles);
router.get('/:userId', validateGetProfileByUserId, handleValidationErrors, userProfileController.getProfileByUserId);
router.put('/:userId', isAdmin, validateUpdateProfileByUserId, handleValidationErrors, userProfileController.updateProfileByUserId);
router.delete('/:userId', isAdmin, validateDeleteProfileByUserId, handleValidationErrors, userProfileController.deleteProfileByUserId);

export default router;
