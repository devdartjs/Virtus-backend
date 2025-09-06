import { describe, test, beforeEach, expect, vi } from "vitest";
import { ordersRoute } from "../../modules/orders/controller-orders";
import { prisma } from "../../../prisma/database-prisma";

vi.mock("../../../prisma/database-prisma", () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    orderItem: {
      deleteMany: vi.fn(),
    },
    cartItem: {
      findMany: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
    deliveryOption: {
      findMany: vi.fn(),
    },
  },
}));

describe("Integration: ordersRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("GET /api/v1/orders returns a list of orders", async () => {
    (prisma.order.findMany as any).mockResolvedValue([
      {
        id: "order-1",
        orderTimeMs: BigInt(123),
        totalCostCents: 1000,
        items: [],
      },
    ]);

    const res = await ordersRoute.handle(
      new Request("http://localhost:3004/api/v1/orders")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("order-1");
  });

  test("GET /api/v1/orders/:orderid returns a specific order", async () => {
    (prisma.order.findUnique as any).mockResolvedValue({
      id: "order-1",
      orderTimeMs: BigInt(123),
      totalCostCents: 1000,
      items: [
        {
          productId: "prod-1",
          quantity: 1,
          estimatedDeliveryTimeMs: BigInt(86400000),
          product: {
            id: "prod-1",
            name: "Product 1",
            image: "img.png",
            stars: 4,
            ratingCount: 10,
            priceCents: 1000,
            keywords: ["tag1"],
          },
        },
      ],
    });

    const res = await ordersRoute.handle(
      new Request("http://localhost:3004/api/v1/orders/order-1?expand=products")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe("order-1");
    expect(body.products[0].product?.name).toBe("Product 1");
  });

  test("POST /api/v1/orders creates an order from cart items", async () => {
    (prisma.cartItem.findMany as any).mockResolvedValue([
      {
        productId: "prod-1",
        quantity: 2,
        deliveryOptionId: "del-1",
        product: {},
        deliveryOption: {},
      },
    ]);
    (prisma.order.create as any).mockResolvedValue({
      id: "order-2",
      orderTimeMs: BigInt(456),
      totalCostCents: 2000,
      items: [
        {
          productId: "prod-1",
          quantity: 2,
          estimatedDeliveryTimeMs: BigInt(86400000),
          product: {},
        },
      ],
    });

    const res = await ordersRoute.handle(
      new Request("http://localhost:3004/api/v1/orders", { method: "POST" })
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.id).toBe("order-2");
    expect(body.products[0].quantity).toBe(2);
  });

  test("DELETE /api/v1/orders/:id deletes an order", async () => {
    (prisma.order.findUnique as any).mockResolvedValue({ id: "order-3" });
    (prisma.orderItem.deleteMany as any).mockResolvedValue({});
    (prisma.order.delete as any).mockResolvedValue({});

    const res = await ordersRoute.handle(
      new Request("http://localhost:3004/api/v1/orders/order-3", {
        method: "DELETE",
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Order deleted successfully");
  });

  test("DELETE /api/v1/orders/:id returns 404 if order does not exist", async () => {
    (prisma.order.findUnique as any).mockResolvedValue(null);

    const res = await ordersRoute.handle(
      new Request("http://localhost:3004/api/v1/orders/nonexistent-id", {
        method: "DELETE",
      })
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toHaveProperty("message");
  });
});
