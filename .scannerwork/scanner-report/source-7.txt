/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { prisma } from "../../../prisma/database-prisma";
import productsSeed from "../utils/productsSeed";

async function seedProducts() {
  const countProducts = await prisma.product.count();
  if (countProducts === 0) {
    const products = await prisma.product.createMany({
      data: productsSeed,
      skipDuplicates: true
    });
    console.log("✅ Database seeded with products:", products);
    return products;
  }

  console.log("🟡 Database already has products, skipping seeding.");
}

export default seedProducts;
