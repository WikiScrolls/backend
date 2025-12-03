import { Response } from 'express';
import { ArticleService } from '../services/article.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';
import prisma from '../config/database';

const articleService = new ArticleService();

export class ArticleController {
  getArticles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const options = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      sortBy: (req.query.sortBy as string) || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };
    
    const result = await articleService.getAllArticles(options);
    sendSuccess(res, 'Articles retrieved successfully', result);
  });

  searchArticles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const query = req.query.q as string;
    const options = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      sortBy: (req.query.sortBy as string) || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };
    
    const result = await articleService.searchArticles(query, options);
    sendSuccess(res, 'Articles search completed', result);
  });

  getArticleById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const article = await articleService.getArticleById(req.params.id);
    sendSuccess(res, 'Article retrieved successfully', article);
  });

  /**
   * Get article by Wikipedia page ID
   * GET /api/articles/wikipedia/:wikipediaId
   */
  getByWikipediaId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const article = await articleService.getArticleByWikipediaId(req.params.wikipediaId);
    if (!article) {
      return sendSuccess(res, 'Article not found', null, 404);
    }
    sendSuccess(res, 'Article retrieved successfully', article);
  });

  /**
   * Get article by Wikipedia URL
   * GET /api/articles/wikipedia/url?url=...
   */
  getByWikipediaUrl = asyncHandler(async (req: AuthRequest, res: Response) => {
    const url = req.query.url as string;
    const article = await prisma.article.findFirst({
      where: { wikipediaUrl: url },
      include: { category: true },
    });
    if (!article) {
      return sendSuccess(res, 'Article not found', null, 404);
    }
    sendSuccess(res, 'Article retrieved successfully', article);
  });

  createArticle = asyncHandler(async (req: AuthRequest, res: Response) => {
    const article = await articleService.createArticle(req.body);
    sendSuccess(res, 'Article created successfully', article, 201);
  });

  updateArticle = asyncHandler(async (req: AuthRequest, res: Response) => {
    const article = await articleService.updateArticle(req.params.id, req.body);
    sendSuccess(res, 'Article updated successfully', article);
  });

  deleteArticle = asyncHandler(async (req: AuthRequest, res: Response) => {
    await articleService.deleteArticle(req.params.id);
    sendSuccess(res, 'Article deleted successfully', null, 204);
  });

  incrementViewCount = asyncHandler(async (req: AuthRequest, res: Response) => {
    const article = await articleService.incrementViewCount(req.params.id);
    sendSuccess(res, 'View count incremented successfully', article);
  });

  /**
   * Upsert a single article from Wikipedia/PageRank
   * POST /api/articles/upsert
   */
  upsertArticle = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { article, created } = await articleService.upsertFromWikipedia(req.body);
    sendSuccess(
      res,
      created ? 'Article created successfully' : 'Article already exists',
      { article, created },
      created ? 201 : 200
    );
  });

  /**
   * Bulk upsert articles from Wikipedia/PageRank
   * POST /api/articles/upsert-batch
   */
  upsertBatch = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { articles } = req.body;
    const result = await articleService.bulkUpsertFromWikipedia(articles);
    sendSuccess(res, 'Bulk upsert completed', result, 200);
  });

  /**
   * Get articles by Wikipedia IDs
   * POST /api/articles/by-wikipedia-ids
   */
  getByWikipediaIds = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { wikipediaIds } = req.body;
    const result = await articleService.getByWikipediaIds(wikipediaIds);
    sendSuccess(res, 'Articles retrieved', result);
  });

  /**
   * Get unprocessed articles for AI processing
   * GET /api/articles/unprocessed
   */
  getUnprocessedArticles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const articles = await articleService.getUnprocessedArticles(limit);
    sendSuccess(res, 'Unprocessed articles retrieved', articles);
  });

  /**
   * Mark article as processed after AI summary
   * POST /api/articles/:id/processed
   */
  markAsProcessed = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { aiSummary, audioUrl } = req.body;
    const article = await articleService.markAsProcessed(req.params.id, aiSummary, audioUrl);
    sendSuccess(res, 'Article marked as processed', article);
  });
}
