# Multi-stage build for optimal image size
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.19.0

# Set working directory
WORKDIR /app

# Copy package files (pnpm needs these for installation)
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# ===== Dependencies stage =====
FROM base AS dependencies

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# ===== Build stage =====
FROM base AS build

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code and config files
COPY . .

# Generate Prisma Client
RUN pnpm prisma:generate

# Build TypeScript
RUN pnpm build

# ===== Production stage =====
FROM base AS production

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/prisma ./prisma
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

# Start the application
CMD ["pnpm", "start"]
