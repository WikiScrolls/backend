import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { 
  validateCreateUser, 
  validateUpdateUser, 
  validateGetUser, 
  validateDeleteUser,
  validateListUsers 
} from '../validations/user.validation';
import { handleValidationErrors } from '../middleware/validateRequest';
import { authenticate, isAdmin } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimiter';

const router = Router();
const userController = new UserController();

// All user routes require authentication and admin privileges
router.use(authenticate, isAdmin);

router.get('/', validateListUsers, handleValidationErrors, userController.getUsers);
router.get('/:id', validateGetUser, handleValidationErrors, userController.getUserById);
router.post('/', createLimiter, validateCreateUser, handleValidationErrors, userController.createUser);
router.put('/:id', validateUpdateUser, handleValidationErrors, userController.updateUser);
router.delete('/:id', validateDeleteUser, handleValidationErrors, userController.deleteUser);

export default router;
