import { Elysia, t } from "elysia";
import { record } from "@elysiajs/opentelemetry";
import { CartItemsSchemaT } from "./schema-cart-item";
import { CartItemsService } from "./service-cart-item";

export const cartItemsRoute = new Elysia({ prefix: "/api/v1" })
  .get(
    "/cart-items",
    async ({ set }) => {
      return record("db.listCartItems", async () => {
        try {
          return await CartItemsService.getCartItems();
        } catch (err) {
          console.error("GET /cart-items error:", err);
          set.status = 500;
          throw new Error("Failed to fetch cart items");
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
          const newItem = await CartItemsService.createCartItem(body);
          set.status = 201;
          return newItem;
        } catch (err: any) {
          console.error("POST /cart-items error:", err);

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
        deliveryOptionId: t.String({ format: "uuid" }),
      }),
      response: CartItemsSchemaT,
    }
  )
  .delete(
    "/cart-items/:id",
    async ({ params, set }) => {
      return record("db.deleteCartItem", async () => {
        try {
          await CartItemsService.deleteCartItem(params.id);
          set.status = 204;
          return;
        } catch (err) {
          console.error("DELETE /cart-items/:id error:", err);
          set.status = 404;
          throw new Error("Cart item not found");
        }
      });
    },
    {
      params: t.Object({
        id: t.String({ format: "uuid" }),
      }),
    }
  )
  .put(
    "/cart-items/:id",
    async ({ set, body, params }) => {
      return record("db.updateCartItem", async () => {
        if (!body.quantity && !body.deliveryOptionId) {
          set.status = 400;
          throw new Error("At least one field must be provided to update.");
        }

        try {
          const updated = await CartItemsService.updateCartItem(
            params.id,
            body
          );
          return updated;
        } catch (err: any) {
          console.error("PUT /cart-items/:id error:", err);

          if (err.code === "P2025") {
            set.status = 404;
            throw new Error("Cart item not found");
          }

          if (err.code === "P2003") {
            set.status = 400;
            if (err.meta?.field_name?.includes("deliveryOptionId"))
              throw new Error("Delivery option not found");
            throw new Error("Invalid reference");
          }

          set.status = 500;
          throw new Error("Unexpected error updating cart item");
        }
      });
    },
    {
      params: t.Object({
        id: t.String({ format: "uuid" }),
      }),
      body: t.Object({
        quantity: t.Optional(t.Integer({ minimum: 1, maximum: 10 })),
        deliveryOptionId: t.Optional(t.String({ format: "uuid" })),
      }),
      response: CartItemsSchemaT,
    }
  );
