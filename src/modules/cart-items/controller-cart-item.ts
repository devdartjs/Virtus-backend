/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { Elysia, t } from "elysia";
import { record } from "@elysiajs/opentelemetry";
import { CartItemsSchemaT } from "./schema-cart-item";
import { CartItemsService } from "./service-cart-item";
import { ProductService } from "../products/service-products";

export const cartItemsRoute = new Elysia({ prefix: "/api/v1/cart-items" })
  .get(
    "/",
    async ({ set, query }) =>
      record("db.listCartItems", async () => {
        try {
          const { expand } = query;
          let cartItems = await CartItemsService.getCartItems();

          if (expand === "product") {
            const allProducts = await ProductService.getAllProducts();

            const productMap = new Map(
              allProducts.map((product) => [product.id, product])
            );

            cartItems = cartItems.map((item) => ({
              ...item,
              product: productMap.get(item.productId) || null,
            }));
          }

          return cartItems;
        } catch (err) {
          console.error("GET /cart-items error:", err);
          set.status = 500;
          throw new Error("Failed to fetch cart items");
        }
      }),
    {
      query: t.Object({
        expand: t.Optional(t.Enum({ product: "product" })),
      }),
      response: t.Array(CartItemsSchemaT),
    }
  )
  .post(
    "/",
    async ({ body, set }) =>
      record("db.createOrUpdateCartItem", async () => {
        const { productId, quantity } = body;

        if (quantity < 1 || quantity > 10) {
          set.status = 400;
          throw new Error("Quantity must be between 1 and 10");
        }

        const [product, existingItem] = await Promise.all([
          ProductService.getProductById(productId),
          CartItemsService.findByProductId(productId),
        ]);

        if (!product) {
          set.status = 404;
          throw new Error("Product not found");
        }

        if (existingItem) {
          const newQuantity = Math.min(existingItem.quantity + quantity, 10);
          const updated = await CartItemsService.updateCartItem(
            existingItem.id,
            {
              quantity: newQuantity,
            }
          );
          return updated;
        }

        const created = await CartItemsService.createCartItem({
          productId,
          quantity,
          deliveryOptionId: "1",
        });

        set.status = 201;
        return created;
      }),
    {
      body: t.Object({
        productId: t.String({ format: "uuid" }),
        quantity: t.Integer({ minimum: 1, maximum: 10 }),
      }),
      response: CartItemsSchemaT,
    }
  )
  .delete(
    "/:id",
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
    "/:id",
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
        id: t.String({ format: "uuid" }),
      }),
      body: t.Object({
        quantity: t.Optional(t.Integer({ minimum: 1, maximum: 10 })),
        deliveryOptionId: t.Optional(t.String()),
      }),
      response: CartItemsSchemaT,
    }
  );
