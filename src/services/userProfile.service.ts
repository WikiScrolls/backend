import prisma from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { logger } from '../config/logger';

export class UserProfileService {
  async getProfileByUserId(userId: string, requestingUserId: string, isAdmin: boolean) {
    logger.info(`Fetching profile for user: ${userId}`);
    
    // Users can only view their own profile unless they're admin
    if (userId !== requestingUserId && !isAdmin) {
      throw new ForbiddenError('You can only view your own profile');
    }
    
    const profile = await prisma.userProfile.findUnique({ 
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
    
    if (!profile) {
      throw new NotFoundError(`Profile for user ${userId} not found`);
    }
    
    return profile;
  }

  async getAllProfiles() {
    logger.info('Fetching all user profiles');
    return await prisma.userProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async createProfile(data: {
    userId: string;
    displayName?: string;
    bio?: string;
    interests?: string[];
  }) {
    logger.info('Creating user profile', { userId: data.userId });
    
    // Check if profile already exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: data.userId },
    });
    
    if (existingProfile) {
      throw new ForbiddenError('Profile already exists for this user');
    }
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return await prisma.userProfile.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async updateProfile(
    userId: string, 
    data: {
      displayName?: string;
      bio?: string;
      interests?: string[];
    },
    requestingUserId: string,
    isAdmin: boolean
  ) {
    logger.info(`Updating profile for user: ${userId}`);
    
    // Users can only update their own profile unless they're admin
    if (userId !== requestingUserId && !isAdmin) {
      throw new ForbiddenError('You can only update your own profile');
    }
    
    const profile = await prisma.userProfile.findUnique({ 
      where: { userId },
    });
    
    if (!profile) {
      throw new NotFoundError(`Profile for user ${userId} not found`);
    }
    
    return await prisma.userProfile.update({
      where: { userId },
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async deleteProfile(userId: string, requestingUserId: string, isAdmin: boolean) {
    logger.info(`Deleting profile for user: ${userId}`);
    
    // Users can only delete their own profile unless they're admin
    if (userId !== requestingUserId && !isAdmin) {
      throw new ForbiddenError('You can only delete your own profile');
    }
    
    const profile = await prisma.userProfile.findUnique({ 
      where: { userId },
    });
    
    if (!profile) {
      throw new NotFoundError(`Profile for user ${userId} not found`);
    }
    
    await prisma.userProfile.delete({ where: { userId } });
  }
}
