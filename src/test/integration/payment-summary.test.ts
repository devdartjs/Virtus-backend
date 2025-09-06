/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { Elysia } from "elysia";
import { getPaymentSummaryRoute } from "../../modules/payment-summary/controller-ps";
import { prisma } from "../../../prisma/database-prisma";
import redis from "../../lib/redis/redis";

let app: any;

beforeAll(async () => {
  app = new Elysia().use(getPaymentSummaryRoute);
  await prisma.$connect();
  await redis.flushall();

  await prisma.cartItem.deleteMany();

  const testProduct = await prisma.product.create({
    data: {
      name: "Integration Test Product",
      image: "http://example.com/test.png",
      stars: 5,
      ratingCount: 99,
      priceCents: 5000,
      keywords: ["integration", "test"],
    },
  });

  const testDeliveryOption = await prisma.deliveryOption.create({
    data: {
      id: "express-test",
      deliveryDays: 2,
      priceCents: 1000,
    },
  });

  await prisma.cartItem.createMany({
    data: [
      {
        productId: testProduct.id,
        deliveryOptionId: testDeliveryOption.id,
        quantity: 2,
      },
      {
        productId: testProduct.id,
        deliveryOptionId: testDeliveryOption.id,
        quantity: 1,
      },
    ],
  });
});

afterAll(async () => {
  await prisma.cartItem.deleteMany({
    where: { product: { name: "Integration Test Product" } },
  });
  await prisma.product.deleteMany({
    where: { name: "Integration Test Product" },
  });
  await prisma.deliveryOption.deleteMany({
    where: { id: "express-test" },
  });

  await prisma.$disconnect();
  await redis.quit();
});

describe("GET /api/v1/payment-summary - Integration Test", () => {
  test("should return correct payment summary based on cart items", async () => {
    const response = await app.handle(
      new Request("http://localhost:3004/api/v1/payment-summary", {
        method: "GET",
      })
    );

    const body = await response.json();
    console.log("Payment summary object:", body);

    expect(response.status).toBe(200);
    expect(body.totalItems).toBe(3);
    expect(body.productCostCents).toBe(15000);
    expect(body.shippingCostCents).toBe(3000);
    expect(body.totalCostBeforeTaxCents).toBe(18000);
    expect(body.taxCents).toBe(1800);
    expect(body.totalCostCents).toBe(19800);
  });
});
