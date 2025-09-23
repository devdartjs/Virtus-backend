/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../database/database-prisma";
import seedDeliveryOptions from "../../lib/seed-functions/seedDeliveryOptions";

vi.spyOn(console, "log").mockImplementation(() => {});

describe("seedDeliveryOptions (unit)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("should create delivery options when the database is empty", async () => {
    const mockDeliveryOptions = { count: 3 };
    vi.spyOn(prisma.deliveryOption, "count").mockResolvedValue(0);
    vi.spyOn(prisma.deliveryOption, "createMany").mockResolvedValue(mockDeliveryOptions as any);

    const result = await seedDeliveryOptions();

    expect(prisma.deliveryOption.count).toHaveBeenCalledTimes(1);
    expect(prisma.deliveryOption.createMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockDeliveryOptions);
    expect(console.log).toHaveBeenCalledWith(
      "✅ Delivery options seeded with:",
      mockDeliveryOptions
    );
  });

  test("should not create delivery options when they already exist in the database", async () => {
    vi.spyOn(prisma.deliveryOption, "count").mockResolvedValue(5);
    const createManySpy = vi.spyOn(prisma.deliveryOption, "createMany");

    const result = await seedDeliveryOptions();

    expect(prisma.deliveryOption.count).toHaveBeenCalledTimes(1);
    expect(createManySpy).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith(
      "🟡 Delivery options already exist. Skipping delivery seeding."
    );
  });
});
