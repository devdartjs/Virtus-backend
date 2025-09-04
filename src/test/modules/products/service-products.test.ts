import { describe, test, expect, vi, beforeEach } from "vitest";
import { ProductService } from "../../../modules/products/service-products";
import { Product } from "../../../modules/products/model-products";
import * as cacheModule from "../../../lib/redis/cache";

// Mock do módulo Redis
vi.mock("../../../lib/redis/cache");

const getOrSetCache = vi.mocked(cacheModule.getOrSetCache);

describe("ProductService.getAllProducts - Unit Tests", () => {
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Product 1",
      image: "image1.jpg",
      stars: 4.5,
      ratingCount: 100,
      priceCents: 10000,
      keywords: ["product", "category1"],
    },
    {
      id: "2",
      name: "Product 2",
      image: "image2.jpg",
      stars: 4.0,
      ratingCount: 50,
      priceCents: 20000,
      keywords: ["product", "category2"],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return products when getOrSetCache resolves with products", async () => {
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

  test("should return empty list when getOrSetCache resolves with empty array", async () => {
    getOrSetCache.mockResolvedValueOnce([]);

    const result = await ProductService.getAllProducts();

    expect(result).toEqual([]);
    expect(getOrSetCache).toHaveBeenCalledTimes(1);
  });

  test("should propagate error when getOrSetCache rejects", async () => {
    getOrSetCache.mockRejectedValueOnce(new Error("Cache failure"));

    await expect(ProductService.getAllProducts()).rejects.toThrow(
      "Cache failure"
    );
    expect(getOrSetCache).toHaveBeenCalledTimes(1);
  });
});
