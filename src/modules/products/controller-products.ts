import { Elysia, t } from "elysia";
import { record } from "@elysiajs/opentelemetry";
import { ProductService } from "../products/service-products";
import { ProductSchemaT } from "../products/schema-products";
import { ProductError } from "./Error/ProductErrorClass";
import { rateLimiter } from "../../lib/redis/rate-limit";

export const productsRoute = new Elysia({ prefix: "/api/v1/products" })
  .error({
    PRODUCT_ERROR: ProductError,
  })
  .onError(({ code, error }) => {
    if (code === "PRODUCT_ERROR" && error instanceof ProductError) {
      return { status: error.status, body: error.toResponse() };
    }

    if (error instanceof Error && (error as any).status === 429) {
      return {
        status: 429,
        body: { message: error.message, code: "RATE_LIMIT_EXCEEDED" },
      };
    }

    if (
      code === "VALIDATION" &&
      typeof error === "object" &&
      error !== null &&
      "on" in error &&
      (error as any).on === "response"
    ) {
      return {
        status: 422,
        body: {
          message: "Error validating API response",
          code: "RESPONSE_VALIDATION_ERROR",
          summary: (error as any).summary ?? "Unknown error",
          details: (error as any).errors ?? [],
        },
      };
    }

    return {
      status: 500,
      body: { message: "Internal Server Error", code: "INTERNAL_ERROR" },
    };
  })
  .get(
    "/",
    async ({ set, request }) => {
      const ip = request.headers.get("x-forwarded-for") || "unknown";
      ip ? await rateLimiter(ip) : "undefined";

      return record("db.listProducts", async () => {
        try {
          const products = await ProductService.getAllProducts();
          if (products.length === 0) {
            set.status = 400;
            throw new ProductError("No products available");
          }

          return { success: true, total: products.length, products };
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
      response: t.Object({
        success: t.Boolean(),
        total: t.Number(),
        products: t.Array(ProductSchemaT),
      }),
    }
  )
  .get(
    "/:id",
    async ({ params, set, request }) => {
      const ip = request.headers.get("x-forwarded-for") || "unknown";

      await rateLimiter(ip);

      return record("db.getProductById", async () => {
        try {
          const product = await ProductService.getProductById(params.id);
          if (!product) {
            set.status = 404;
            throw new ProductError("Product not found");
          }

          return { success: true, product };
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
      response: t.Object({
        success: t.Boolean(),
        product: ProductSchemaT,
      }),
    }
  );
