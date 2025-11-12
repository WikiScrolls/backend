# Multi-stage build for optimal image size
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.19.0

# Set working directory
WORKDIR /app

# Copy package files (pnpm needs these for installation)
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Copy Prisma schema (needed for prisma generate during build)
COPY prisma ./prisma

# ===== Dependencies stage =====
FROM base AS dependencies

# Copy prisma files (needed before install to avoid postinstall errors)
COPY prisma ./prisma

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Generate Prisma Client after dependencies are installed
# Use a dummy DATABASE_URL for build time (not used, just satisfies validation)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# ===== Build stage =====
FROM base AS build

# Copy dependencies from previous stage (includes generated Prisma Client)
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/generated ./generated

# Copy source code and config files
COPY . .

# Build TypeScript (no need to regenerate Prisma Client, already done in dependencies stage)
RUN pnpm build

# ===== Production stage =====
FROM base AS production

# Copy prisma files for production (needed for runtime)
COPY prisma ./prisma

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/package.json ./package.json

# Create logs directory
RUN mkdir -p /app/logs && chown -R node:node /app

# Switch to non-root user for security
USER node

# Expose port (Easypanel will map this)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application (with automatic database migration)
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
