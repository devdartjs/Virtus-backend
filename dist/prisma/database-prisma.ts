import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// import { PrismaClient } from "@prisma/client";

// export const prisma = new PrismaClient();

// const connectDB = async () => {
//   await prisma.$connect();
//   console.log("Database connected");
// };

// connectDB();

// connectDB().catch((e) => {
//   console.error(e);
//   process.exit(1);
// });

// connectDB().finally(async () => {
//   await prisma.$disconnect();
// });
