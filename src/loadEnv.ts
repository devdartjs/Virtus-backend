/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { existsSync } from "node:fs";
import { join } from "node:path";
// import dotenv from "dotenv";

const envName = process.env.BUN_ENV || "development";
const envFile = `.env.${envName}`;
const fallbackFile = ".env.test";
const pathToLoad = existsSync(join(process.cwd(), envFile)) ? envFile : fallbackFile;
// dotenv.config({ path: pathToLoad, override: false });

console.log("🔧 Environment Configuration (loadEnv)");
console.log("--------------------------------------------------");
console.log(`🔍 Resolved BUN_ENV: ${envName}`);
console.log(`📄 Loading env file: ${pathToLoad}`);
console.log("--------------------------------------------------");
console.log(`✅ PORT = ${process.env.PORT}`);
console.log(`✅ REDIS_HOST = ${process.env.REDIS_HOST}`);
console.log(`✅ REDIS_PORT = ${process.env.REDIS_PORT}`);
console.log(`✅ REDIS_PASSWORD = ${process.env.REDIS_PASSWORD ? "****" : "(not set)"}`);
console.log(`✅ BUN_ENV from .env.(final "env") = ${process.env.BUN_ENV}`);
console.log(`✅ DATABASE_URL = ${process.env.DATABASE_URL}`);
console.log("--------------------------------------------------");
