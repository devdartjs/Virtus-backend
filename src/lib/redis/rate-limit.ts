/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import redis from "./redis";

export async function rateLimiter(ip: string) {
  const window = Number(process.env.RATE_LIMIT_WINDOW) || 60;
  const max = Number(process.env.RATE_LIMIT_MAX) || 10;

  const key = `rate:${ip}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, window);
  }

  if (current > max) {
    const ttl = await redis.ttl(key);
    const retryAfter = ttl > 0 ? ttl : window;
    const error = new Error(
      `Too many requests. Try again in ${retryAfter} seconds.`
    );
    (error as any).status = 429;
    throw error;
  }
}
