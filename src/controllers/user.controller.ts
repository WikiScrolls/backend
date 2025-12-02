import { Response } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

const userService = new UserService();

export class UserController {
  getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const users = await userService.getAllUsers();
    sendSuccess(res, 'Users retrieved successfully', users);
  });

  searchUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = req.query.q as string;
    const options = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };
    
    const result = await userService.searchUsers(query, options);
    sendSuccess(res, 'Users search completed', result);
  });

  getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await userService.getUserById(req.params.id);
    sendSuccess(res, 'User retrieved successfully', user);
  });

  createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await userService.createUser(req.body);
    sendSuccess(res, 'User created successfully', user, 201);
  });

  updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await userService.updateUser(req.params.id, req.body);
    sendSuccess(res, 'User updated successfully', user);
  });

  deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    await userService.deleteUser(req.params.id);
    sendSuccess(res, 'User deleted successfully', null, 204);
  });
}
