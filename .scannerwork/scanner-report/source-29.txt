import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { Elysia } from "elysia";
import { prisma } from "../../../prisma/database-prisma";
import { deliveryOptionsRoute } from "../../../src/modules/delivery-options/controller-do";

const TEST_HOST = "http://localhost";
const BASE_PATH = "/api/v1/delivery-options";

const makeRequest = (path: string, init?: RequestInit) => new Request(`${TEST_HOST}${path}`, init);

let app: Elysia;

beforeAll(async () => {
  await prisma.cartItem.deleteMany();
  await prisma.deliveryOption.deleteMany();

  await prisma.deliveryOption.createMany({
    data: [
      { id: "fast", deliveryDays: 3, priceCents: 500 },
      { id: "standard", deliveryDays: 7, priceCents: 0 }
    ]
  });

  app = new Elysia().use(deliveryOptionsRoute);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Delivery Options Integration", () => {
  test("GET /api/v1/delivery-options returns all delivery options", async () => {
    const response = await app.handle(makeRequest(BASE_PATH, { method: "GET" }));
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({
      id: "fast",
      deliveryDays: 3,
      priceCents: 500
    });
  });

  test("GET /api/v1/delivery-options?expand=estimatedDeliveryTime includes calculated field", async () => {
    const response = await app.handle(
      makeRequest(`${BASE_PATH}?expand=estimatedDeliveryTime`, { method: "GET" })
    );
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body[0]).toHaveProperty("estimatedDeliveryTimeMs");
    expect(typeof body[0].estimatedDeliveryTimeMs).toBe("number");
  });

  test("GET /api/v1/delivery-options returns error 500 if no options exist", async () => {
    await prisma.cartItem.deleteMany();
    await prisma.deliveryOption.deleteMany();

    const response = await app.handle(makeRequest(BASE_PATH, { method: "GET" }));
    expect(response.status).toBe(500);

    const text = await response.text();
    expect(text).toContain("No Delivery Options Available");
  });
});
