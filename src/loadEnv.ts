/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { existsSync } from "node:fs";
import { join } from "node:path";
import dotenv from "dotenv";

// 1️⃣ Detecta BUN_ENV de várias fontes, com fallback
const envName = process.env.BUN_ENV || "invalid";

// 2️⃣ Define arquivos
const envFile = `.env.${envName}`;
const fallbackFile = ".env.test";

// 3️⃣ Seleciona qual arquivo carregar
const pathToLoad = existsSync(join(process.cwd(), envFile)) ? envFile : fallbackFile;

// 4️⃣ Carrega dotenv
dotenv.config({ path: pathToLoad, override: true });

// 5️⃣ Logs de debug
console.log("🔧 Environment Configuration (loadEnv)");
console.log("--------------------------------------------------");
console.log(`🔍 Resolved BUN_ENV: ${envName}`);
console.log(`📄 Loading env file: ${pathToLoad}`);
console.log("--------------------------------------------------");
console.log(`✅ PORT = ${process.env.PORT}`);
console.log(`✅ DATABASE_URL = ${process.env.DATABASE_URL}`);
console.log(`✅ REDIS_HOST = ${process.env.REDIS_HOST}`);
console.log(`✅ REDIS_PORT = ${process.env.REDIS_PORT}`);
console.log(`✅ REDIS_PASSWORD = ${process.env.REDIS_PASSWORD ? "****" : "(not set)"}`);
console.log(`✅ BUN_ENV from .env.(final "env") = ${process.env.BUN_ENV}`);
console.log("--------------------------------------------------");
