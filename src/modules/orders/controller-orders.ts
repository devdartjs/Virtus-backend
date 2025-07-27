import { Elysia, t } from "elysia";
import { record } from "@elysiajs/opentelemetry";
import { OrdersQuerySchema, OrdersResponseSchema } from "./schema.orders";
import { listOrders, createOrder } from "./service-orders";
import { CreateOrderSchema } from "./schema.orders";
import { getOrderById } from "./service-orders";
import { OrderSchema } from "./schema.orders";

export const ordersRoute = new Elysia({ prefix: "/api/v1" })
  .get(
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
  )
  .post(
    "/orders",
    async ({ set, body }) =>
      record("db.createOrder", async () => {
        try {
          const order = await createOrder(body.cart);
          set.status = 201;

          return {
            id: order.id,
            orderTimeMs: Number(order.orderTimeMs),
            totalCostCents: order.totalCostCents,
            products: order.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              estimatedDeliveryTimeMs: Number(item.estimatedDeliveryTimeMs),
              product: item.product && {
                id: item.product.id,
                name: item.product.name,
                image: item.product.image,
                stars: item.product.stars,
                ratingCount: item.product.ratingCount,
                priceCents: item.product.priceCents,
                keywords: item.product.keywords,
              },
            })),
          };
        } catch (error) {
          console.error("POST /orders error:", error);
          set.status = 400;
          throw new Error(
            error instanceof Error ? error.message : "Failed to create order"
          );
        }
      }),
    {
      body: CreateOrderSchema,
      response: t.Object({
        id: t.String({ format: "uuid" }),
        orderTimeMs: t.Number(),
        totalCostCents: t.Number(),
        products: t.Array(
          t.Intersect([
            t.Object({
              productId: t.String({ format: "uuid" }),
              quantity: t.Integer(),
              estimatedDeliveryTimeMs: t.Number(),
            }),
            t.Optional(
              t.Object({
                product: t.Object({
                  id: t.String({ format: "uuid" }),
                  name: t.String(),
                  image: t.String(),
                  stars: t.Number(),
                  ratingCount: t.Integer(),
                  priceCents: t.Integer(),
                  keywords: t.Array(t.String()),
                }),
              })
            ),
          ])
        ),
      }),
    }
  )
  .get(
    "/orders/:orderid",
    async ({ set, query, params }) =>
      record("db.getOrderById", async () => {
        try {
          const expandProduct = query.expand === "products";
          const order = await getOrderById(params.orderid, expandProduct);

          if (!order) {
            set.status = 404;
            throw new Error("Order not found");
          }

          return order;
        } catch (error) {
          console.error("GET /orders/:orderid error:", error);
          if (set.status !== 404) set.status = 500;
          throw error instanceof Error
            ? error
            : new Error("Failed to fetch order");
        }
      }),
    {
      query: OrdersQuerySchema,
      params: t.Object({
        orderid: t.String({ format: "uuid" }),
      }),
      response: OrderSchema,
    }
  );
