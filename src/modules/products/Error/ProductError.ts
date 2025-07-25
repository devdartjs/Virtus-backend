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
  .onError(({ error, code }) => {
    if (code === "PRODUCT_ERROR") {
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
      (error as ResponseValidationError).on === "response"
    ) {
      const validationError = error as ResponseValidationError;

      return {
        status: 422,
        body: {
          message: "Erro na validação da resposta da API",
          code: "RESPONSE_VALIDATION_ERROR",
          summary: validationError.summary ?? "Erro desconhecido",
          details: validationError.errors ?? [],
        },
      };
    }

    return {
      status: 500,
      body: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      },
    };
  });
