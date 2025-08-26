# Builder
FROM oven/bun:1.1.13 AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile

# Runtime
FROM oven/bun:1.1.13-slim AS runtime
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["sh", "-c", "bunx prisma migrate deploy && bunx prisma generate && bunx prisma db seed && bun src/server.ts"]




