import { Response } from 'express';
import { UserProfileService } from '../services/userProfile.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

const userProfileService = new UserProfileService();

export class UserProfileController {
  // Get all profiles (admin only)
  getAllProfiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const profiles = await userProfileService.getAllProfiles();
    sendSuccess(res, 'Profiles retrieved successfully', profiles);
  });

  // Get profile by user ID
  getProfileByUserId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const profile = await userProfileService.getProfileByUserId(
      userId,
      req.user!.id,
      req.user!.isAdmin
    );
    sendSuccess(res, 'Profile retrieved successfully', profile);
  });

  // Get public profile by user ID (no ownership required)
  getPublicProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const profile = await userProfileService.getPublicProfile(userId);
    sendSuccess(res, 'Profile retrieved successfully', profile);
  });

  // Get current user's profile
  getMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const profile = await userProfileService.getProfileByUserId(
      req.user!.id,
      req.user!.id,
      req.user!.isAdmin
    );
    sendSuccess(res, 'Profile retrieved successfully', profile);
  });

  // Get current user's stats
  getMyStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await userProfileService.getMyStats(req.user!.id);
    sendSuccess(res, 'Stats retrieved successfully', stats);
  });

  // Create profile
  createProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const profile = await userProfileService.createProfile({
      ...req.body,
      userId: req.user!.id,
    });
    sendSuccess(res, 'Profile created successfully', profile, 201);
  });

  // Update profile by user ID
  updateProfileByUserId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const profile = await userProfileService.updateProfile(
      userId,
      req.body,
      req.user!.id,
      req.user!.isAdmin
    );
    sendSuccess(res, 'Profile updated successfully', profile);
  });

  // Update current user's profile
  updateMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const profile = await userProfileService.updateProfile(
      req.user!.id,
      req.body,
      req.user!.id,
      req.user!.isAdmin
    );
    sendSuccess(res, 'Profile updated successfully', profile);
  });

  // Delete profile by user ID
  deleteProfileByUserId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    await userProfileService.deleteProfile(
      userId,
      req.user!.id,
      req.user!.isAdmin
    );
    sendSuccess(res, 'Profile deleted successfully', null, 204);
  });

  // Delete current user's profile
  deleteMyProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    await userProfileService.deleteProfile(
      req.user!.id,
      req.user!.id,
      req.user!.isAdmin
    );
    sendSuccess(res, 'Profile deleted successfully', null, 204);
  });
}
