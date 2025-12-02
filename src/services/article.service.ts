import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { logger } from '../config/logger';
import { PaginationOptions } from '../types';

export class ArticleService {
  async getAllArticles(options: PaginationOptions = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    logger.info('Fetching all articles', { page, limit });

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      }),
      prisma.article.count(),
    ]);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Search articles by title, content (aiSummary), or tags
   */
  async searchArticles(query: string, options: PaginationOptions = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    logger.info('Searching articles', { query, page, limit });

    const searchCondition = {
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { aiSummary: { contains: query, mode: 'insensitive' as const } },
        { tags: { has: query } },
      ],
      isActive: true,
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: searchCondition,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      }),
      prisma.article.count({ where: searchCondition }),
    ]);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getArticleById(id: string) {
    logger.info(`Fetching article with id: ${id}`);
    
    const article = await prisma.article.findUnique({ 
      where: { id },
      include: {
        category: true,
      },
    });
    
    if (!article) {
      throw new NotFoundError(`Article with id ${id} not found`);
    }
    
    return article;
  }

  async createArticle(data: {
    title: string;
    wikipediaUrl: string;
    aiSummary: string;
    audioUrl?: string;
    imageUrl?: string;
    tags?: string[];
    publishedDate: Date;
    categoryId: string;
  }) {
    logger.info('Creating new article', { title: data.title });
    
    return await prisma.article.create({
      data: {
        ...data,
        tags: data.tags || [],
      },
      include: {
        category: true,
      },
    });
  }

  async updateArticle(id: string, data: Partial<{
    title: string;
    wikipediaUrl: string;
    aiSummary: string;
    audioUrl: string | null;
    imageUrl: string | null;
    tags: string[];
    publishedDate: Date;
    categoryId: string;
    isActive: boolean;
    isProcessed: boolean;
  }>) {
    logger.info(`Updating article with id: ${id}`);
    
    const article = await prisma.article.findUnique({ where: { id } });
    
    if (!article) {
      throw new NotFoundError(`Article with id ${id} not found`);
    }
    
    return await prisma.article.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async deleteArticle(id: string) {
    logger.info(`Deleting article with id: ${id}`);
    
    const article = await prisma.article.findUnique({ where: { id } });
    
    if (!article) {
      throw new NotFoundError(`Article with id ${id} not found`);
    }
    
    await prisma.article.delete({ where: { id } });
  }

  async incrementViewCount(id: string) {
    return await prisma.article.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }
}
