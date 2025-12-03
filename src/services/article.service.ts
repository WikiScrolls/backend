import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { logger } from '../config/logger';
import { PaginationOptions } from '../types';
import { gorseService } from './gorse.service';

/**
 * Wikipedia article data from PageRank service
 */
interface WikipediaArticle {
  id: string;          // Wikipedia Page ID
  title: string;
  wikipediaUrl: string;
  content: string;     // Extract/intro from Wikipedia
  thumbnail?: string;  // Image URL
}

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
   * Search articles by title, content, aiSummary, or tags
   */
  async searchArticles(query: string, options: PaginationOptions = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    logger.info('Searching articles', { query, page, limit });

    const searchCondition = {
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { content: { contains: query, mode: 'insensitive' as const } },
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

  /**
   * Get article by Wikipedia Page ID
   */
  async getArticleByWikipediaId(wikipediaId: string) {
    logger.info(`Fetching article with Wikipedia ID: ${wikipediaId}`);
    
    return await prisma.article.findUnique({ 
      where: { wikipediaId },
      include: {
        category: true,
      },
    });
  }

  /**
   * Upsert a single article from PageRank/Wikipedia
   * Creates if not exists, returns existing if found
   */
  async upsertFromWikipedia(data: WikipediaArticle) {
    logger.info('Upserting article from Wikipedia', { wikipediaId: data.id, title: data.title });

    // Check if article already exists by Wikipedia ID or URL
    let article = await prisma.article.findFirst({
      where: {
        OR: [
          { wikipediaId: data.id },
          { wikipediaUrl: data.wikipediaUrl },
        ],
      },
      include: {
        category: true,
      },
    });

    if (article) {
      logger.info('Article already exists', { id: article.id, wikipediaId: data.id });
      return { article, created: false };
    }

    // Create new article
    article = await prisma.article.create({
      data: {
        wikipediaId: data.id,
        title: data.title,
        wikipediaUrl: data.wikipediaUrl,
        content: data.content,
        imageUrl: data.thumbnail,
        tags: [],
        isProcessed: false, // Mark for AI processing later
      },
      include: {
        category: true,
      },
    });

    // Sync to Gorse for recommendations
    await gorseService.upsertItem(data.id, data.title);

    logger.info('Created new article from Wikipedia', { id: article.id, wikipediaId: data.id });
    return { article, created: true };
  }

  /**
   * Bulk upsert articles from PageRank/Wikipedia
   */
  async bulkUpsertFromWikipedia(articles: WikipediaArticle[]) {
    logger.info(`Bulk upserting ${articles.length} articles from Wikipedia`);

    const results = {
      created: 0,
      existing: 0,
      articles: [] as any[],
    };

    for (const articleData of articles) {
      try {
        const { article, created } = await this.upsertFromWikipedia(articleData);
        results.articles.push(article);
        if (created) {
          results.created++;
        } else {
          results.existing++;
        }
      } catch (error) {
        logger.error('Failed to upsert article', { wikipediaId: articleData.id, error });
      }
    }

    logger.info('Bulk upsert complete', { created: results.created, existing: results.existing });
    return results;
  }

  /**
   * Get articles by Wikipedia IDs (for PageRank integration)
   * Returns existing articles and identifies missing ones
   */
  async getByWikipediaIds(wikipediaIds: string[]) {
    logger.info(`Fetching articles by Wikipedia IDs`, { count: wikipediaIds.length });

    const articles = await prisma.article.findMany({
      where: {
        wikipediaId: { in: wikipediaIds },
      },
      include: {
        category: true,
      },
    });

    const foundIds = new Set(articles.map(a => a.wikipediaId));
    const missingIds = wikipediaIds.filter(id => !foundIds.has(id));

    return {
      articles,
      missingIds,
    };
  }

  async createArticle(data: {
    title: string;
    wikipediaUrl: string;
    aiSummary?: string;
    content?: string;
    audioUrl?: string;
    imageUrl?: string;
    tags?: string[];
    publishedDate?: Date;
    categoryId?: string;
  }) {
    logger.info('Creating new article', { title: data.title });
    
    return await prisma.article.create({
      data: {
        ...data,
        tags: data.tags || [],
        publishedDate: data.publishedDate || new Date(),
      },
      include: {
        category: true,
      },
    });
  }

  async updateArticle(id: string, data: Partial<{
    title: string;
    wikipediaUrl: string;
    content: string | null;
    aiSummary: string | null;
    audioUrl: string | null;
    imageUrl: string | null;
    tags: string[];
    publishedDate: Date;
    categoryId: string | null;
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

  /**
   * Get unprocessed articles for AI processing queue
   */
  async getUnprocessedArticles(limit: number = 10) {
    return await prisma.article.findMany({
      where: {
        isProcessed: false,
        isActive: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Mark article as processed after AI summary generation
   */
  async markAsProcessed(id: string, aiSummary: string, audioUrl?: string) {
    return await prisma.article.update({
      where: { id },
      data: {
        aiSummary,
        audioUrl,
        isProcessed: true,
      },
    });
  }
}
