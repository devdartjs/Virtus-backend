/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { existsSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

// 1️⃣ Detecta BUN_ENV de várias fontes
const envName =
  process.env.BUN_ENV || // variável do processo (cmd/bash)
  import.meta.env.BUN_ENV || // variável via import.meta.env
  "development"; // fallback

// 2️⃣ Define arquivos
const envFile = `.env.${envName}`;
const fallbackFile = ".env";

// 3️⃣ Seleciona qual arquivo carregar
const pathToLoad = existsSync(join(process.cwd(), envFile))
  ? envFile
  : fallbackFile;

// 4️⃣ Carrega dotenv
dotenv.config({ path: pathToLoad, override: true });

// 5️⃣ Logs de debug
console.log(`✅ Loaded env file: ${pathToLoad}`);
console.log(`✅ BUN_ENV = ${envName}`);
console.log(`✅ PORT = ${process.env.PORT}`);
