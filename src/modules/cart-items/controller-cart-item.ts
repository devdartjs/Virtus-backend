import { Elysia, t } from "elysia";
import { record } from "@elysiajs/opentelemetry";
import { CartItemsService } from "./service-cart-item";
import { CartItemsSchemaT } from "./schema-cart-item";
import { prisma } from "../../../prisma/database-prisma";

export const cartItemsRoute = new Elysia({ prefix: "/api/v1" })
  .get(
    "/cart-items",
    async ({ set }) => {
      return record("db.listCartItems", async () => {
        try {
          const cartItems = await CartItemsService.getCartItems();
          return cartItems || [];
        } catch (err) {
          set.status = 500;
          throw err;
        }
      });
    },
    {
      response: t.Array(CartItemsSchemaT),
    }
  )
  .post(
    "/cart-items",
    async ({ body, set }) => {
      return record("db.createCartItem", async () => {
        try {
          const { productId, quantity, deliveryOptionId } = body;

          const newItem = await prisma.cartItem.create({
            data: {
              product: { connect: { id: productId } },
              deliveryOption: { connect: { id: deliveryOptionId } },
              quantity,
            },
            select: {
              id: true,
              productId: true,
              quantity: true,
              deliveryOptionId: true,
            },
          });

          set.status = 201;
          return newItem;
        } catch (err: any) {
          if (err.code === "P2003") {
            set.status = 400;
            if (err.meta?.field_name?.includes("productId"))
              throw new Error("Product not found");
            if (err.meta?.field_name?.includes("deliveryOptionId"))
              throw new Error("Delivery option not found");

            throw new Error("Invalid foreign key reference");
          }

          set.status = 500;
          throw new Error("Unexpected error creating cart item");
        }
      });
    },
    {
      body: t.Object({
        productId: t.String({ format: "uuid" }),
        quantity: t.Integer({ minimum: 1, maximum: 10 }),
        deliveryOptionId: t.String(),
      }),
      response: CartItemsSchemaT,
    }
  )
  .delete(
    "/cart-items/:productId",
    async ({ params, set }) => {
      return record("db.deleteCartItem", async () => {
        const { productId } = params;

        const deleted = await prisma.cartItem.deleteMany({
          where: { productId },
        });

        if (deleted.count === 0) {
          set.status = 404;
          throw new Error("Cart item not found");
        }

        set.status = 204;
        return;
      });
    },
    {
      params: t.Object({
        productId: t.String({ format: "uuid" }),
      }),
    }
  )
  .put(
    "/cart-items/:productId",
    async ({ set, body, params }) => {
      return record("db.updateCartItems", async () => {
        const { deliveryOptionId, quantity } = body;
        const { productId } = params;

        if (!quantity && !deliveryOptionId) {
          set.status = 400;
          throw new Error("At least one field must be provided to update.");
        }

        try {
          const updated = await prisma.cartItem.updateMany({
            where: { productId },
            data: {
              ...(quantity ? { quantity } : {}),
              ...(deliveryOptionId
                ? {
                    deliveryOption: { connect: { id: deliveryOptionId } },
                  }
                : {}),
            },
          });

          if (updated.count === 0) {
            set.status = 404;
            throw new Error("Cart item not found");
          }

          const updatedItem = await prisma.cartItem.findFirst({
            where: { productId },
            select: {
              id: true,
              productId: true,
              quantity: true,
              deliveryOptionId: true,
            },
          });

          return updatedItem;
        } catch (err: any) {
          if (err.code === "P2003") {
            set.status = 400;
            if (err.meta?.field_name?.includes("deliveryOptionId")) {
              throw new Error("Delivery option not found");
            }
            throw new Error("Invalid reference");
          }

          set.status = 500;
          throw new Error("Unexpected error updating cart item");
        }
      });
    },
    {
      params: t.Object({
        productId: t.String({ format: "uuid" }),
      }),
      body: t.Object({
        quantity: t.Optional(t.Integer({ minimum: 1, maximum: 10 })),
        deliveryOptionId: t.Optional(t.String()),
      }),
    }
  );
