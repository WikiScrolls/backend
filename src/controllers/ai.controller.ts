import { Request, Response } from 'express';
import { ArticleService } from '../services/article.service';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

const articleService = new ArticleService();

export class AIController {
  /**
   * Process Wikipedia article with AI
   * POST /api/ai/process-article
   * Admin only
   */
  processArticle = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { content, title, wikipediaUrl, imageUrl, publishedDate, categoryId } = req.body;

    const article = await articleService.processAndCreateArticle(content, {
      title,
      wikipediaUrl,
      imageUrl,
      publishedDate: new Date(publishedDate),
      categoryId,
    });

    sendSuccess(res, 'Article processed successfully', { article }, 201);
  });

  /**
   * Regenerate AI summary for article
   * POST /api/ai/regenerate-summary/:articleId
   * Admin only
   */
  regenerateSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { articleId } = req.params;
    const { content } = req.body;

    const article = await articleService.regenerateSummary(articleId, content);

    sendSuccess(res, 'Summary regenerated successfully', { article });
  });

  /**
   * Regenerate audio for article
   * POST /api/ai/regenerate-audio/:articleId
   * Admin only
   */
  regenerateAudio = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { articleId } = req.params;

    const article = await articleService.regenerateAudio(articleId);

    sendSuccess(res, 'Audio regenerated successfully', { article });
  });
}

export const aiController = new AIController();
