import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { logger } from '../config/logger';

export class UserService {
  async getAllUsers() {
    logger.info('Fetching all users');
    return await prisma.user.findMany();
  }

  async getUserById(id: number) {
    logger.info(`Fetching user with id: ${id}`);
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    
    return user;
  }

  async createUser(data: { email: string; name?: string }) {
    logger.info('Creating new user', { email: data.email });
    return await prisma.user.create({ data });
  }

  async updateUser(id: number, data: { email?: string; name?: string }) {
    logger.info(`Updating user with id: ${id}`);
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: number) {
    logger.info(`Deleting user with id: ${id}`);
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    
    await prisma.user.delete({ where: { id } });
  }
}
