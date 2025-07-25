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

const app = new Elysia()
  .use(cors())
  .use(swagger())
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
  .use(deliveryOptionsRoute)
  .use(cartItemsRoute)
  .get("/", () => "Hello Elysia")
  .listen(process.env.PORT || 5000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} | http://localhost:${process.env.PORT} | Jaeger ui: http://localhost:16686  | Jeager OTLP http://localhost:4318/v1/trace`
);
