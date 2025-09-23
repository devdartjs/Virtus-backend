/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { ProductService } from "../../../modules/products/service-products";
import * as cacheModule from "../../../lib/redis/cache";
import { prisma } from "../../../database/database-prisma";

vi.mock("../../../lib/redis/cache");

const getOrSetCache = vi.mocked(cacheModule.getOrSetCache);

describe("ProductService.getAllProducts - Unit Tests", () => {
  const mockProducts = [
    {
      id: "1",
      name: "Product 1",
      image: "image1.jpg",
      stars: 4.5,
      ratingCount: 100,
      priceCents: 10000,
      keywords: ["product", "category1"]
    },
    {
      id: "2",
      name: "Product 2",
      image: "image2.jpg",
      stars: 4.0,
      ratingCount: 50,
      priceCents: 20000,
      keywords: ["product", "category2"]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return products when cache has products", async () => {
    getOrSetCache.mockResolvedValueOnce(mockProducts);
    const result = await ProductService.getAllProducts();
    expect(result).toEqual(mockProducts);
    expect(getOrSetCache).toHaveBeenCalledTimes(1);
    expect(getOrSetCache).toHaveBeenCalledWith(
      "products:all",
      expect.any(Function),
      expect.any(Number)
    );
  });

  test("should return empty array when cache returns empty", async () => {
    getOrSetCache.mockResolvedValueOnce([]);
    const result = await ProductService.getAllProducts();
    expect(result).toEqual([]);
    expect(getOrSetCache).toHaveBeenCalledTimes(1);
  });

  test("should throw error when cache fails", async () => {
    getOrSetCache.mockRejectedValueOnce(new Error("Cache failure"));
    await expect(ProductService.getAllProducts()).rejects.toThrow("Cache failure");
    expect(getOrSetCache).toHaveBeenCalledTimes(1);
  });
});

describe("ProductService.getProductById - Unit Tests", () => {
  const mockProduct = {
    id: "1",
    name: "Product 1",
    image: "image1.jpg",
    stars: 4.5,
    ratingCount: 100,
    priceCents: 10000,
    keywords: ["product", "category1"]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return product by id when cache resolves", async () => {
    getOrSetCache.mockResolvedValueOnce(mockProduct);
    const result = await ProductService.getProductById("1");
    expect(result).toEqual(mockProduct);
    expect(getOrSetCache).toHaveBeenCalledTimes(1);
    expect(getOrSetCache).toHaveBeenCalledWith(
      "products:1",
      expect.any(Function),
      expect.any(Number)
    );
  });

  test("should return null when cache returns null", async () => {
    getOrSetCache.mockResolvedValueOnce(null);
    const result = await ProductService.getProductById("999");
    expect(result).toBeNull();
    expect(getOrSetCache).toHaveBeenCalledTimes(1);
  });

  test("should throw error when cache fails", async () => {
    getOrSetCache.mockRejectedValueOnce(new Error("Cache failure"));
    await expect(ProductService.getProductById("1")).rejects.toThrow("Cache failure");
    expect(getOrSetCache).toHaveBeenCalledTimes(1);
  });
});

describe("ProductService.preloadCache - Unit Tests", () => {
  const mockProducts = [
    { id: "1", name: "Product 1" },
    { id: "2", name: "Product 2" }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(prisma.product, "findMany").mockResolvedValue(mockProducts as any);
  });

  test("should preload cache for all products and products:all", async () => {
    await ProductService.preloadCache();
    expect(getOrSetCache).toHaveBeenCalledTimes(mockProducts.length + 1);
    for (const product of mockProducts) {
      expect(getOrSetCache).toHaveBeenCalledWith(
        `products:${product.id}`,
        expect.any(Function),
        expect.any(Number)
      );
    }
    expect(getOrSetCache).toHaveBeenCalledWith(
      "products:all",
      expect.any(Function),
      expect.any(Number)
    );
    expect(console.log).toHaveBeenCalledWith(`✅ Preload  ${mockProducts.length} products`);
  });

  test("should throw if getOrSetCache fails", async () => {
    getOrSetCache.mockRejectedValueOnce(new Error("Cache error"));
    await expect(ProductService.preloadCache()).rejects.toThrow("Cache error");
  });
});
