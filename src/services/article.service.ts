import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { logger } from '../config/logger';
import { PaginationOptions } from '../types';
import { aiService } from './ai.service';
import { ttsService } from './tts.service';

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

  /**
   * Process Wikipedia article: generate summary and audio
   * @param content - Wikipedia article content
   * @param data - Article metadata
   * @returns Created article with AI summary and audio
   */
  async processAndCreateArticle(
    content: string,
    data: {
      title: string;
      wikipediaUrl: string;
      imageUrl?: string;
      publishedDate: Date;
      categoryId: string;
    }
  ) {
    try {
      logger.info('Processing Wikipedia article', { title: data.title });

      // Generate AI summary
      const aiSummary = await aiService.summarizeArticle(content, 200);

      // Generate tags
      const tags = await aiService.generateTags(content, 5);

      // Create article first to get the ID
      const article = await prisma.article.create({
        data: {
          ...data,
          aiSummary,
          tags,
          isProcessed: false,
        },
        include: {
          category: true,
        },
      });

      // Generate audio from summary (async, don't wait)
      ttsService
        .generateAudioSummary(aiSummary, article.id)
        .then(async (audioUrl) => {
          await prisma.article.update({
            where: { id: article.id },
            data: { 
              audioUrl,
              isProcessed: true,
            },
          });
          logger.info('Audio generated and article updated', { articleId: article.id });
        })
        .catch((error) => {
          logger.error('Failed to generate audio', { articleId: article.id, error });
        });

      return article;

    } catch (error) {
      logger.error('Error processing article', error);
      throw error;
    }
  }

  /**
   * Regenerate AI summary for existing article
   * @param id - Article ID
   * @param content - New content to summarize
   * @returns Updated article
   */
  async regenerateSummary(id: string, content: string) {
    logger.info(`Regenerating summary for article: ${id}`);

    const article = await this.getArticleById(id);

    const aiSummary = await aiService.summarizeArticle(content, 200);

    return await prisma.article.update({
      where: { id },
      data: { aiSummary },
      include: { category: true },
    });
  }

  /**
   * Regenerate audio for existing article
   * @param id - Article ID
   * @returns Updated article with new audio URL
   */
  async regenerateAudio(id: string) {
    logger.info(`Regenerating audio for article: ${id}`);

    const article = await this.getArticleById(id);

    // Delete old audio if exists
    if (article.audioUrl) {
      await ttsService.deleteAudio(article.audioUrl);
    }

    // Generate new audio
    const audioUrl = await ttsService.generateAudioSummary(article.aiSummary, id);

    return await prisma.article.update({
      where: { id },
      data: { audioUrl },
      include: { category: true },
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
