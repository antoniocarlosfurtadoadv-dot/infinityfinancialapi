# Build stage
FROM node:22-alpine AS builder

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application files
COPY . .


# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN yarn build

# Production stage
FROM node:22-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user early so --chown can be used on COPY
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files and entrypoint script
COPY --chown=nodejs:nodejs package.json yarn.lock ./
COPY --chown=nodejs:nodejs prisma ./prisma/
COPY --chown=nodejs:nodejs prisma.config.ts ./
COPY --chown=nodejs:nodejs tsconfig.json ./
COPY --chown=nodejs:nodejs docker-entrypoint.sh ./

# Copy node_modules from builder (includes devDeps like prisma CLI needed for migrations)
COPY --chown=nodejs:nodejs --from=builder /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist

RUN chmod +x docker-entrypoint.sh

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run migrations and start the application
CMD ["/bin/sh", "-c", "npx prisma migrate deploy && node dist/main"]
