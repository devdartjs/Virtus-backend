/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
/* eslint-disable indent */
import "./loadEnv.ts";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
import { productsRoute } from "./modules/products/controller-products";
import { deliveryOptionsRoute } from "./modules/delivery-options/controller-do";
import { cartItemsRoute } from "./modules/cart-items/controller-cart-item";
import { ordersRoute } from "./modules/orders/controller-orders";
import { resetRoute } from "./modules/reset/controller-reset";
import { getPaymentSummaryRoute } from "./modules/payment-summary/controller-ps";
import { ProductService } from "./modules/products/service-products";

// export const isDevOrStage = ["development", "stage"].includes(process.env.BUN_ENV || "");
export const isDevOrStage = process.env.BUN_ENV === "development";

export const app = new Elysia()
  .use(cors())
  .use(swagger())
  .use(
    opentelemetry({
      spanProcessors: [
        ...(isDevOrStage
          ? [
              new BatchSpanProcessor(new ConsoleSpanExporter()),
              new BatchSpanProcessor(
                new OTLPTraceExporter({
                  url: "http://localhost:4318/v1/traces"
                })
              )
            ]
          : [])
      ]
    })
  )
  .use(productsRoute)
  .use(deliveryOptionsRoute)
  .use(cartItemsRoute)
  .use(ordersRoute)
  .use(resetRoute)
  .use(getPaymentSummaryRoute)
  .get("/", ({ headers }) => {
    if (isDevOrStage) {
      return {
        message: "Hello Elysia",
        realIp: headers["x-real-ip"] ?? "not provided",
        forwardedFor: headers["x-forwarded-for"] ?? "not provided",
        userAgent: headers["user-agent"] ?? "unknown",
        host: headers["host"] ?? "unknown",
        protocol: headers["x-forwarded-proto"] ?? "http",
        timestamp: new Date().toISOString(),
        env: process.env.BUN_ENV || "not set"
      };
    }
    return "Elysia server is up and running!";
  })
  .listen({
    port: process.env.PORT ? Number.parseInt(process.env.PORT) : 5000,
    hostname: "0.0.0.0"
  });

if (isDevOrStage) {
  console.log(`
    ✅ Elysia Server is running at http://${app.server?.hostname}:${app.server?.port}
    ✅ Jaeger.UI is running at http://localhost:16686
    ✅ Jaeger.OTLP is running at http://localhost:4318/v1/trace
`);
}

if (process.env.BUN_ENV === "stage" || process.env.BUN_ENV === "development") {
  (async () => {
    try {
      await ProductService.preloadCache();
      console.log("Product cache successfully preloaded (background)");
    } catch (err) {
      console.error("Error preloading cache (background):", err);
    }
  })();
}
