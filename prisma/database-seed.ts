import { prisma } from "./database-prisma";

async function seed() {
  console.log("Seeding to:", process.env.DATABASE_URL);

  const countProducts = await prisma.product.count();
  if (countProducts === 0) {
    await prisma.product.createMany({
      data: [
        {
          id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
          name: "Black and Gray Athletic Cotton Socks - 6 Pairs",
          image: "images/products/athletic-cotton-socks-6-pairs.jpg",
          priceCents: 1090,
          keywords: ["socks", "sports", "apparel"],
          stars: 4.5,
          ratingCount: 87,
        },
        {
          id: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
          name: "Intermediate Size Basketball",
          image: "images/products/intermediate-composite-basketball.jpg",
          priceCents: 2095,
          keywords: ["sports", "basketballs"],
          stars: 4,
          ratingCount: 127,
        },
        {
          id: "872f7c91-4b26-418f-a0f2-ec74ce974444",
          name: "Adults Plain Cotton T-Shirt - 2 Pack",
          image: "images/products/adults-plain-cotton-tshirt-2-pack-teal.jpg",
          priceCents: 799,
          keywords: ["tshirts", "apparel", "casual"],
          stars: 4.3,
          ratingCount: 56,
        },
        {
          id: "dea677f1-46b2-4c58-940b-342bde27f61f",
          name: "2 Slot Toaster - Black",
          image: "images/products/2-slot-toaster-black.jpg",
          priceCents: 1899,
          keywords: ["kitchen", "appliances"],
          stars: 4.7,
          ratingCount: 219,
        },
        {
          id: "d9a82bc9-322f-44f5-be90-688f3ea48ed7",
          name: "6 Piece White Dinner Plate Set",
          image: "images/products/6-piece-white-dinner-plate-set.jpg",
          priceCents: 2067,
          keywords: ["kitchen", "plates", "dining"],
          stars: 4.4,
          ratingCount: 37,
        },
        {
          id: "4f80b7f6-f085-4ad9-9dbb-542bd31c1f76",
          name: "6-Piece Nonstick, Carbon Steel Oven Bakeware Baking Set",
          image: "images/products/6-piece-nonstick-baking-set.jpg",
          priceCents: 3499,
          keywords: ["kitchen", "cookware"],
          stars: 4.2,
          ratingCount: 95,
        },
        {
          id: "36c2e37b-7702-4a5b-8d7c-8675d5bc6bfa",
          name: "Plain Hooded Fleece Sweatshirt",
          image: "images/products/plain-hooded-fleece-sweatshirt-yellow.jpg",
          priceCents: 2400,
          keywords: ["hoodies", "apparel", "casual"],
          stars: 4.9,
          ratingCount: 317,
        },
        {
          id: "f90b9ac5-e8cb-4a53-9723-12ba3c2b5d48",
          name: "Luxury Towel Set - Graphite Gray",
          image: "images/products/luxury-tower-set-6-piece.jpg",
          priceCents: 3599,
          keywords: ["bathroom", "towels", "home"],
          stars: 4.6,
          ratingCount: 144,
        },
      ],
    });
    console.log("Database seeded.");
  }

  console.log("Database already has products, skipping seeding.");

  const countDeliveryOptions = await prisma.deliveryOption.count();
  if (countDeliveryOptions === 0) {
    await prisma.deliveryOption.createMany({
      data: [
        {
          id: "1",
          deliveryDays: 7,
          priceCents: 0,
        },
        {
          id: "2",
          deliveryDays: 3,
          priceCents: 499,
        },
        {
          id: "3",
          deliveryDays: 1,
          priceCents: 999,
        },
      ],
    });
    console.log("✅ Delivery options seeded.");
  }

  console.log("🟡 Delivery options already exist. Skipping delivery seeding.");

  const countCartItems = await prisma.cartItem.count();
  if (countCartItems === 0) {
    await prisma.cartItem.createMany({
      data: [
        {
          productId: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
          quantity: 2,
          deliveryOptionId: "1",
        },
        {
          productId: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
          quantity: 1,
          deliveryOptionId: "2",
        },
      ],
    });
    console.log("✅ Cart items seeded.");
  }
  console.log("🟡 Cart Items already exist. Skipping Cart Items seeding.");

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error("❌ Failed to seed:", e);
  process.exit(1);
});
