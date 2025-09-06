/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { describe, test, vi, beforeEach, expect } from "vitest";
import { seed } from "../../../prisma/database-seed";
import { prisma } from "../../../prisma/database-prisma";

vi.mock("../../../prisma/database-prisma", () => ({
  prisma: {
    product: { count: vi.fn(), createMany: vi.fn() },
    deliveryOption: { count: vi.fn(), createMany: vi.fn() },
    cartItem: { count: vi.fn(), createMany: vi.fn() },
    order: { count: vi.fn(), create: vi.fn() },
    $disconnect: vi.fn(),
  },
}));

describe("seed function", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("should seed products when none exist", async () => {
    (prisma.product.count as any).mockResolvedValue(0);
    (prisma.deliveryOption.count as any).mockResolvedValue(1);
    (prisma.cartItem.count as any).mockResolvedValue(1);
    (prisma.order.count as any).mockResolvedValue(1);

    await seed();

    expect(prisma.product.createMany).toHaveBeenCalled();
    expect(prisma.deliveryOption.createMany).not.toHaveBeenCalled();
    expect(prisma.cartItem.createMany).not.toHaveBeenCalled();
    expect(prisma.order.create).not.toHaveBeenCalled();
    expect(prisma.$disconnect).toHaveBeenCalled();
  });

  test("should skip seeding products when they exist", async () => {
    (prisma.product.count as any).mockResolvedValue(5);
    (prisma.deliveryOption.count as any).mockResolvedValue(0);
    (prisma.cartItem.count as any).mockResolvedValue(0);
    (prisma.order.count as any).mockResolvedValue(0);

    await seed();

    expect(prisma.product.createMany).not.toHaveBeenCalled();
    expect(prisma.deliveryOption.createMany).toHaveBeenCalled();
    expect(prisma.cartItem.createMany).toHaveBeenCalled();
    expect(prisma.order.create).toHaveBeenCalledTimes(2);
    expect(prisma.$disconnect).toHaveBeenCalled();
  });

  test("should skip all seeding when everything exists", async () => {
    (prisma.product.count as any).mockResolvedValue(1);
    (prisma.deliveryOption.count as any).mockResolvedValue(1);
    (prisma.cartItem.count as any).mockResolvedValue(1);
    (prisma.order.count as any).mockResolvedValue(1);

    await seed();

    expect(prisma.product.createMany).not.toHaveBeenCalled();
    expect(prisma.deliveryOption.createMany).not.toHaveBeenCalled();
    expect(prisma.cartItem.createMany).not.toHaveBeenCalled();
    expect(prisma.order.create).not.toHaveBeenCalled();
    expect(prisma.$disconnect).toHaveBeenCalled();
  });

  test("should seed orders correctly when none exist", async () => {
    (prisma.product.count as any).mockResolvedValue(1);
    (prisma.deliveryOption.count as any).mockResolvedValue(1);
    (prisma.cartItem.count as any).mockResolvedValue(1);
    (prisma.order.count as any).mockResolvedValue(0);
    (prisma.order.create as any).mockResolvedValue({});

    await seed();

    expect(prisma.order.create).toHaveBeenCalledTimes(2);
  });

  //   test("should handle errors and call process.exit on failure", async () => {
  //     const mockError = new Error("DB error");
  //     (prisma.product.count as any).mockRejectedValue(mockError);
  //     const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
  //       throw new Error("process.exit called");
  //     });

  //     await expect(seed()).rejects.toThrow("process.exit called");

  //     exitSpy.mockRestore();
  //   });
});
