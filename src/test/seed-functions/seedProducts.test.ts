/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../database/database-prisma";
import seedProducts from "../../lib/seed-functions/seedProducts";

vi.spyOn(console, "log").mockImplementation(() => {});

describe("seedProducts (unit)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("should create products when the database is empty", async () => {
    const mockProducts = { count: 3 };
    vi.spyOn(prisma.product, "count").mockResolvedValue(0);
    vi.spyOn(prisma.product, "createMany").mockResolvedValue(mockProducts as any);

    const result = await seedProducts();

    expect(prisma.product.count).toHaveBeenCalledTimes(1);
    expect(prisma.product.createMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockProducts);
    expect(console.log).toHaveBeenCalledWith("✅ Database seeded with products:", mockProducts);
  });

  test("should not create products when they already exist in the database", async () => {
    vi.spyOn(prisma.product, "count").mockResolvedValue(5);
    const createManySpy = vi.spyOn(prisma.product, "createMany");

    const result = await seedProducts();

    expect(prisma.product.count).toHaveBeenCalledTimes(1);
    expect(createManySpy).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith("🟡 Database already has products, skipping seeding.");
  });
});
