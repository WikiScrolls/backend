import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../middleware/errorHandler';

const userService = new UserService();

export class UserController {
  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    res.json({ data: users });
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserById(Number(req.params.id));
    res.json({ data: user });
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    res.status(201).json({ data: user });
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateUser(Number(req.params.id), req.body);
    res.json({ data: user });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await userService.deleteUser(Number(req.params.id));
    res.status(204).send();
  });
}
