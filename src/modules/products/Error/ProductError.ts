import Elysia from "elysia";
import { ProductError } from "./ProductErrorClass";

type ResponseValidationError = {
  on: "response";
  summary?: string;
  errors?: unknown[];
};

export const ProductErrorHandler = new Elysia()
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
  });
