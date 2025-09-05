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
  await prisma.deliveryOption.deleteMany();
  await prisma.product.deleteMany();

  const product = await prisma.product.create({
    data: {
      name: "Test Product",
      image: "http://example.com/img.png",
      stars: 4,
      ratingCount: 10,
      priceCents: 5000,
      keywords: ["test", "product"],
    },
  });

  const deliveryOption = await prisma.deliveryOption.create({
    data: {
      id: "express",
      deliveryDays: 2,
      priceCents: 1000,
    },
  });

  await prisma.cartItem.createMany({
    data: [
      {
        productId: product.id,
        deliveryOptionId: deliveryOption.id,
        quantity: 2,
      },
      {
        productId: product.id,
        deliveryOptionId: deliveryOption.id,
        quantity: 1,
      },
    ],
  });
});

afterAll(async () => {
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
    console.log("Payment summary response:", body);

    // Expect: 3 itens, each one 5000 of product + 1000 of delivery
    // productCost = 15000, shipping = 3000, subtotal = 18000
    // tax = 1800 (10%), total = 19800
    expect(response.status).toBe(200);
    expect(body.totalItems).toBe(3);
    expect(body.productCostCents).toBe(15000);
    expect(body.shippingCostCents).toBe(3000);
    expect(body.totalCostBeforeTaxCents).toBe(18000);
    expect(body.taxCents).toBe(1800);
    expect(body.totalCostCents).toBe(19800);
  });
});
