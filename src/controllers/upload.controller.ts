import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { uploadImage, deleteImage, extractPublicId } from '../utils/cloudinary';
import prisma from '../config/database';
import { logger } from '../config/logger';

export class UploadController {
  /**
   * Upload profile avatar for current user
   */
  uploadProfileAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new BadRequestError('No image file provided');
    }

    const userId = req.user!.id;

    // Check if user profile exists
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError('Profile not found. Please create a profile first.');
    }

    // Delete old avatar from Cloudinary if it exists
    if (profile.avatarUrl) {
      const oldPublicId = extractPublicId(profile.avatarUrl);
      if (oldPublicId) {
        await deleteImage(oldPublicId).catch((err) => {
          logger.warn('Failed to delete old avatar', err);
        });
      }
    }

    // Upload new avatar to Cloudinary
    const result = await uploadImage(
      req.file.buffer,
      'wikiscrolls/avatars',
      `avatar-${userId}`
    );

    // Update profile with new avatar URL
    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: { avatarUrl: result.secure_url },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    sendSuccess(res, 'Avatar uploaded successfully', {
      profile: updatedProfile,
      uploadInfo: {
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
      },
    });
  });

  /**
   * Delete profile avatar for current user
   */
  deleteProfileAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError('Profile not found');
    }

    if (!profile.avatarUrl) {
      throw new BadRequestError('No avatar to delete');
    }

    // Delete from Cloudinary
    const publicId = extractPublicId(profile.avatarUrl);
    if (publicId) {
      await deleteImage(publicId);
    }

    // Update profile to remove avatar URL
    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: { avatarUrl: null },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    sendSuccess(res, 'Avatar deleted successfully', updatedProfile);
  });

  /**
   * Upload image for an article (admin only)
   */
  uploadArticleImage = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new BadRequestError('No image file provided');
    }

    const { articleId } = req.params;

    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundError('Article not found');
    }

    // Delete old image from Cloudinary if it exists
    if (article.imageUrl) {
      const oldPublicId = extractPublicId(article.imageUrl);
      if (oldPublicId) {
        await deleteImage(oldPublicId).catch((err) => {
          logger.warn('Failed to delete old article image', err);
        });
      }
    }

    // Upload new image to Cloudinary
    const result = await uploadImage(
      req.file.buffer,
      'wikiscrolls/articles',
      `article-${articleId}`
    );

    // Update article with new image URL
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { imageUrl: result.secure_url },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    sendSuccess(res, 'Article image uploaded successfully', {
      article: updatedArticle,
      uploadInfo: {
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
      },
    });
  });

  /**
   * Delete article image (admin only)
   */
  deleteArticleImage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { articleId } = req.params;

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundError('Article not found');
    }

    if (!article.imageUrl) {
      throw new BadRequestError('No article image to delete');
    }

    // Delete from Cloudinary
    const publicId = extractPublicId(article.imageUrl);
    if (publicId) {
      await deleteImage(publicId);
    }

    // Update article to remove image URL
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { imageUrl: null },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    sendSuccess(res, 'Article image deleted successfully', updatedArticle);
  });
}
