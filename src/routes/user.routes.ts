import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middleware/validation';
import { createUserSchema, getUserSchema } from '../schemas/user.schema';
import { createLimiter } from '../middleware/rateLimiter';

const router = Router();
const userController = new UserController();

router.get('/', userController.getUsers);
router.get('/:id', validate(getUserSchema), userController.getUserById);
router.post('/', createLimiter, validate(createUserSchema), userController.createUser);
router.put('/:id', validate(getUserSchema), userController.updateUser);
router.delete('/:id', validate(getUserSchema), userController.deleteUser);

export default router;
