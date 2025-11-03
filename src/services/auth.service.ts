import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { LoginCredentials, SignupData, UserPayload } from '../types';
import { generateToken } from '../utils/token';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { logger } from '../config/logger';

const SALT_ROUNDS = 10;

export class AuthService {
  /**
   * Register a new user
   */
  async signup(data: SignupData) {
    logger.info('Creating new user', { username: data.username, email: data.email });

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new ConflictError('Email already registered');
      }
      throw new ConflictError('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    // Generate token
    const payload: UserPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const token = generateToken(payload);

    return {
      user,
      token,
    };
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials) {
    logger.info('User login attempt', { email: credentials.email });

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate token
    const payload: UserPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const token = generateToken(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      token,
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    logger.info('Fetching user profile', { userId });

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      throw new UnauthorizedError('User not found');
    }

    return user;
  }
}
