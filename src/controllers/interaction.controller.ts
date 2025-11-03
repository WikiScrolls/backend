import { Response } from 'express';
import { InteractionService } from '../services/interaction.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, InteractionType } from '../types';
import { sendSuccess } from '../utils/response';

const interactionService = new InteractionService();

export class InteractionController {
  // Create a new interaction (like, view, save)
  createInteraction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const interaction = await interactionService.createInteraction({
      userId: req.user!.id,
      articleId: req.body.articleId,
      interactionType: req.body.interactionType,
    });
    sendSuccess(res, 'Interaction created successfully', interaction, 201);
  });

  // Get all interactions for the current user
  getMyInteractions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const interactionType = req.query.type as InteractionType | undefined;
    const interactions = await interactionService.getUserInteractions(
      req.user!.id,
      interactionType
    );
    sendSuccess(res, 'Interactions retrieved successfully', interactions);
  });

  // Get interactions for a specific article (admin only)
  getArticleInteractions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const interactions = await interactionService.getArticleInteractions(req.params.articleId);
    sendSuccess(res, 'Article interactions retrieved successfully', interactions);
  });

  // Delete an interaction (unlike, unsave)
  deleteInteraction = asyncHandler(async (req: AuthRequest, res: Response) => {
    await interactionService.deleteInteraction(
      req.user!.id,
      req.body.articleId,
      req.body.interactionType
    );
    sendSuccess(res, 'Interaction deleted successfully', null, 204);
  });

  // Check if user has a specific interaction with an article
  checkInteraction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const hasInteraction = await interactionService.checkInteraction(
      req.user!.id,
      req.params.articleId,
      req.query.type as InteractionType
    );
    sendSuccess(res, 'Interaction check completed', { hasInteraction });
  });
}
