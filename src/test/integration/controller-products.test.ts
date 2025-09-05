/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { Elysia } from "elysia";
import { productsRoute } from "../../modules/products/controller-products";
import { prisma } from "../../../prisma/database-prisma";
import redis from "../../lib/redis/redis";

let app: any;

beforeAll(async () => {
  process.env.RATE_LIMIT_MAX = "5";
  process.env.RATE_LIMIT_WINDOW = "60";
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
      new Request("http://localhost:3004/api/v1/products", {
        method: "GET",
        headers: { "x-forwarded-for": "127.0.0.1" },
      })
    );

    const body = await response.json();
    console.log("Response body:", body);

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
    const LIMIT = Number(process.env.RATE_LIMIT_MAX);

    for (let i = 0; i < LIMIT; i++) {
      await app.handle(
        new Request("http://localhost:3004/api/v1/products", {
          method: "GET",
          headers: { "x-forwarded-for": ip },
        })
      );
      await new Promise((r) => setTimeout(r, 10));
    }

    const response = await app.handle(
      new Request("http://localhost:3004/api/v1/products", {
        method: "GET",
        headers: { "x-forwarded-for": ip },
      })
    );

    const body = await response.json();
    console.log("Rate limit response:", body);

    expect(response.status).toBe(429);
    expect(body.body.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(body.body.message).toMatch(/Too many requests/i);
  });
});

describe("GET /api/v1/products/:id - Integration Tests", () => {
  test("should return a product by valid id", async () => {
    const listResponse = await app.handle(
      new Request("http://localhost:3004/api/v1/products", {
        method: "GET",
        headers: { "x-forwarded-for": "127.0.0.1" },
      })
    );
    const listBody = await listResponse.json();
    const validId = listBody.products[0].id;

    const response = await app.handle(
      new Request(`http://localhost:3004/api/v1/products/${validId}`, {
        method: "GET",
        headers: { "x-forwarded-for": "127.0.0.1" },
      })
    );

    const body = await response.json();
    console.log("GET /:id valid response:", body);

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.product).toHaveProperty("id", validId);
    expect(body.product).toHaveProperty("name");
    expect(body.product).toHaveProperty("image");
    expect(body.product).toHaveProperty("stars");
    expect(body.product).toHaveProperty("ratingCount");
    expect(body.product).toHaveProperty("priceCents");
    expect(body.product).toHaveProperty("keywords");
  });

  test("should return 404 for non-existing product id", async () => {
    const response = await app.handle(
      new Request("http://localhost:3004/api/v1/products/non-existing-id-123", {
        method: "GET",
        headers: { "x-forwarded-for": "127.0.0.2" },
      })
    );

    const body = await response.json();
    console.log("GET /:id not found response:", body);

    expect(response.status).toBe(404);
    expect(body.body.code).toBe("PRODUCT_ERROR");
    expect(body.body.message).toMatch(/Product not found/i);
  });

  test("should enforce rate limiting on /:id", async () => {
    const ip = "192.168.0.55";
    const listResponse = await app.handle(
      new Request("http://localhost:3004/api/v1/products", {
        method: "GET",
        headers: { "x-forwarded-for": ip },
      })
    );
    const listBody = await listResponse.json();
    const validId = listBody.products[0].id;

    const LIMIT = Number(process.env.RATE_LIMIT_MAX);

    for (let i = 0; i < LIMIT; i++) {
      await app.handle(
        new Request(`http://localhost:3004/api/v1/products/${validId}`, {
          method: "GET",
          headers: { "x-forwarded-for": ip },
        })
      );
      await new Promise((r) => setTimeout(r, 10));
    }

    const response = await app.handle(
      new Request(`http://localhost:3004/api/v1/products/${validId}`, {
        method: "GET",
        headers: { "x-forwarded-for": ip },
      })
    );

    const body = await response.json();
    console.log("Rate limit /:id response:", body);

    expect(response.status).toBe(429);
    expect(body.body.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(body.body.message).toMatch(/Too many requests/i);
  });
});
