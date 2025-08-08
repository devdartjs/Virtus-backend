# Stage 1: Build
FROM oven/bun:1.1.13 AS builder

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN bunx prisma generate

# Build the application
RUN bun build src/server.ts --target=bun --format=esm --outfile=dist/server.js

# Stage 2: Production image
FROM oven/bun:1.1.13-slim

WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env .env

# Install only production dependencies
RUN bun install --production --frozen-lockfile

EXPOSE 3000

# Run the app
CMD ["bun", "dist/server.js"]
