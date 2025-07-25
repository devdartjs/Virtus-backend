import { Elysia } from "elysia";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
import { productsRoute } from "./modules/products/controller-products";
import { ProductError } from "./modules/products/Error/ProductErrorClass";

const app = new Elysia()
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
  .use(
    opentelemetry({
      spanProcessors: [
        new BatchSpanProcessor(new ConsoleSpanExporter()),
        new BatchSpanProcessor(
          new OTLPTraceExporter({ url: "http://localhost:4318/v1/traces" })
        ),
      ],
    })
  )
  .use(productsRoute)
  .get("/", () => "Hello Elysia")
  .listen(process.env.PORT || 5000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} | http://localhost:${process.env.PORT} | Jaeger ui: http://localhost:16686  | Jeager OTLP http://localhost:4318/v1/trace`
);
