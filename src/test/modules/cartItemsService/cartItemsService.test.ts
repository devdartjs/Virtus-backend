import { describe, test, expect, afterEach, vi } from "vitest";
import { CartItemsService } from "../../../modules/cart-items/service-cart-item";
import { prisma } from "../../../database/database-prisma";

vi.mock("../../../database/database-prisma.ts", () => {
  return {
    prisma: {
      cartItem: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        update: vi.fn()
      }
    }
  };
});

describe("CartItemsService - getCartItems", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should return a list of cart items ordered by product name", async () => {
    const mockItems = [
      { id: "1", productId: "a", quantity: 2, deliveryOptionId: "x" },
      { id: "2", productId: "b", quantity: 1, deliveryOptionId: "y" }
    ];

    (prisma.cartItem.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockItems);

    const result = await CartItemsService.getCartItems();

    expect(prisma.cartItem.findMany).toHaveBeenCalledWith({
      orderBy: { product: { name: "asc" } }
    });
    expect(result).toEqual(mockItems);
  });

  test("should return an empty array if no cart items exist", async () => {
    (prisma.cartItem.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await CartItemsService.getCartItems();

    expect(result).toEqual([]);
  });

  test("should propagate errors thrown by Prisma", async () => {
    const error = new Error("Database error");
    (prisma.cartItem.findMany as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    await expect(CartItemsService.getCartItems()).rejects.toThrow("Database error");
  });
});

describe("CartItemsService - createCartItem", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should create a cart item successfully", async () => {
    const mockData = {
      productId: "prod-1",
      quantity: 2,
      deliveryOptionId: "del-1"
    };

    const mockCreatedItem = {
      id: "cart-1",
      ...mockData
    };

    (prisma.cartItem.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockCreatedItem
    );

    const result = await CartItemsService.createCartItem(mockData);

    expect(prisma.cartItem.create).toHaveBeenCalledWith({
      data: {
        product: { connect: { id: mockData.productId } },
        deliveryOption: { connect: { id: mockData.deliveryOptionId } },
        quantity: mockData.quantity
      },
      select: {
        id: true,
        productId: true,
        quantity: true,
        deliveryOptionId: true
      }
    });

    expect(result).toEqual(mockCreatedItem);
  });

  test("should propagate errors thrown by Prisma", async () => {
    const mockData = {
      productId: "prod-1",
      quantity: 2,
      deliveryOptionId: "del-1"
    };

    const error = new Error("Database create error");
    (prisma.cartItem.create as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    await expect(CartItemsService.createCartItem(mockData)).rejects.toThrow(
      "Database create error"
    );
  });
});

describe("CartItemsService - deleteCartItem", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should delete a cart item successfully", async () => {
    const mockId = "550e8400-e29b-41d4-a716-446655440000";
    const mockDeletedItem = {
      id: mockId,
      productId: "550e8400-e29b-41d4-a716-446655440001",
      quantity: 3,
      deliveryOptionId: "del-1"
    };

    (prisma.cartItem.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockDeletedItem
    );

    const deletedItem = await CartItemsService.deleteCartItem(mockId);

    expect(prisma.cartItem.delete).toHaveBeenCalledWith({
      where: { id: mockId }
    });

    expect(deletedItem).toEqual(mockDeletedItem);
  });

  test("should propagate errors thrown by Prisma", async () => {
    const mockId = "cart-1";
    const error = new Error("Database delete error");

    (prisma.cartItem.delete as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    await expect(CartItemsService.deleteCartItem(mockId)).rejects.toThrow("Database delete error");
  });
});

describe("CartItemsService - updateCartItem", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should update a cart item successfully with quantity only", async () => {
    const mockId = "cart-1";
    const mockData = { quantity: 5 };
    const mockUpdatedItem = {
      id: mockId,
      productId: "prod-1",
      quantity: 5,
      deliveryOptionId: "del-1"
    };

    (prisma.cartItem.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUpdatedItem
    );

    const result = await CartItemsService.updateCartItem(mockId, mockData);

    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: mockId },
      data: { quantity: mockData.quantity },
      select: {
        id: true,
        productId: true,
        quantity: true,
        deliveryOptionId: true
      }
    });

    expect(result).toEqual(mockUpdatedItem);
  });

  test("should update a cart item successfully with deliveryOptionId only", async () => {
    const mockId = "cart-1";
    const mockData = { deliveryOptionId: "del-2" };
    const mockUpdatedItem = {
      id: mockId,
      productId: "prod-1",
      quantity: 2,
      deliveryOptionId: "del-2"
    };

    (prisma.cartItem.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUpdatedItem
    );

    const result = await CartItemsService.updateCartItem(mockId, mockData);

    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: mockId },
      data: { deliveryOption: { connect: { id: mockData.deliveryOptionId } } },
      select: {
        id: true,
        productId: true,
        quantity: true,
        deliveryOptionId: true
      }
    });

    expect(result).toEqual(mockUpdatedItem);
  });

  test("should propagate errors thrown by Prisma", async () => {
    const mockId = "cart-1";
    const mockData = { quantity: 3 };
    const error = new Error("Database update error");

    (prisma.cartItem.update as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    await expect(CartItemsService.updateCartItem(mockId, mockData)).rejects.toThrow(
      "Database update error"
    );
  });
});

describe("CartItemsService - findByProductId", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should return a cart item if it exists", async () => {
    const mockProductId = "prod-1";
    const mockCartItem = {
      id: "cart-1",
      productId: mockProductId,
      quantity: 2,
      deliveryOptionId: "del-1"
    };

    (prisma.cartItem.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockCartItem
    );

    const result = await CartItemsService.findByProductId(mockProductId);

    expect(prisma.cartItem.findFirst).toHaveBeenCalledWith({
      where: { productId: mockProductId }
    });
    expect(result).toEqual(mockCartItem);
  });

  test("should return null if no cart item exists with the given productId", async () => {
    const mockProductId = "prod-1";

    (prisma.cartItem.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await CartItemsService.findByProductId(mockProductId);

    expect(result).toBeNull();
  });

  test("should propagate errors thrown by Prisma", async () => {
    const mockProductId = "prod-1";
    const error = new Error("Database error");

    (prisma.cartItem.findFirst as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    await expect(CartItemsService.findByProductId(mockProductId)).rejects.toThrow("Database error");
  });
});
