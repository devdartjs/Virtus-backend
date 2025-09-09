/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { describe, test, expect, beforeEach, vi } from "vitest";
import { Elysia } from "elysia";
import { ordersRoute } from "../../modules/orders/controller-orders";
import { prisma } from "../../../prisma/database-prisma";

vi.mock("../../../prisma/database-prisma", () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
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

describe("GET /api/v1/orders", () => {
  let testApp: Elysia;

  beforeEach(() => {
    vi.clearAllMocks();
    testApp = new Elysia().use(ordersRoute);
  });

  test("should return orders with expanded products", async () => {
    (prisma.order.findMany as any).mockResolvedValue([
      {
        id: "11111111-1111-1111-1111-111111111111",
        orderTimeMs: BigInt(123456789),
        totalCostCents: 1500,
        items: [
          {
            productId: "22222222-2222-2222-2222-222222222222",
            quantity: 1,
            estimatedDeliveryTimeMs: BigInt(86400000),
            product: {
              id: "22222222-2222-2222-2222-222222222222",
              name: "Product A",
              image: "image.png",
              stars: 5,
              ratingCount: 10,
              priceCents: 1500,
              keywords: ["tag1"],
            },
          },
        ],
      },
    ]);

    const request = new Request(
      "http://localhost:3004/api/v1/orders?expand=products",
      { method: "GET" }
    );
    const response = await testApp.handle(request);
    const body = await response.json();
    console.log("body-test-1:", body);

    expect(response.status).toBe(200);
    expect(body).toEqual([
      {
        id: "11111111-1111-1111-1111-111111111111",
        orderTimeMs: 123456789,
        totalCostCents: 1500,
        products: [
          {
            productId: "22222222-2222-2222-2222-222222222222",
            quantity: 1,
            estimatedDeliveryTimeMs: 86400000,
            product: {
              id: "22222222-2222-2222-2222-222222222222",
              name: "Product A",
              image: "image.png",
              stars: 5,
              ratingCount: 10,
              priceCents: 1500,
              keywords: ["tag1"],
            },
          },
        ],
      },
    ]);
  });

  test("returns empty array when no orders exist", async () => {
    (prisma.order.findMany as any).mockResolvedValue([]);

    const request = new Request("http://localhost:3004/api/v1/orders", {
      method: "GET",
    });
    const response = await testApp.handle(request);
    const body = await response.json();
    console.log("body-test-2:", body);

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  test("returns orders without expanded products when expand query is missing", async () => {
    (prisma.order.findMany as any).mockResolvedValue([
      {
        id: "11111111-1111-1111-1111-111111111111",
        orderTimeMs: BigInt(123456789),
        totalCostCents: 1000,
        items: [
          {
            productId: "22222222-2222-2222-2222-222222222222",
            quantity: 1,
            estimatedDeliveryTimeMs: BigInt(86400000), // 1 dia em ms
            product: {
              id: "22222222-2222-2222-2222-222222222222",
              name: "Product A",
              image: "image-a.png",
              stars: 5,
              ratingCount: 10,
              priceCents: 500,
              keywords: ["electronics"],
            },
          },
          {
            productId: "33333333-3333-3333-3333-333333333333",
            quantity: 2,
            estimatedDeliveryTimeMs: BigInt(172800000),
            product: {
              id: "33333333-3333-3333-3333-333333333333",
              name: "Product B",
              image: "image-b.png",
              stars: 4,
              ratingCount: 8,
              priceCents: 250,
              keywords: ["accessory"],
            },
          },
        ],
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        orderTimeMs: BigInt(987654321),
        totalCostCents: 2000,
        items: [
          {
            productId: "55555555-5555-5555-5555-555555555555",
            quantity: 1,
            estimatedDeliveryTimeMs: BigInt(43200000),
            product: {
              id: "55555555-5555-5555-5555-555555555555",
              name: "Product C",
              image: "image-c.png",
              stars: 3,
              ratingCount: 7,
              priceCents: 2000,
              keywords: ["premium"],
            },
          },
        ],
      },
    ]);

    const request = new Request("http://localhost:3004/api/v1/orders", {
      method: "GET",
    });
    const response = await testApp.handle(request);
    const body = await response.json();
    console.log("body-test-3:", body);

    expect(response.status).toBe(200);
    expect(body[0].products[0]).not.toHaveProperty("product");
    expect(body).toEqual([
      {
        id: "11111111-1111-1111-1111-111111111111",
        orderTimeMs: 123456789,
        totalCostCents: 1000,
        products: [
          {
            productId: "22222222-2222-2222-2222-222222222222",
            quantity: 1,
            estimatedDeliveryTimeMs: 86400000,
          },
          {
            productId: "33333333-3333-3333-3333-333333333333",
            quantity: 2,
            estimatedDeliveryTimeMs: 172800000,
          },
        ],
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        orderTimeMs: 987654321,
        totalCostCents: 2000,
        products: [
          {
            productId: "55555555-5555-5555-5555-555555555555",
            quantity: 1,
            estimatedDeliveryTimeMs: 43200000,
          },
        ],
      },
    ]);
  });

  test("returns multiple orders with multiple products", async () => {
    (prisma.order.findMany as any).mockResolvedValue([
      {
        id: "11111111-1111-1111-1111-111111111111",
        orderTimeMs: BigInt(123456789),
        totalCostCents: 1000,
        items: [
          {
            productId: "22222222-2222-2222-2222-222222222222",
            quantity: 1,
            estimatedDeliveryTimeMs: BigInt(86400000), // 1 dia em ms
            product: {
              id: "22222222-2222-2222-2222-222222222222",
              name: "Product A",
              image: "image-a.png",
              stars: 5,
              ratingCount: 10,
              priceCents: 500,
              keywords: ["electronics"],
            },
          },
          {
            productId: "33333333-3333-3333-3333-333333333333",
            quantity: 2,
            estimatedDeliveryTimeMs: BigInt(172800000), // 2 dias em ms
            product: {
              id: "33333333-3333-3333-3333-333333333333",
              name: "Product B",
              image: "image-b.png",
              stars: 4,
              ratingCount: 8,
              priceCents: 250,
              keywords: ["accessory"],
            },
          },
        ],
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        orderTimeMs: BigInt(987654321),
        totalCostCents: 2000,
        items: [
          {
            productId: "55555555-5555-5555-5555-555555555555",
            quantity: 1,
            estimatedDeliveryTimeMs: BigInt(43200000), // 12 horas em ms
            product: {
              id: "55555555-5555-5555-5555-555555555555",
              name: "Product C",
              image: "image-c.png",
              stars: 3,
              ratingCount: 7,
              priceCents: 2000,
              keywords: ["premium"],
            },
          },
        ],
      },
    ]);

    const request = new Request(
      "http://localhost:3004/api/v1/orders?expand=products",
      { method: "GET" }
    );
    const response = await testApp.handle(request);
    const body = await response.json();
    console.log("body-test-4:", body);

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].products).toHaveLength(2);
    expect(body[1].products).toHaveLength(1);
  });

  test("handles orders with no items", async () => {
    (prisma.order.findMany as any).mockResolvedValue([
      {
        id: "66666666-6666-6666-6666-666666666666",
        orderTimeMs: BigInt(999999999),
        totalCostCents: 0,
        items: [],
      },
    ]);

    const request = new Request(
      "http://localhost:3004/api/v1/orders?expand=products",
      { method: "GET" }
    );
    const response = await testApp.handle(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([
      {
        id: "66666666-6666-6666-6666-666666666666",
        orderTimeMs: 999999999,
        totalCostCents: 0,
        products: [],
      },
    ]);
  });

  test("returns 500 when prisma throws an error", async () => {
    (prisma.order.findMany as any).mockRejectedValue(new Error("DB error"));

    const request = new Request("http://localhost:3004/api/v1/orders", {
      method: "GET",
    });
    const response = await testApp.handle(request);

    expect(response.status).toBe(500);
  });
});

describe("GET /api/v1/orders/:orderid", () => {
  let testApp: Elysia;

  beforeEach(() => {
    vi.clearAllMocks();
    testApp = new Elysia().use(ordersRoute);
  });

  test("should return order with expanded products", async () => {
    (prisma.order.findUnique as any).mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
      orderTimeMs: BigInt(123456789),
      totalCostCents: 1500,
      items: [
        {
          productId: "22222222-2222-2222-2222-222222222222",
          quantity: 1,
          estimatedDeliveryTimeMs: BigInt(86400000),
          product: {
            id: "22222222-2222-2222-2222-222222222222",
            name: "Product A",
            image: "image.png",
            stars: 5,
            ratingCount: 10,
            priceCents: 1500,
            keywords: ["tag1"],
          },
        },
      ],
    });

    const request = new Request(
      "http://localhost:3004/api/v1/orders/11111111-1111-1111-1111-111111111111?expand=products",
      { method: "GET" }
    );
    const response = await testApp.handle(request);
    const body = await response.json();
    console.log("body-test-1:", body);

    expect(response.status).toBe(200);
    expect(body).toEqual({
      id: "11111111-1111-1111-1111-111111111111",
      orderTimeMs: 123456789,
      totalCostCents: 1500,
      products: [
        {
          productId: "22222222-2222-2222-2222-222222222222",
          quantity: 1,
          estimatedDeliveryTimeMs: 86400000,
          product: {
            id: "22222222-2222-2222-2222-222222222222",
            name: "Product A",
            image: "image.png",
            stars: 5,
            ratingCount: 10,
            priceCents: 1500,
            keywords: ["tag1"],
          },
        },
      ],
    });
  });

  test("should return order without expanded products when expand is missing", async () => {
    (prisma.order.findUnique as any).mockResolvedValue({
      id: "33333333-3333-3333-3333-333333333333",
      orderTimeMs: BigInt(987654321),
      totalCostCents: 2000,
      items: [
        {
          productId: "44444444-4444-4444-4444-444444444444",
          quantity: 2,
          estimatedDeliveryTimeMs: BigInt(43200000),
          product: {
            id: "44444444-4444-4444-4444-444444444444",
            name: "Product B",
            image: "image-b.png",
            stars: 4,
            ratingCount: 8,
            priceCents: 1000,
            keywords: ["accessory"],
          },
        },
      ],
    });

    const request = new Request(
      "http://localhost:3004/api/v1/orders/33333333-3333-3333-3333-333333333333",
      { method: "GET" }
    );
    const response = await testApp.handle(request);
    const body = await response.json();
    console.log("body-test-2:", body);

    expect(response.status).toBe(200);
    expect(body).toEqual({
      id: "33333333-3333-3333-3333-333333333333",
      orderTimeMs: 987654321,
      totalCostCents: 2000,
      products: [
        {
          productId: "44444444-4444-4444-4444-444444444444",
          quantity: 2,
          estimatedDeliveryTimeMs: 43200000,
        },
      ],
    });
  });

  test("should return 404 when order is not found", async () => {
    (prisma.order.findUnique as any).mockResolvedValue(null);

    const request = new Request(
      "http://localhost:3004/api/v1/orders/55555555-5555-5555-5555-555555555555",
      { method: "GET" }
    );
    const response = await testApp.handle(request);
    const body = await response.text();
    console.log("body-test-3:", body);

    expect(response.status).toBe(404);
  });

  test("should return 500 when prisma throws an error", async () => {
    (prisma.order.findUnique as any).mockRejectedValue(new Error("DB error"));

    const request = new Request(
      "http://localhost:3004/api/v1/orders/66666666-6666-6666-6666-666666666666",
      { method: "GET" }
    );
    const response = await testApp.handle(request);
    const body = await response.text();
    console.log("body-test-4:", body);

    expect(response.status).toBe(500);
  });
});

describe("DELETE /api/v1/orders/:id", () => {
  let testApp: Elysia;

  beforeEach(() => {
    vi.clearAllMocks();
    testApp = new Elysia().use(ordersRoute);
  });

  test("should delete order successfully", async () => {
    (prisma.order.findUnique as any).mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
    });
    (prisma.orderItem.deleteMany as any).mockResolvedValue({});
    (prisma.order.delete as any).mockResolvedValue({});

    const request = new Request(
      "http://localhost:3004/api/v1/orders/11111111-1111-1111-1111-111111111111",
      { method: "DELETE" }
    );
    const response = await testApp.handle(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      message: "Order deleted successfully",
    });

    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { id: "11111111-1111-1111-1111-111111111111" },
    });
    expect(prisma.orderItem.deleteMany).toHaveBeenCalledWith({
      where: { orderId: "11111111-1111-1111-1111-111111111111" },
    });
    expect(prisma.order.delete).toHaveBeenCalledWith({
      where: { id: "11111111-1111-1111-1111-111111111111" },
    });
  });

  test("should return 500 when prisma.delete throws an error", async () => {
    (prisma.order.findUnique as any).mockResolvedValue({
      id: "33333333-3333-3333-3333-333333333333",
    });
    (prisma.orderItem.deleteMany as any).mockResolvedValue({});
    (prisma.order.delete as any).mockRejectedValue(
      new Error("DB delete error")
    );

    const request = new Request(
      "http://localhost:3004/api/v1/orders/33333333-3333-3333-3333-333333333333",
      { method: "DELETE" }
    );
    const response = await testApp.handle(request);
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toContain("Failed to delete order");
  });
});
