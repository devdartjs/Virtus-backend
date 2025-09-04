import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { Elysia } from "elysia";
import { productsRoute } from "../../modules/products/controller-products";
import { prisma } from "../../../prisma/database-prisma";
import redis from "../../lib/redis/redis";

let app: any;

beforeAll(async () => {
  app = new Elysia().use(productsRoute);
  await prisma.$connect();
  await redis.flushall();
});

afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
});

describe("GET /api/v1/products - Integration Tests with real container data", () => {
  test("should return products with populated container", async () => {
    const response = await app.handle(
      new Request("/api/v1/products", {
        method: "GET",
        headers: { "x-forwarded-for": "127.0.0.1" },
      })
    );

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.total).toBeGreaterThan(0);

    const product = body.products[0];
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("image");
    expect(product).toHaveProperty("stars");
    expect(product).toHaveProperty("ratingCount");
    expect(product).toHaveProperty("priceCents");
    expect(product).toHaveProperty("keywords");
  });

  test("should enforce rate limiting", async () => {
    const ip = "192.168.0.1";
    const LIMIT = Number(process.env.RATE_LIMIT_MAX) || 10;

    for (let i = 0; i < LIMIT; i++) {
      await app.handle(
        new Request("/api/v1/products", {
          method: "GET",
          headers: { "x-forwarded-for": ip },
        })
      );
    }

    const response = await app.handle(
      new Request("/api/v1/products", {
        method: "GET",
        headers: { "x-forwarded-for": ip },
      })
    );

    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.code).toBe("RATE_LIMIT_EXCEEDED");
  });
});
