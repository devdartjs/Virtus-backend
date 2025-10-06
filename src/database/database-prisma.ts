// /* eslint no-console: ["error", { "allow": ["log", "error"] }] */
// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient;
// };

// export const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: ["query", "error", "warn"],
//     datasources: {
//       db: {
//         url: `${process.env.DATABASE_URL}?connection_limit=5&pool_timeout=10&acquire_timeout=30s`
//       }
//     }
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }

// export default prisma;

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"]
});
