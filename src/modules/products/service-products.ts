/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { prisma } from "../../database/database-prisma";
import { getOrSetCache } from "../../lib/redis/cache";

export class ProductService {
  static async getAllProducts() {
    return getOrSetCache(
      "products:all",
      async () => {
        return await prisma.product.findMany();
      },
      Number(process.env.CACHE_TTL) || 60
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

    if (products.length === 0 || !products || !ttl) {
      return console.log("Error while loading products-preloadCache or ttl");
    } else {
      console.log("products-preloadCache:", products, "ttl-preloadCache:", ttl);
    }

    for (const product of products) {
      await getOrSetCache(`products:${product.id}`, async () => product, ttl);
    }

    await getOrSetCache("products:all", async () => products, ttl);
    console.log(`✅ Preload  ${products.length} products`);
  }
}
