import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../config/logger';
import { InteractionType } from '../types';

export class InteractionService {
  /**
   * Create a new interaction (LIKE, VIEW, SAVE)
   * Automatically updates denormalized counts on Article
   */
  async createInteraction(data: {
    userId: string;
    articleId: string;
    interactionType: InteractionType;
  }) {
    logger.info('Creating interaction', data);
    
    // Verify article exists
    const article = await prisma.article.findUnique({
      where: { id: data.articleId },
    });
    
    if (!article) {
      throw new NotFoundError('Article not found');
    }
    
    // Check if interaction already exists (for LIKE and SAVE)
    if (data.interactionType !== 'VIEW') {
      const existingInteraction = await prisma.userInteraction.findUnique({
        where: {
          userId_articleId_interactionType: {
            userId: data.userId,
            articleId: data.articleId,
            interactionType: data.interactionType,
          },
        },
      });
      
      if (existingInteraction) {
        throw new BadRequestError(`You have already ${data.interactionType.toLowerCase()}d this article`);
      }
    }
    
    // Create interaction and update article counts in a transaction
    const [interaction] = await prisma.$transaction([
      prisma.userInteraction.create({
        data,
        include: {
          article: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      // Update denormalized count based on interaction type
      prisma.article.update({
        where: { id: data.articleId },
        data: {
          ...(data.interactionType === 'VIEW' && { viewCount: { increment: 1 } }),
          ...(data.interactionType === 'LIKE' && { likeCount: { increment: 1 } }),
          ...(data.interactionType === 'SAVE' && { saveCount: { increment: 1 } }),
        },
      }),
    ]);
    
    return interaction;
  }

  /**
   * Get all interactions for a user
   */
  async getUserInteractions(userId: string, interactionType?: InteractionType) {
    logger.info('Fetching user interactions', { userId, interactionType });
    
    return await prisma.userInteraction.findMany({
      where: {
        userId,
        ...(interactionType && { interactionType }),
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            wikipediaUrl: true,
            aiSummary: true,
            audioUrl: true,
            tags: true,
            publishedDate: true,
            viewCount: true,
            likeCount: true,
            saveCount: true,
            category: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get interactions for a specific article
   */
  async getArticleInteractions(articleId: string) {
    logger.info('Fetching article interactions', { articleId });
    
    return await prisma.userInteraction.findMany({
      where: { articleId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Delete an interaction (unlike, unsave)
   * VIEWs typically shouldn't be deleted
   */
  async deleteInteraction(userId: string, articleId: string, interactionType: InteractionType) {
    logger.info('Deleting interaction', { userId, articleId, interactionType });
    
    if (interactionType === 'VIEW') {
      throw new BadRequestError('Cannot delete VIEW interactions');
    }
    
    const interaction = await prisma.userInteraction.findUnique({
      where: {
        userId_articleId_interactionType: {
          userId,
          articleId,
          interactionType,
        },
      },
    });
    
    if (!interaction) {
      throw new NotFoundError('Interaction not found');
    }
    
    // Delete interaction and update article counts in a transaction
    await prisma.$transaction([
      prisma.userInteraction.delete({
        where: {
          userId_articleId_interactionType: {
            userId,
            articleId,
            interactionType,
          },
        },
      }),
      // Decrement denormalized count
      prisma.article.update({
        where: { id: articleId },
        data: {
          ...(interactionType === 'LIKE' && { likeCount: { decrement: 1 } }),
          ...(interactionType === 'SAVE' && { saveCount: { decrement: 1 } }),
        },
      }),
    ]);
  }

  /**
   * Check if user has a specific interaction with an article
   */
  async checkInteraction(userId: string, articleId: string, interactionType: InteractionType) {
    const interaction = await prisma.userInteraction.findUnique({
      where: {
        userId_articleId_interactionType: {
          userId,
          articleId,
          interactionType,
        },
      },
    });
    
    return !!interaction;
  }
}
