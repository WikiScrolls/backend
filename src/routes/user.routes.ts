import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { 
  validateCreateUser, 
  validateUpdateUser, 
  validateGetUser, 
  validateDeleteUser,
  validateListUsers,
  validateSearchUsers
} from '../validations/user.validation';
import { handleValidationErrors } from '../middleware/validateRequest';
import { authenticate, isAdmin } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimiter';

const router = Router();
const userController = new UserController();

// Authenticated user routes (non-admin)
router.get('/search', authenticate, validateSearchUsers, handleValidationErrors, userController.searchUsers);
router.get('/', authenticate, validateListUsers, handleValidationErrors, userController.getUsers);
router.get('/:id', authenticate, validateGetUser, handleValidationErrors, userController.getUserById);

// Admin-only routes
router.use(authenticate, isAdmin);
router.post('/', createLimiter, validateCreateUser, handleValidationErrors, userController.createUser);
router.put('/:id', validateUpdateUser, handleValidationErrors, userController.updateUser);
router.delete('/:id', validateDeleteUser, handleValidationErrors, userController.deleteUser);

export default router;
