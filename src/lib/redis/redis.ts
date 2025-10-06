/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import Redis from "ioredis";

let redis: Redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    family: 6,
    tls: {}
  });
  console.log("🔗 Connecting to Redis via REDIS_URL...:", process.env.REDIS_URL);
} else {
  redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  });
  console.log("🧩 Connecting to Redis via host/port (local mode)...");
}

redis.on("connect", () => {
  console.log("✅ Connected to Redis!");
});

redis.on("error", (err: any) => {
  console.error("❌ Error while connecting Redis:", err);
});

export default redis;
