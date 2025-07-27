import { Elysia } from "elysia";
import { prisma } from "../../../prisma/database-prisma";
import { record } from "@elysiajs/opentelemetry";
import { seed } from "../../../prisma/database-seed";

export const resetRoute = new Elysia({ prefix: "/api/v1/reset" }).post(
  "/",
  async ({ set }) =>
    record("db.resetDatabase", async () => {
      try {
        await prisma.$transaction([
          prisma.orderItem.deleteMany(),
          prisma.order.deleteMany(),
          prisma.cartItem.deleteMany(),
          prisma.deliveryOption.deleteMany(),
          prisma.product.deleteMany(),
        ]);

        await seed().catch(() => {
          console.error("❌ Failed to seed:");
          process.exit(1);
        });

        set.status = 200;
        return { message: "Database reset and seeded successfully" };
      } catch (error) {
        console.error("Reset DB error:", error);
        set.status = 500;
        throw new Error("Failed to reset and seed database");
      }
    })
);
