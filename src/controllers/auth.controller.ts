import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

const authService = new AuthService();

export class AuthController {
  /**
   * Register a new user
   */
  signup = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.signup(req.body);
    sendSuccess(res, 'User registered successfully', result, 201);
  });

  /**
   * Login user
   */
  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.login(req.body);
    sendSuccess(res, 'Login successful', result);
  });

  /**
   * Get current user profile
   */
  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const profile = await authService.getProfile(userId);
    sendSuccess(res, 'Profile retrieved successfully', profile);
  });
}
