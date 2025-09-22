# Builder
FROM oven/bun:alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .



# Runtime
FROM oven/bun:alpine AS runtime
WORKDIR /app
COPY --from=builder /app .

# install node to avoid bun erros due to vitest compatibility
# RUN apt-get update \
#   && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
#   && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
#   && apt-get install -y --no-install-recommends nodejs \
#   && apt-get purge -y --auto-remove curl gnupg \
#   && rm -rf /var/lib/apt/lists/* 

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/build ./build
COPY --from=builder /app/.env .env


  
EXPOSE 3000
CMD ["sh", "-c", "bunx prisma migrate deploy && bunx prisma generate && bunx prisma db seed && bun run build/server.js"]
# CMD ["sh", "-c", "bunx prisma migrate deploy && bunx prisma generate && bunx prisma db seed && bun run dist/server/server.js"]




