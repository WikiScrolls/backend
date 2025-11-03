import { Response } from 'express';
import { CategoryService } from '../services/category.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

const categoryService = new CategoryService();

export class CategoryController {
  getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
    const categories = await categoryService.getAllCategories();
    sendSuccess(res, 'Categories retrieved successfully', categories);
  });

  getCategoryById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const category = await categoryService.getCategoryById(req.params.id);
    sendSuccess(res, 'Category retrieved successfully', category);
  });

  createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const category = await categoryService.createCategory(req.body);
    sendSuccess(res, 'Category created successfully', category, 201);
  });

  updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    sendSuccess(res, 'Category updated successfully', category);
  });

  deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    await categoryService.deleteCategory(req.params.id);
    sendSuccess(res, 'Category deleted successfully', null, 204);
  });
}
