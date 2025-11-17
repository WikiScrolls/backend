import express from 'express';
import { config } from 'dotenv';
import { logger } from './config/logger';
import prisma from './config/database';
import corsMiddleware from './middleware/cors';
import { helmetConfig } from './middleware/security';
import morganMiddleware from './middleware/morganMiddleware';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import articleRoutes from './routes/article.routes';
import userProfileRoutes from './routes/userProfile.routes';
import interactionRoutes from './routes/interaction.routes';
import feedRoutes from './routes/feed.routes';
import uploadRoutes from './routes/upload.routes';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);
app.use(helmetConfig);
app.use(morganMiddleware);

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/profiles', userProfileRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/feeds', feedRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.ENVIRONMENT || 'development'}`);
});

export default app;

