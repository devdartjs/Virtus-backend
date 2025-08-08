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

CMD ["bun", "src/server.ts"]

#cmd utils
#docker builder prune --all --force
#docker image prune --all --force
#docker build --no-cache -t virtus-backend:v1 .
