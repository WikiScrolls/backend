import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateSignup, validateLogin } from '../validations/auth.validation';
import { handleValidationErrors } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/signup', authLimiter, validateSignup, handleValidationErrors, authController.signup);
router.post('/login', authLimiter, validateLogin, handleValidationErrors, authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);

export default router;
