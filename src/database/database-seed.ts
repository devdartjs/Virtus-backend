/* eslint no-console: ["error", { "allow": ["log", "error", "warn"] }] */
import { prisma } from "./database-prisma";
import seedProducts from "../lib/seed-functions/seedProducts";
import seedDeliveryOptions from "../lib/seed-functions/seedDeliveryOptions";

export async function seed() {
  try {
    if (!process.env.DATABASE_URL_STAGE_NEON) {
      console.log("Seeding database with db-container:");
    } else {
      console.log("Seeding database with db-cloud:");
    }

    await seedProducts();
    await seedDeliveryOptions();

    const products = await prisma.product.findMany();
    const deliveryOptions = await prisma.deliveryOption.findMany();

    if (
      products === undefined ||
      products.length === 0 ||
      deliveryOptions === undefined ||
      deliveryOptions.length === 0
    ) {
      return { message: "Products or delivery options missing" };
    }

    const countCartItems = await prisma.cartItem.count();
    if (countCartItems === 0) {
      await prisma.cartItem.createMany({
        data: [
          {
            productId: products[0].id,
            quantity: 2,
            deliveryOptionId: deliveryOptions[0].id
          },
          {
            productId: products[1].id,
            quantity: 1,
            deliveryOptionId: deliveryOptions[1].id
          }
        ],
        skipDuplicates: true
      });
      console.log("✅ Cart items seeded successfully");
    } else {
      console.log("🟡 Cart items already exist, skipping seeding");
    }

    const countOrders = await prisma.order.count();
    if (countOrders === 0) {
      const orders = [
        {
          id: "27cba69d-4c3d-4098-b42d-ac7fa62b7664",
          orderTimeMs: 1723456800000,
          totalCostCents: 3506,
          products: [
            {
              productId: products[0].id,
              quantity: 1,
              estimatedDeliveryTimeMs: 1723716000000
            },
            {
              productId: products[2]?.id || products[0].id,
              quantity: 2,
              estimatedDeliveryTimeMs: 1723456800000
            }
          ]
        },
        {
          id: "b6b6c212-d30e-4d4a-805d-90b52ce6b37d",
          orderTimeMs: 1718013600000,
          totalCostCents: 4190,
          products: [
            {
              productId: products[1].id,
              quantity: 2,
              estimatedDeliveryTimeMs: 1718618400000
            }
          ]
        }
      ];

      for (const order of orders) {
        await prisma.order.create({
          data: {
            id: order.id,
            orderTimeMs: order.orderTimeMs,
            totalCostCents: order.totalCostCents,
            items: {
              create: order.products.map((p) => ({
                productId: p.productId,
                quantity: p.quantity,
                estimatedDeliveryTimeMs: p.estimatedDeliveryTimeMs
              }))
            }
          }
        });
      }
      console.log("✅ Orders and order items seeded successfully");
    } else {
      console.log("🟡 Orders already exist, skipping seeding");
    }
  } catch (error) {
    console.error("Error during seeding process:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

try {
  await seed();
} catch (e) {
  console.error("Failed to seed database:", e);
  throw e;
}
