import { describe, test, vi, beforeEach, expect } from "vitest";
import { seed } from "../../../prisma/database-seed";
import { prisma } from "../../../prisma/database-prisma";

import productsSeed from "../../lib/utils/productsSeed";
import deliveryOptionsSeed from "../../lib/utils/deliveryOptionsSeed";

vi.mock("../../../prisma/database-prisma", () => ({
  prisma: {
    product: {
      count: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn()
    },
    deliveryOption: {
      count: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn()
    },
    cartItem: {
      count: vi.fn(),
      createMany: vi.fn()
    },
    order: {
      count: vi.fn(),
      create: vi.fn()
    },
    $disconnect: vi.fn()
  }
}));

describe("seed function", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    (prisma.product.findMany as any).mockResolvedValue(productsSeed);
    (prisma.deliveryOption.findMany as any).mockResolvedValue(deliveryOptionsSeed);

    (prisma.product.count as any).mockResolvedValue(0);
    (prisma.deliveryOption.count as any).mockResolvedValue(0);
    (prisma.cartItem.count as any).mockResolvedValue(0);
    (prisma.order.count as any).mockResolvedValue(0);

    (prisma.product.createMany as any).mockResolvedValue({});
    (prisma.deliveryOption.createMany as any).mockResolvedValue({});
    (prisma.cartItem.createMany as any).mockResolvedValue({});
    (prisma.order.create as any).mockResolvedValue({});
  });

  test("should seed products, delivery options, cart items and orders when none exist", async () => {
    await seed();

    expect(prisma.product.createMany).toHaveBeenCalled();
    expect(prisma.deliveryOption.createMany).toHaveBeenCalled();
    expect(prisma.cartItem.createMany).toHaveBeenCalled();
    expect(prisma.order.create).toHaveBeenCalledTimes(2);
    expect(prisma.$disconnect).toHaveBeenCalled();
  });

  test("should skip product creation if products exist but seed others", async () => {
    (prisma.product.count as any).mockResolvedValue(productsSeed.length);

    await seed();

    expect(prisma.product.createMany).not.toHaveBeenCalled();
    expect(prisma.deliveryOption.createMany).toHaveBeenCalled();
    expect(prisma.cartItem.createMany).toHaveBeenCalled();
    expect(prisma.order.create).toHaveBeenCalledTimes(2);
    expect(prisma.$disconnect).toHaveBeenCalled();
  });

  test("should skip all seeding when everything already exists", async () => {
    (prisma.product.count as any).mockResolvedValue(productsSeed.length);
    (prisma.deliveryOption.count as any).mockResolvedValue(deliveryOptionsSeed.length);
    (prisma.cartItem.count as any).mockResolvedValue(1);
    (prisma.order.count as any).mockResolvedValue(2);

    await seed();

    expect(prisma.product.createMany).not.toHaveBeenCalled();
    expect(prisma.deliveryOption.createMany).not.toHaveBeenCalled();
    expect(prisma.cartItem.createMany).not.toHaveBeenCalled();
    expect(prisma.order.create).not.toHaveBeenCalled();
    expect(prisma.$disconnect).toHaveBeenCalled();
  });

  test("should handle empty products gracefully", async () => {
    (prisma.product.findMany as any).mockResolvedValue([]);

    await expect(seed()).resolves.not.toThrow();
    expect(prisma.$disconnect).toHaveBeenCalled();
  });

  test("should handle empty delivery options gracefully", async () => {
    (prisma.product.findMany as any).mockResolvedValue(productsSeed);
    (prisma.deliveryOption.findMany as any).mockResolvedValue([]);

    await expect(seed()).resolves.not.toThrow();
    expect(prisma.$disconnect).toHaveBeenCalled();
  });
});
