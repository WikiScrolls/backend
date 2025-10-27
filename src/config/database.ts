import { PrismaClient } from '../../generated/prisma';
import { logger } from './logger';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log queries in development mode
if (process.env.ENVIRONMENT === 'development') {
  prisma.$on('query', (e: any) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Params: ' + e.params);
    logger.debug('Duration: ' + e.duration + 'ms');
  });
}

prisma.$on('error', (e: any) => {
  logger.error('Prisma Error: ' + e.message);
});

prisma.$on('info', (e: any) => {
  logger.info('Prisma Info: ' + e.message);
});

prisma.$on('warn', (e: any) => {
  logger.warn('Prisma Warning: ' + e.message);
});

export default prisma;
