/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { prisma } from "../../../prisma/database-prisma";
import { Product } from "./model-products";
import { getOrSetCache } from "../../lib/redis/cache";

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    return getOrSetCache(
      "products:all",
      async () => {
        return prisma.product.findMany();
      },
      Number(process.env.CACHE_TTL) || 3600
    );
  }

  static async getProductById(productId: string) {
    return getOrSetCache(
      `products:${productId}`,
      async () => {
        return prisma.product.findUnique({ where: { id: productId } });
      },
      Number(process.env.CACHE_TTL) || 3600
    );
  }

  static async preloadCache() {
    const products = await prisma.product.findMany();
    const ttl = Number(process.env.CACHE_TTL) || 3600;

    for (const product of products) {
      await getOrSetCache(`products:${product.id}`, async () => product, ttl);
    }

    await getOrSetCache("products:all", async () => products, ttl);
    console.log(`✅ Preload  ${products.length} products`);
  }
}
