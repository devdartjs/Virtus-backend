import { Elysia } from "elysia";
import { record } from "@elysiajs/opentelemetry";

import { OrdersQuerySchema, OrdersResponseSchema } from "./schema.orders";

import { listOrders } from "./service-orders";

export const ordersRoute = new Elysia({ prefix: "/api/v1" }).get(
  "/orders",
  async ({ set, query }) =>
    record("db.listOrders", async () => {
      try {
        const expandProduct = query.expand === "products";
        const orders = await listOrders(expandProduct);
        return orders;
      } catch (err) {
        console.error("GET /orders error:", err);
        set.status = 500;
        throw new Error("Failed to fetch orders");
      }
    }),
  {
    query: OrdersQuerySchema,
    response: OrdersResponseSchema,
  }
);
