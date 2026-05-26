# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built code from build stage
COPY --from=builder /app/dist ./dist

USER node

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "dist/server.js"]
