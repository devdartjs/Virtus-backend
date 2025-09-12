# Builder
FROM oven/bun:1.1.13 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY prisma ./prisma
COPY src ./src
# COPY .env .
# COPY .env.stage .
# RUN bun run build
ARG ENV_FILE
COPY ${ENV_FILE} .env
RUN bun run build:stage

# Runtime
FROM oven/bun:1.1.13-slim AS runtime
WORKDIR /app
COPY --from=builder /app .

#install node to avoid bun erros due to vitest compatibility
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && apt-get purge -y --auto-remove curl gnupg \
  && rm -rf /var/lib/apt/lists/*  

EXPOSE 3000
CMD ["sh", "-c", "bunx prisma migrate deploy && bunx prisma generate && bunx prisma db seed && bun src/server.ts"]




