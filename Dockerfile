# Builder
FROM oven/bun:1.1.13 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY prisma ./prisma
COPY src ./src
COPY .env ./
COPY .env.stage ./
RUN bun run build


# Runtime
FROM oven/bun:1.1.13-slim AS runtime
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["sh", "-c", "bunx prisma migrate deploy && bunx prisma generate && bunx prisma db seed && bun src/server.ts"]




