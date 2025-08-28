/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import redis from "./redis";

export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = Number(process.env.CACHE_TTL) || 60
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    console.log(`🟢 Cache hit: ${key}`);
    return JSON.parse(cached);
  }

  console.log(`🟡 Cache miss: ${key}. Fetching from DB...`);

  const result = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(result));
  return result;
}
