import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { logger } from '../config/logger';

export class CategoryService {
  async getAllCategories() {
    logger.info('Fetching all categories');
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  async getCategoryById(id: string) {
    logger.info(`Fetching category with id: ${id}`);
    
    const category = await prisma.category.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
    
    if (!category) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }
    
    return category;
  }

  async createCategory(data: {
    name: string;
    description?: string;
    color?: string;
  }) {
    logger.info('Creating new category', { name: data.name });
    
    // Check if category with same name exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name },
    });
    
    if (existingCategory) {
      throw new ConflictError(`Category with name "${data.name}" already exists`);
    }
    
    return await prisma.category.create({
      data,
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  async updateCategory(id: string, data: {
    name?: string;
    description?: string;
    color?: string;
  }) {
    logger.info(`Updating category with id: ${id}`);
    
    const category = await prisma.category.findUnique({ where: { id } });
    
    if (!category) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }
    
    // Check if new name conflicts with existing category
    if (data.name && data.name !== category.name) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: data.name },
      });
      
      if (existingCategory) {
        throw new ConflictError(`Category with name "${data.name}" already exists`);
      }
    }
    
    return await prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  async deleteCategory(id: string) {
    logger.info(`Deleting category with id: ${id}`);
    
    const category = await prisma.category.findUnique({ 
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
    
    if (!category) {
      throw new NotFoundError(`Category with id ${id} not found`);
    }
    
    // Check if category has articles
    if (category._count.articles > 0) {
      throw new ConflictError(`Cannot delete category with ${category._count.articles} articles. Please reassign or delete articles first.`);
    }
    
    await prisma.category.delete({ where: { id } });
  }
}
