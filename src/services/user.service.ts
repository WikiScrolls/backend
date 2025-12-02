import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { logger } from '../config/logger';
import { PaginationOptions } from '../types';

export class UserService {
  async getAllUsers() {
    logger.info('Fetching all users');
    return await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        lastLoginAt: true,
        profile: true,
      },
    });
  }

  /**
   * Search users by username or displayName
   */
  async searchUsers(query: string, options: PaginationOptions = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    logger.info('Searching users', { query, page, limit });

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { profile: { displayName: { contains: query, mode: 'insensitive' } } },
          ],
        },
        select: {
          id: true,
          username: true,
          createdAt: true,
          profile: {
            select: {
              displayName: true,
              bio: true,
              avatarUrl: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { username: 'asc' },
      }),
      prisma.user.count({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { profile: { displayName: { contains: query, mode: 'insensitive' } } },
          ],
        },
      }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    logger.info(`Fetching user with id: ${id}`);
    const user = await prisma.user.findUnique({ 
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        lastLoginAt: true,
        profile: true,
      },
    });
    
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    
    return user;
  }

  async createUser(data: { 
    username: string; 
    email: string; 
    passwordHash: string;
    isAdmin?: boolean;
  }) {
    logger.info('Creating new user', { username: data.username, email: data.email });
    return await prisma.user.create({ 
      data,
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      },
    });
  }

  async updateUser(id: string, data: { 
    username?: string; 
    email?: string;
    passwordHash?: string;
    isAdmin?: boolean;
  }) {
    logger.info(`Updating user with id: ${id}`);
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async deleteUser(id: string) {
    logger.info(`Deleting user with id: ${id}`);
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    
    await prisma.user.delete({ where: { id } });
  }
}
