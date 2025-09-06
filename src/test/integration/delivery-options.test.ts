/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { Elysia } from "elysia";
import { prisma } from "../../../prisma/database-prisma";
import { deliveryOptionsRoute } from "../../../src/modules/delivery-options/controller-do";

let app: Elysia;

beforeAll(async () => {
  await prisma.cartItem.deleteMany();
  await prisma.deliveryOption.deleteMany();

  await prisma.deliveryOption.createMany({
    data: [
      { id: "fast", deliveryDays: 3, priceCents: 500 },
      { id: "standard", deliveryDays: 7, priceCents: 0 },
    ],
  });

  app = new Elysia().use(deliveryOptionsRoute);
});

afterAll(async () => {
  await prisma.$disconnect();
});
describe("Delivery Options Integration", () => {
  test("GET /api/v1/delivery-options should return delivery options-", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/v1/delivery-options", {
        method: "GET",
      })
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    console.log(
      "BODY => TEST: GET /api/v1/delivery-options should return delivery options",
      body
    );

    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({
      id: "fast",
      deliveryDays: 3,
      priceCents: 500,
    });
  });

  test("GET /api/v1/delivery-options?expand=estimatedDeliveryTime should includes calculated field", async () => {
    const response = await app.handle(
      new Request(
        "http://localhost/api/v1/delivery-options?expand=estimatedDeliveryTime",
        {
          method: "GET",
        }
      )
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    console.log(
      "BODY => TEST: GET /api/v1/delivery-options?expand=estimatedDeliveryTime should includes calculated field",
      body
    );

    expect(body[0]).toHaveProperty("estimatedDeliveryTimeMs");
    expect(typeof body[0].estimatedDeliveryTimeMs).toBe("number");
  });

  test("GET /api/v1/delivery-options should return error 400 if there is no options", async () => {
    await prisma.cartItem.deleteMany();
    await prisma.deliveryOption.deleteMany();

    const response = await app.handle(
      new Request("http://localhost/api/v1/delivery-options", {
        method: "GET",
      })
    );
    expect(response.status).toBe(500);
    const text = await response.text();
    console.log("text:", text);

    expect(text).toContain("No Delivery Options Available");
  });
});
