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

const isDevOrStage = ["development", "stage"].includes(
  process.env.NODE_ENV || ""
);

const app = new Elysia()
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
                  url: "http://localhost:4318/v1/traces",
                })
              ),
            ]
          : []),
      ],
    })
  )
  .use(productsRoute)
  .use(deliveryOptionsRoute)
  .use(cartItemsRoute)
  .use(ordersRoute)
  .use(resetRoute)
  .use(getPaymentSummaryRoute)
  .get("/", () => "Hello Elysia")
  .listen(process.env.PORT || 5000);

if (isDevOrStage) {
  console.log(
    `✅ Elysia Server is running at http://${app.server?.hostname}:${app.server?.port}`
  );
  console.log(`✅ Jaeger.UI is running at http://localhost:16686`);
  console.log(`✅ Jaeger.OTLP is running at http://localhost:4318/v1/trace`);
}
