import { Elysia, t } from "elysia";
import { record } from "@elysiajs/opentelemetry";
import { ProductService } from "./service-products";
import { ProductSchemaT } from "./schema-products";
import { ProductError } from "./Error/ProductErrorClass";

export const productsRoute = new Elysia({ prefix: "/api/v1" })
  .error({
    PRODUCT_ERROR: ProductError,
  })
  .onError(({ code, error }) => {
    if (code === "PRODUCT_ERROR" && error instanceof ProductError) {
      return {
        status: error.status,
        body: error.toResponse(),
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
          message: "Erro na validação da resposta da API",
          code: "RESPONSE_VALIDATION_ERROR",
          summary: (error as any).summary ?? "Erro desconhecido",
          details: (error as any).errors ?? [],
        },
      };
    }

    return {
      status: 500,
      body: {
        message: "Internal Server Error",
        code: "INTERNAL_ERROR",
      },
    };
  })
  .get(
    "/products",
    async ({ set }) => {
      return record("db.listProducts", async () => {
        try {
          const products = await ProductService.getAllProducts();
          if (products.length === 0) {
            set.status = 400;
            throw new ProductError("No Products Available");
          }

          const response = {
            success: true,
            total: products.length,
            products: products || [],
          };

          return response;
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
  );
