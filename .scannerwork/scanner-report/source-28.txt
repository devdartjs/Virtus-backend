/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { Elysia } from "elysia";
import { prisma } from "../../database/database-prisma";
import { record } from "@elysiajs/opentelemetry";
import { seed } from "../../database/database-seed";

export const resetRoute = new Elysia({ prefix: "/api/v1/reset" }).post("/", async ({ set }) =>
  record("db.resetDatabase", async () => {
    try {
      await prisma.$transaction([
        prisma.orderItem.deleteMany(),
        prisma.order.deleteMany(),
        prisma.cartItem.deleteMany(),
        prisma.deliveryOption.deleteMany(),
        prisma.product.deleteMany()
      ]);

      await seed().catch((error) => {
        console.error("❌ Failed to seed:", error);
        throw error;
      });

      set.status = 200;
      return { message: "Database reset and seeded successfully" };
    } catch (error: any) {
      console.error("Reset DB error:", error);
      set.status = 500;
      return { error: "Failed to reset and seed database", details: error.message };
    }
  })
);
