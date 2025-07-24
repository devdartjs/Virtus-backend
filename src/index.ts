import { Elysia } from "elysia";
import { opentelemetry, record } from "@elysiajs/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
import { prisma } from "../database/prisma";

const app = new Elysia()
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
  .get("/", () => "Hello Elysia")
  .get("/products", () => {
    return record("db.listProducts", async () => {
      const products = await prisma.product.findMany();
      return products;
    });
  })
  .listen(process.env.PORT || 5000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port} | http://localhost:${process.env.PORT} | Jaeger ui: http://localhost:16686  | Jeager OTLP http://localhost:4318/v1/trace`
);
