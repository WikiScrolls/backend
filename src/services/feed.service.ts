import prisma from '../config/database';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { logger } from '../config/logger';

export class FeedService {
  /**
   * Get user's feed
   */
  async getFeedByUserId(userId: string, requestingUserId: string, isAdmin: boolean) {
    logger.info(`Fetching feed for user: ${userId}`);
    
    // Users can only view their own feed unless they're admin
    if (userId !== requestingUserId && !isAdmin) {
      throw new ForbiddenError('You can only view your own feed');
    }
    
    const feed = await prisma.feed.findUnique({ 
      where: { userId },
    });
    
    if (!feed) {
      throw new NotFoundError(`Feed for user ${userId} not found`);
    }
    
    return feed;
  }

  /**
   * Get current user's feed
   */
  async getMyFeed(userId: string) {
    logger.info(`Fetching feed for current user: ${userId}`);
    
    const feed = await prisma.feed.findUnique({ 
      where: { userId },
    });
    
    if (!feed) {
      // Auto-create empty feed if it doesn't exist
      return await this.createFeed(userId);
    }
    
    return feed;
  }

  /**
   * Get all feeds (admin only)
   */
  async getAllFeeds() {
    logger.info('Fetching all feeds');
    return await prisma.feed.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Create a new feed for a user
   */
  async createFeed(userId: string, articleIds: string[] = []) {
    logger.info('Creating feed', { userId });
    
    // Check if feed already exists
    const existingFeed = await prisma.feed.findUnique({
      where: { userId },
    });
    
    if (existingFeed) {
      throw new ForbiddenError('Feed already exists for this user');
    }
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return await prisma.feed.create({
      data: {
        userId,
        articleIds,
        currentPosition: 0,
      },
    });
  }

  /**
   * Update user's feed
   */
  async updateFeed(
    userId: string,
    data: {
      articleIds?: string[];
      currentPosition?: number;
    },
    requestingUserId: string,
    isAdmin: boolean
  ) {
    logger.info(`Updating feed for user: ${userId}`);
    
    // Users can only update their own feed unless they're admin
    if (userId !== requestingUserId && !isAdmin) {
      throw new ForbiddenError('You can only update your own feed');
    }
    
    const feed = await prisma.feed.findUnique({ 
      where: { userId },
    });
    
    if (!feed) {
      throw new NotFoundError(`Feed for user ${userId} not found`);
    }
    
    return await prisma.feed.update({
      where: { userId },
      data,
    });
  }

  /**
   * Update current position in feed
   */
  async updateFeedPosition(userId: string, position: number) {
    logger.info(`Updating feed position for user: ${userId}`, { position });
    
    const feed = await prisma.feed.findUnique({ 
      where: { userId },
    });
    
    if (!feed) {
      throw new NotFoundError(`Feed for user ${userId} not found`);
    }
    
    return await prisma.feed.update({
      where: { userId },
      data: { currentPosition: position },
    });
  }

  /**
   * Regenerate feed with new article IDs
   */
  async regenerateFeed(userId: string, articleIds: string[]) {
    logger.info(`Regenerating feed for user: ${userId}`);
    
    const feed = await prisma.feed.findUnique({ 
      where: { userId },
    });
    
    if (!feed) {
      // Create if doesn't exist
      return await this.createFeed(userId, articleIds);
    }
    
    return await prisma.feed.update({
      where: { userId },
      data: {
        articleIds,
        currentPosition: 0,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete user's feed
   */
  async deleteFeed(userId: string, requestingUserId: string, isAdmin: boolean) {
    logger.info(`Deleting feed for user: ${userId}`);
    
    // Users can only delete their own feed unless they're admin
    if (userId !== requestingUserId && !isAdmin) {
      throw new ForbiddenError('You can only delete your own feed');
    }
    
    const feed = await prisma.feed.findUnique({ 
      where: { userId },
    });
    
    if (!feed) {
      throw new NotFoundError(`Feed for user ${userId} not found`);
    }
    
    await prisma.feed.delete({ where: { userId } });
  }
}
