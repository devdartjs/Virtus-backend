/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis!");
});

redis.on("error", (err: any) => {
  console.error("❌ Error on Redis:", err);
});

export default redis;
