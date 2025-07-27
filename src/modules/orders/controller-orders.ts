import { Elysia, t } from "elysia";
import { record } from "@elysiajs/opentelemetry";
import { prisma } from "../../../prisma/database-prisma";

export const ordersRoute = new Elysia({ prefix: "/api/v1" }).get(
  "/orders",
  async ({ set, query }) =>
    record("db.listOrders", async () => {
      try {
        const expandProduct = query.expand === "products";

        const orders = await prisma.order.findMany({
          include: {
            items: {
              include: {
                product: expandProduct,
              },
            },
          },
        });

        const formatted = orders.map((order) => ({
          id: order.id,
          orderTimeMs: Number(order.orderTimeMs),
          totalCostCents: order.totalCostCents,
          products: order.items.map((item) => {
            const base = {
              productId: item.productId,
              quantity: item.quantity,
              estimatedDeliveryTimeMs: Number(item.estimatedDeliveryTimeMs),
            };

            return expandProduct && item.product
              ? {
                  ...base,
                  product: {
                    id: item.product.id,
                    name: item.product.name,
                    image: item.product.image,
                    stars: item.product.stars,
                    ratingCount: item.product.ratingCount,
                    priceCents: item.product.priceCents,
                    keywords: item.product.keywords,
                  },
                }
              : base;
          }),
        }));

        return formatted;
      } catch (err) {
        console.error("GET /orders error:", err);
        set.status = 500;
        throw new Error("Failed to fetch orders");
      }
    }),
  {
    query: t.Object({
      expand: t.Optional(t.Literal("products")),
    }),
    response: t.Array(
      t.Object({
        id: t.String({ format: "uuid" }),
        orderTimeMs: t.Number(),
        totalCostCents: t.Number(),
        products: t.Array(
          t.Union([
            t.Object({
              productId: t.String({ format: "uuid" }),
              quantity: t.Integer(),
              estimatedDeliveryTimeMs: t.Number(),
            }),
            t.Object({
              productId: t.String({ format: "uuid" }),
              quantity: t.Integer(),
              estimatedDeliveryTimeMs: t.Number(),
              product: t.Object({
                id: t.String({ format: "uuid" }),
                name: t.String(),
                image: t.String(),
                stars: t.Number(),
                ratingCount: t.Integer(),
                priceCents: t.Integer(),
                keywords: t.Array(t.String()),
              }),
            }),
          ])
        ),
      })
    ),
  }
);
