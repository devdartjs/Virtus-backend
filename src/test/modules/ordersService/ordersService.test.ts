import { describe, test, expect, vi, beforeEach } from "vitest";
import { listOrders, createOrder, getOrderById } from "../../../modules/orders/service-orders";

vi.mock("../../../../prisma/database-prisma", () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn()
    },
    orderItem: {
      deleteMany: vi.fn()
    },
    product: {
      findMany: vi.fn()
    },
    deliveryOption: {
      findMany: vi.fn()
    },
    cartItem: {
      findMany: vi.fn()
    }
  }
}));

import { prisma } from "../../../../prisma/database-prisma";

describe("service-orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listOrders", () => {
    test("returns orders with expanded products when expandProduct is true", async () => {
      (prisma.order.findMany as any).mockResolvedValue([
        {
          id: "order-1",
          orderTimeMs: BigInt(123456789),
          totalCostCents: 1000,
          items: [
            {
              productId: "prod-1",
              quantity: 2,
              estimatedDeliveryTimeMs: BigInt(86400000),
              product: {
                id: "prod-1",
                name: "Product 1",
                image: "image.png",
                stars: 4.5,
                ratingCount: 100,
                priceCents: 500,
                keywords: ["tag1", "tag2"]
              }
            }
          ]
        }
      ]);

      const result = await listOrders(true);
      expect(result).toHaveLength(1);
      expect(result[0].products[0].productId).toBeDefined();
      expect(result[0].products[0].productId).toBeDefined();
    });

    test("returns orders without expanded products when expandProduct is false", async () => {
      (prisma.order.findMany as any).mockResolvedValue([
        {
          id: "order-1",
          orderTimeMs: BigInt(123456789),
          totalCostCents: 1000,
          items: [
            {
              productId: "prod-1",
              quantity: 2,
              estimatedDeliveryTimeMs: BigInt(86400000),
              product: null
            }
          ]
        }
      ]);

      const result = await listOrders(false);
      expect(result[0].products[0]).not.toHaveProperty("product");
      expect(result[0].products[0].quantity).toBe(2);
    });

    test("returns empty array when no orders exist", async () => {
      (prisma.order.findMany as any).mockResolvedValue([]);

      const result = await listOrders(true);
      expect(result).toEqual([]);
    });

    test("handles multiple items in a single order", async () => {
      (prisma.order.findMany as any).mockResolvedValue([
        {
          id: "order-2",
          orderTimeMs: BigInt(987654321),
          totalCostCents: 2500,
          items: [
            {
              productId: "prod-1",
              quantity: 1,
              estimatedDeliveryTimeMs: BigInt(86400000),
              product: { id: "prod-1", name: "Product 1" }
            },
            {
              productId: "prod-2",
              quantity: 3,
              estimatedDeliveryTimeMs: BigInt(172800000),
              product: { id: "prod-2", name: "Product 2" }
            }
          ]
        }
      ]);

      const result = await listOrders(true);
      expect(result[0].products).toHaveLength(2);
      expect(result[0].products[1].quantity).toBe(3);
    });

    test("converts BigInt fields into numbers", async () => {
      (prisma.order.findMany as any).mockResolvedValue([
        {
          id: "order-3",
          orderTimeMs: BigInt(555),
          totalCostCents: 1234,
          items: [
            {
              productId: "prod-3",
              quantity: 5,
              estimatedDeliveryTimeMs: BigInt(333),
              product: null
            }
          ]
        }
      ]);

      const result = await listOrders(false);
      expect(typeof result[0].orderTimeMs).toBe("number");
      expect(typeof result[0].products[0].estimatedDeliveryTimeMs).toBe("number");
    });
  });

  describe("createOrder", () => {
    test("throws error when cart is empty", async () => {
      await expect(createOrder([])).rejects.toThrow("Cart cannot be empty");
    });

    test("throws error when product is missing", async () => {
      (prisma.product.findMany as any).mockResolvedValue([]);
      (prisma.deliveryOption.findMany as any).mockResolvedValue([
        { id: "del-1", deliveryDays: 2, priceCents: 100 }
      ]);

      const cart = [{ productId: "prod-1", quantity: 1, deliveryOptionId: "del-1" }];
      await expect(createOrder(cart)).rejects.toThrow("One or more products not found");
    });

    test("throws error when delivery option is missing", async () => {
      (prisma.product.findMany as any).mockResolvedValue([{ id: "prod-1", priceCents: 500 }]);
      (prisma.deliveryOption.findMany as any).mockResolvedValue([]);

      const cart = [{ productId: "prod-1", quantity: 1, deliveryOptionId: "del-1" }];
      await expect(createOrder(cart)).rejects.toThrow("One or more delivery options not found");
    });

    test("creates an order with valid cart", async () => {
      (prisma.product.findMany as any).mockResolvedValue([{ id: "prod-1", priceCents: 500 }]);
      (prisma.deliveryOption.findMany as any).mockResolvedValue([
        { id: "del-1", deliveryDays: 2, priceCents: 100 }
      ]);
      (prisma.order.create as any).mockResolvedValue({
        id: "order-1",
        orderTimeMs: BigInt(123456789),
        totalCostCents: 1100,
        items: [
          {
            productId: "prod-1",
            quantity: 1,
            estimatedDeliveryTimeMs: BigInt(172800000),
            product: { id: "prod-1", name: "Product 1" }
          }
        ]
      });

      const cart = [{ productId: "prod-1", quantity: 1, deliveryOptionId: "del-1" }];
      const order = await createOrder(cart);

      expect(order.id).toBe("order-1");
      expect(order.items[0].productId).toBe("prod-1");
    });

    test("creates order with multiple products", async () => {
      (prisma.product.findMany as any).mockResolvedValue([
        { id: "prod-1", priceCents: 500 },
        { id: "prod-2", priceCents: 300 }
      ]);
      (prisma.deliveryOption.findMany as any).mockResolvedValue([
        { id: "del-1", deliveryDays: 2, priceCents: 100 },
        { id: "del-2", deliveryDays: 3, priceCents: 200 }
      ]);
      (prisma.order.create as any).mockResolvedValue({
        id: "order-2",
        orderTimeMs: BigInt(987654321),
        totalCostCents: 1400, // 500 + 300 + 100 + 500
        items: [
          {
            productId: "prod-1",
            quantity: 1,
            estimatedDeliveryTimeMs: BigInt(172800000),
            product: { id: "prod-1", name: "Product 1" }
          },
          {
            productId: "prod-2",
            quantity: 2,
            estimatedDeliveryTimeMs: BigInt(259200000),
            product: { id: "prod-2", name: "Product 2" }
          }
        ]
      });

      const cart = [
        { productId: "prod-1", quantity: 1, deliveryOptionId: "del-1" },
        { productId: "prod-2", quantity: 2, deliveryOptionId: "del-2" }
      ];

      const order = await createOrder(cart);

      expect(order.id).toBe("order-2");
      expect(order.totalCostCents).toBe(1400);
      expect(order.items).toHaveLength(2);
    });
  });

  describe("getOrderById", () => {
    test("returns null if order does not exist", async () => {
      (prisma.order.findUnique as any).mockResolvedValue(null);
      const result = await getOrderById("nonexistent-id", true);
      expect(result).toBeNull();
    });

    test("returns order with expanded products", async () => {
      (prisma.order.findUnique as any).mockResolvedValue({
        id: "order-1",
        orderTimeMs: BigInt(123456789),
        totalCostCents: 1000,
        items: [
          {
            productId: "prod-1",
            quantity: 2,
            estimatedDeliveryTimeMs: BigInt(86400000),
            product: {
              id: "prod-1",
              name: "Product 1",
              image: "image.png",
              stars: 4.5,
              ratingCount: 100,
              priceCents: 500,
              keywords: ["tag1", "tag2"]
            }
          }
        ]
      });

      const result = await getOrderById("order-1", true);
      expect(result?.products[0].productId).toBeDefined();
    });

    test("returns order without expanded products", async () => {
      (prisma.order.findUnique as any).mockResolvedValue({
        id: "order-1",
        orderTimeMs: BigInt(123456789),
        totalCostCents: 1000,
        items: [
          {
            productId: "prod-1",
            quantity: 2,
            estimatedDeliveryTimeMs: BigInt(86400000),
            product: null
          }
        ]
      });

      const result = await getOrderById("order-1", false);
      expect(result?.products[0]).not.toHaveProperty("product");
    });

    test("handles orders with no items", async () => {
      (prisma.order.findUnique as any).mockResolvedValue({
        id: "order-2",
        orderTimeMs: BigInt(987654321),
        totalCostCents: 0,
        items: []
      });

      const result = await getOrderById("order-2", true);
      expect(result?.products).toEqual([]);
    });

    test("correctly maps bigint fields to numbers", async () => {
      (prisma.order.findUnique as any).mockResolvedValue({
        id: "order-3",
        orderTimeMs: BigInt(1234),
        totalCostCents: 2000,
        items: [
          {
            productId: "prod-2",
            quantity: 1,
            estimatedDeliveryTimeMs: BigInt(5678),
            product: {
              id: "prod-2",
              name: "Product 2",
              image: "image2.png",
              stars: 3.5,
              ratingCount: 20,
              priceCents: 2000,
              keywords: ["tag3"]
            }
          }
        ]
      });

      const result = await getOrderById("order-3", true);
      expect(typeof result?.orderTimeMs).toBe("number");
      expect(typeof result?.products[0].estimatedDeliveryTimeMs).toBe("number");
    });

    test("throws an error if prisma throws", async () => {
      (prisma.order.findUnique as any).mockRejectedValue(new Error("DB error"));

      await expect(getOrderById("order-error", true)).rejects.toThrow("DB error");
    });
  });
});
