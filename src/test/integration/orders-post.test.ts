/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { describe, test, expect, beforeEach, vi } from "vitest";
import { Elysia } from "elysia";
import { ordersRoute } from "../../modules/orders/controller-orders";
import { prisma } from "../../../prisma/database-prisma";
import { createOrder } from "../../modules/orders/service-orders";

vi.mock("../../../prisma/database-prisma", () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    orderItem: {
      deleteMany: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
    deliveryOption: {
      findMany: vi.fn(),
    },
    cartItem: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../../modules/orders/service-orders.ts", () => ({
  createOrder: vi.fn(),
}));

describe("POST /api/v1/orders", () => {
  let testApp: Elysia;

  beforeEach(() => {
    vi.clearAllMocks();
    testApp = new Elysia().use(ordersRoute);
  });

  test("should create an order successfully", async () => {
    (prisma.cartItem.findMany as any).mockResolvedValue([
      {
        productId: "11111111-1111-1111-1111-111111111111",
        quantity: 2,
        estimatedDeliveryTimeMs: BigInt(86400000),
        product: {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Product A",
          image: "image-a.png",
          stars: 5,
          ratingCount: 10,
          priceCents: 500,
          keywords: ["electronics"],
        },
        deliveryOptionId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      },
    ]);

    (createOrder as any).mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      orderTimeMs: BigInt(123456789),
      totalCostCents: 1000,
      items: [
        {
          productId: "11111111-1111-1111-1111-111111111111",
          quantity: 2,
          estimatedDeliveryTimeMs: BigInt(86400000),
          product: {
            id: "11111111-1111-1111-1111-111111111111",
            name: "Product A",
            image: "image-a.png",
            stars: 5,
            ratingCount: 10,
            priceCents: 500,
            keywords: ["electronics"],
          },
        },
      ],
    });

    const request = new Request("http://localhost:3004/api/v1/orders", {
      method: "POST",
    });
    const response = await testApp.handle(request);
    const body = await response.json();
    console.log("body-test-1:", body);

    expect(response.status).toBe(201);
    expect(body).toEqual({
      id: "22222222-2222-2222-2222-222222222222",
      orderTimeMs: 123456789,
      totalCostCents: 1000,
      products: [
        {
          productId: "11111111-1111-1111-1111-111111111111",
          quantity: 2,
          estimatedDeliveryTimeMs: 86400000,
          product: {
            id: "11111111-1111-1111-1111-111111111111",
            name: "Product A",
            image: "image-a.png",
            stars: 5,
            ratingCount: 10,
            priceCents: 500,
            keywords: ["electronics"],
          },
        },
      ],
    });
  });

  test("should return 400 when cart is empty", async () => {
    (prisma.cartItem.findMany as any).mockResolvedValue([]);

    const request = new Request("http://localhost:3004/api/v1/orders", {
      method: "POST",
    });
    const response = await testApp.handle(request);
    const body = await response.text();
    console.log("body-test-2:", body);

    expect(response.status).toBe(400);
  });

  test("should return 400 when createOrder throws an error", async () => {
    (prisma.cartItem.findMany as any).mockResolvedValue([
      {
        productId: "11111111-1111-1111-1111-111111111111",
        quantity: 1,
        estimatedDeliveryTimeMs: BigInt(86400000),
        product: null,
        deliveryOptionId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      },
    ]);

    (createOrder as any).mockRejectedValue(new Error("DB create error"));

    const request = new Request("http://localhost:3004/api/v1/orders", {
      method: "POST",
    });
    const response = await testApp.handle(request);
    const body = await response.text();
    console.log("body-test-3:", body);

    expect(response.status).toBe(400);
  });
});
