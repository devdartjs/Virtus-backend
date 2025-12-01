/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import Redis from "ioredis";

let redis: Redis;
//not using upstash temporally -> forcing redis fly instance (REDIS_URL_UNSET instead REDIS_URL)
try {
  if (process.env.REDIS_URL_CLOUD) {
    console.log("Using REDIS_URL_CLOUD for Redis connection.");
    console.log("REDIS_URL_CLOUD:", process.env.REDIS_URL_CLOUD);
    redis = new Redis(process.env.REDIS_URL_CLOUD);
    await redis.set("foo", "bar");
    console.log("🔗 Connecting to Redis via REDIS_URL_CLOUD (cloud)...");
  } else if (process.env.BUN_ENV === "production") {
    console.log("Using self-hosted Redis for production environment.");
    redis = new Redis({
      host: "virtus-redis.internal",
      port: 6379,
      password: process.env.REDIS_PASSWORD_FLY,
      family: 6,
      connectTimeout: 10000,
      commandTimeout: 10000,
      lazyConnect: true
    });
    console.log("🔗 Connecting to self-hosted Redis via private network...");
  } else {
    console.log("Using local or compose Redis for development environment.");
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined
    });
    console.log("🧩 Connecting to Redis via host/port (compose - stage  || local mode)...");
  }
} catch (error) {
  console.error("❌ Error initializing Redis client:", error);
  throw error;
}

redis.on("connect", () => {
  console.log("✅ Connected to Redis!");
});

redis.on("error", (err: any) => {
  console.error("❌ Error while connecting Redis:", err);
});

export default redis;
