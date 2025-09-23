import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { Elysia } from "elysia";
import { productsRoute } from "../../modules/products/controller-products";
import { prisma } from "../../database/database-prisma";
import redis from "../../lib/redis/redis";

const TEST_HOST = "http://localhost";
const BASE_PATH = "/api/v1/products";

const makeRequest = (path: string, init?: RequestInit) => new Request(`${TEST_HOST}${path}`, init);

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

describe("GET /api/v1/products", () => {
  test("returns products with populated container", async () => {
    const response = await app.handle(
      makeRequest(BASE_PATH, { method: "GET", headers: { "x-forwarded-for": "127.0.0.1" } })
    );
    expect(response.status).toBe(200);

    const body = await response.json();
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

  test("enforces rate limiting", async () => {
    const ip = "192.168.0.1";
    const LIMIT = Number(process.env.RATE_LIMIT_MAX);

    for (let i = 0; i < LIMIT; i++) {
      await app.handle(
        makeRequest(BASE_PATH, { method: "GET", headers: { "x-forwarded-for": ip } })
      );
      await new Promise((r) => setTimeout(r, 10));
    }

    const response = await app.handle(
      makeRequest(BASE_PATH, { method: "GET", headers: { "x-forwarded-for": ip } })
    );
    const body = await response.json();
    expect(response.status).toBe(429);
    expect(body.body.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(body.body.message).toMatch(/Too many requests/i);
  });
});

describe("GET /api/v1/products/:id", () => {
  test("returns a product by valid id", async () => {
    const listResponse = await app.handle(
      makeRequest(BASE_PATH, { method: "GET", headers: { "x-forwarded-for": "127.0.0.1" } })
    );
    const listBody = await listResponse.json();
    const validId = listBody.products[0].id;

    const response = await app.handle(
      makeRequest(`${BASE_PATH}/${validId}`, {
        method: "GET",
        headers: { "x-forwarded-for": "127.0.0.1" }
      })
    );
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.product).toHaveProperty("id", validId);
    expect(body.product).toHaveProperty("name");
    expect(body.product).toHaveProperty("image");
    expect(body.product).toHaveProperty("stars");
    expect(body.product).toHaveProperty("ratingCount");
    expect(body.product).toHaveProperty("priceCents");
    expect(body.product).toHaveProperty("keywords");
  });

  test("returns 404 for non-existing product id", async () => {
    const response = await app.handle(
      makeRequest(`${BASE_PATH}/non-existing-id-123`, {
        method: "GET",
        headers: { "x-forwarded-for": "127.0.0.2" }
      })
    );
    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body.body.code).toBe("PRODUCT_ERROR");
    expect(body.body.message).toMatch(/Product not found/i);
  });

  test("enforces rate limiting on /:id", async () => {
    const ip = "192.168.0.55";
    const listResponse = await app.handle(
      makeRequest(BASE_PATH, { method: "GET", headers: { "x-forwarded-for": ip } })
    );
    const listBody = await listResponse.json();
    const validId = listBody.products[0].id;

    const LIMIT = Number(process.env.RATE_LIMIT_MAX);
    for (let i = 0; i < LIMIT; i++) {
      await app.handle(
        makeRequest(`${BASE_PATH}/${validId}`, {
          method: "GET",
          headers: { "x-forwarded-for": ip }
        })
      );
      await new Promise((r) => setTimeout(r, 10));
    }

    const response = await app.handle(
      makeRequest(`${BASE_PATH}/${validId}`, { method: "GET", headers: { "x-forwarded-for": ip } })
    );
    expect(response.status).toBe(429);

    const body = await response.json();
    expect(body.body.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(body.body.message).toMatch(/Too many requests/i);
  });
});
