# Backend Setup Guide - Prisma + Express + TypeScript

A comprehensive guide for setting up a production-ready backend with essential QOL features.

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Database Configuration (Prisma)](#database-configuration-prisma)
3. [Logging (Winston)](#logging-winston)
4. [Security & Middleware](#security--middleware)
5. [Validation (Zod)](#validation-zod)
6. [Error Handling](#error-handling)
7. [Project Structure](#project-structure)
8. [Environment Variables](#environment-variables)
9. [Scripts & Commands](#scripts--commands)

---

## Initial Setup

### Install Dependencies

```bash
# Core dependencies
npm install express @prisma/client prisma dotenv-safe

# Logging & HTTP
npm install winston morgan

# Security & Rate Limiting
npm install cors helmet express-rate-limit

# Validation
npm install zod

# TypeScript & Dev Dependencies
npm install --save-dev typescript ts-node @types/node @types/express @types/cors @types/morgan nodemon
```

### Initialize TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Initialize Prisma

```bash
npx prisma init
```

---

## Database Configuration (Prisma)

### Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Database Configuration with Logging

Create `src/config/database.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
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
```

### Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Logging (Winston)

### Winston Logger Configuration

Create `src/config/logger.ts`:

```typescript
import winston from 'winston';
import path from 'path';

const logDir = 'logs';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'backend-service' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, log to the console with a simpler format
if (process.env.ENVIRONMENT !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let metaStr = '';
          if (Object.keys(meta).length > 0) {
            metaStr = '\n' + JSON.stringify(meta, null, 2);
          }
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      ),
    })
  );
}

export { logger };
```

### Morgan HTTP Logger (Works with Winston)

Create `src/middleware/morganMiddleware.ts`:

```typescript
import morgan, { StreamOptions } from 'morgan';
import { logger } from '../config/logger';

// Stream object for Morgan to use Winston
const stream: StreamOptions = {
  write: (message: string) => logger.http(message.trim()),
};

// Skip logging for health check endpoints
const skip = (req: any) => {
  return req.url === '/health' || req.url === '/';
};

// Morgan format: HTTP method, URL, status code, response time
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

export default morganMiddleware;
```

---

## Security & Middleware

### CORS Configuration

Create `src/middleware/cors.ts`:

```typescript
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);
```

### Rate Limiting

Create `src/middleware/rateLimiter.ts`:

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create endpoint rate limiter
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 create requests per hour
  message: 'Too many create requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Security Headers (Helmet)

Create `src/middleware/security.ts`:

```typescript
import helmet from 'helmet';

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});
```

---

## Validation (Zod)

### Validation Middleware

Create `src/middleware/validation.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { logger } from '../config/logger';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error', { errors: error.errors, path: req.path });
        res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };
};
```

### Example Schema Usage

Create `src/schemas/user.schema.ts`:

```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type GetUserInput = z.infer<typeof getUserSchema>;
```

---

## Error Handling

### Error Classes

Create `src/utils/errors.ts`:

```typescript
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}
```

### Error Handler Middleware

Create `src/middleware/errorHandler.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle AppError (custom errors)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(process.env.ENVIRONMENT === 'development' && { stack: err.stack }),
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          message: 'A record with this value already exists',
        });
      case 'P2025':
        return res.status(404).json({
          message: 'Record not found',
        });
      default:
        return res.status(400).json({
          message: 'Database error occurred',
          ...(process.env.ENVIRONMENT === 'development' && { error: err.message }),
        });
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: 'Invalid data provided',
      ...(process.env.ENVIRONMENT === 'development' && { error: err.message }),
    });
  }

  // Default error
  res.status(500).json({
    message: process.env.ENVIRONMENT === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.ENVIRONMENT === 'development' && { stack: err.stack }),
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

### 404 Handler

Create `src/middleware/notFound.ts`:

```typescript
import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
};
```

---

## Project Structure

```
project-root/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── logger.ts
│   ├── middleware/
│   │   ├── cors.ts
│   │   ├── errorHandler.ts
│   │   ├── morganMiddleware.ts
│   │   ├── notFound.ts
│   │   ├── rateLimiter.ts
│   │   ├── security.ts
│   │   └── validation.ts
│   ├── routes/
│   │   └── user.routes.ts
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── services/
│   │   └── user.service.ts
│   ├── schemas/
│   │   └── user.schema.ts
│   ├── utils/
│   │   └── errors.ts
│   └── index.ts
├── logs/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Environment Variables

### .env.example

```env
# Environment
ENVIRONMENT=development
NODE_ENV=development

# Server
PORT=3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# Logging
LOG_LEVEL=debug

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# JWT (if using authentication)
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
```

### .env (gitignored)

Copy `.env.example` to `.env` and fill in your actual values, especially:
- `DATABASE_URL` - Your Neon or PostgreSQL connection string
- `JWT_SECRET` - Random secure string for JWT signing
- `ALLOWED_ORIGINS` - Your frontend URLs

---

## Main Application Setup

### src/index.ts

```typescript
import express from 'express';
import { config } from 'dotenv-safe';
import { logger } from './config/logger';
import prisma from './config/database';
import corsMiddleware from './middleware/cors';
import { helmetConfig } from './middleware/security';
import morganMiddleware from './middleware/morganMiddleware';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
config({
  allowEmptyValues: true,
  example: '.env.example',
});

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
// app.use('/api/users', userRoutes); // Uncomment when you create routes

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
  logger.info(`Environment: ${process.env.ENVIRONMENT}`);
});

export default app;
```

---

## Example: User Routes, Controller, Service

### src/routes/user.routes.ts

```typescript
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middleware/validation';
import { createUserSchema, getUserSchema } from '../schemas/user.schema';
import { createLimiter } from '../middleware/rateLimiter';

const router = Router();
const userController = new UserController();

router.get('/', userController.getUsers);
router.get('/:id', validate(getUserSchema), userController.getUserById);
router.post('/', createLimiter, validate(createUserSchema), userController.createUser);
router.put('/:id', validate(getUserSchema), userController.updateUser);
router.delete('/:id', validate(getUserSchema), userController.deleteUser);

export default router;
```

### src/controllers/user.controller.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../middleware/errorHandler';

const userService = new UserService();

export class UserController {
  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    res.json({ data: users });
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserById(Number(req.params.id));
    res.json({ data: user });
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    res.status(201).json({ data: user });
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateUser(Number(req.params.id), req.body);
    res.json({ data: user });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await userService.deleteUser(Number(req.params.id));
    res.status(204).send();
  });
}
```

### src/services/user.service.ts

```typescript
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
```

---

## Scripts & Commands

### package.json scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:push": "prisma db push",
    "prisma:seed": "ts-node prisma/seed.ts",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

### Common Commands

```bash
# Development
npm run dev

# Database
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio GUI
npm run prisma:push        # Push schema changes (no migration)

# Production
npm run build              # Compile TypeScript
npm start                  # Start production server

# Code quality
npm run lint               # Lint code
npm run format             # Format code
```

---

## Additional Recommendations

### 1. **Add .gitignore**

```gitignore
node_modules/
dist/
.env
.env.local
logs/
*.log
.DS_Store
```

### 2. **Add nodemon.json** (for better dev experience)

```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "ts-node ./src/index.ts"
}
```

### 3. **Database Seeding** (optional)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });
  
  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Run: `npx prisma db seed`

---

## Quick Start Checklist

- [ ] Install all dependencies
- [ ] Create `tsconfig.json`
- [ ] Initialize Prisma (`npx prisma init`)
- [ ] Set up `.env` file with DATABASE_URL (Neon connection string works!)
- [ ] Create all config files (logger, database)
- [ ] Create all middleware files
- [ ] Set up error handling
- [ ] Create project structure (routes, controllers, services)
- [ ] Run first migration
- [ ] Test server with health check endpoint
- [ ] Set up your first model and CRUD operations

---

## Testing Your Setup

1. Start your server: `npm run dev`
2. Visit: `http://localhost:3000/health`
3. Check logs in `logs/` directory
4. Open Prisma Studio: `npm run prisma:studio`

---

## Need Help?

- Prisma Docs: https://www.prisma.io/docs
- Winston Docs: https://github.com/winstonjs/winston
- Zod Docs: https://zod.dev
- Express Docs: https://expressjs.com

---

**Last Updated**: October 27, 2025