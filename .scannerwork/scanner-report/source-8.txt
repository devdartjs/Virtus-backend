/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { prisma } from "../../database/database-prisma";
import deliveryOptionsSeed from "../utils/deliveryOptionsSeed";

async function seedDeliveryOptions() {
  const countDeliveryOptions = await prisma.deliveryOption.count();
  if (countDeliveryOptions === 0) {
    const deliveryOptions = await prisma.deliveryOption.createMany({
      data: deliveryOptionsSeed,
      skipDuplicates: true
    });
    console.log("✅ Delivery options seeded with:", deliveryOptions);
    return deliveryOptions;
  }

  console.log("🟡 Delivery options already exist. Skipping delivery seeding.");
}

export default seedDeliveryOptions;
