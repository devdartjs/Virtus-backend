import { Elysia, t } from "elysia";
import { record } from "@elysiajs/opentelemetry";
import { ProductService } from "./service-products";
import { ProductSchemaT } from "./schema-products";
import { ProductError } from "./Error/ProductErrorClass";

export const productsRoute = new Elysia({ prefix: "/api/v1" }).get(
  "/products",
  async ({ set }) => {
    return record("db.listProducts", async () => {
      try {
        const products = await ProductService.getAllProducts();
        if (products.length === 0) {
          set.status = 400;
          throw new ProductError("No Products Available");
        }
        return products || [];
      } catch (err) {
        if (err instanceof ProductError) {
          set.status = 404;
          throw err;
        }

        set.status = 500;
        throw err;
      }
    });
  },
  {
    response: t.Array(ProductSchemaT),
  }
);
