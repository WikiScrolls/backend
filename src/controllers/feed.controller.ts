import { Response } from 'express';
import { FeedService } from '../services/feed.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

const feedService = new FeedService();

export class FeedController {
  // Get all feeds (admin only)
  getAllFeeds = asyncHandler(async (req: AuthRequest, res: Response) => {
    const feeds = await feedService.getAllFeeds();
    sendSuccess(res, 'Feeds retrieved successfully', feeds);
  });

  // Get feed by user ID
  getFeedByUserId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const feed = await feedService.getFeedByUserId(
      userId,
      req.user!.id,
      req.user!.isAdmin
    );
    sendSuccess(res, 'Feed retrieved successfully', feed);
  });

  // Get current user's feed
  getMyFeed = asyncHandler(async (req: AuthRequest, res: Response) => {
    const feed = await feedService.getMyFeed(req.user!.id);
    sendSuccess(res, 'Feed retrieved successfully', feed);
  });

  // Create feed (auto-creates on first access)
  createFeed = asyncHandler(async (req: AuthRequest, res: Response) => {
    const feed = await feedService.createFeed(req.user!.id, req.body.articleIds);
    sendSuccess(res, 'Feed created successfully', feed, 201);
  });

  // Update feed by user ID
  updateFeedByUserId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const feed = await feedService.updateFeed(
      userId,
      req.body,
      req.user!.id,
      req.user!.isAdmin
    );
    sendSuccess(res, 'Feed updated successfully', feed);
  });

  // Update current user's feed
  updateMyFeed = asyncHandler(async (req: AuthRequest, res: Response) => {
    const feed = await feedService.updateFeed(
      req.user!.id,
      req.body,
      req.user!.id,
      req.user!.isAdmin
    );
    sendSuccess(res, 'Feed updated successfully', feed);
  });

  // Update feed position
  updateFeedPosition = asyncHandler(async (req: AuthRequest, res: Response) => {
    const feed = await feedService.updateFeedPosition(
      req.user!.id,
      req.body.position
    );
    sendSuccess(res, 'Feed position updated successfully', feed);
  });

  // Regenerate feed
  regenerateFeed = asyncHandler(async (req: AuthRequest, res: Response) => {
    const feed = await feedService.regenerateFeed(
      req.user!.id,
      req.body.articleIds
    );
    sendSuccess(res, 'Feed regenerated successfully', feed);
  });

  // Delete feed by user ID
  deleteFeedByUserId = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    await feedService.deleteFeed(
      userId,
      req.user!.id,
      req.user!.isAdmin
    );
    sendSuccess(res, 'Feed deleted successfully', null, 204);
  });

  // Delete current user's feed
  deleteMyFeed = asyncHandler(async (req: AuthRequest, res: Response) => {
    await feedService.deleteFeed(
      req.user!.id,
      req.user!.id,
      req.user!.isAdmin
    );
    sendSuccess(res, 'Feed deleted successfully', null, 204);
  });
}
