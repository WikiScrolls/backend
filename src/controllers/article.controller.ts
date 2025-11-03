import { Response } from 'express';
import { ArticleService } from '../services/article.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

const articleService = new ArticleService();

export class ArticleController {
  getArticles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, sortBy, sortOrder } = req.query;
    const result = await articleService.getAllArticles({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });
    sendSuccess(res, 'Articles retrieved successfully', result);
  });

  getArticleById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const article = await articleService.getArticleById(req.params.id);
    // Increment view count
    await articleService.incrementViewCount(req.params.id);
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
}
