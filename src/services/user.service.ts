import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { logger } from '../config/logger';

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
