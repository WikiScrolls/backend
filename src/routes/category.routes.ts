import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { 
  validateCreateCategory, 
  validateUpdateCategory, 
  validateGetCategory, 
  validateDeleteCategory 
} from '../validations/category.validation';
import { handleValidationErrors } from '../middleware/validateRequest';
import { authenticate, isAdmin } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimiter';

const router = Router();
const categoryController = new CategoryController();

// All category routes require authentication and admin privileges
router.use(authenticate, isAdmin);

router.get('/', categoryController.getCategories);
router.get('/:id', validateGetCategory, handleValidationErrors, categoryController.getCategoryById);
router.post('/', createLimiter, validateCreateCategory, handleValidationErrors, categoryController.createCategory);
router.put('/:id', validateUpdateCategory, handleValidationErrors, categoryController.updateCategory);
router.delete('/:id', validateDeleteCategory, handleValidationErrors, categoryController.deleteCategory);

export default router;
