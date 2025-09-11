// /* eslint no-console: ["error", { "allow": ["log", "error"] }] */
// import { prisma } from "../../../prisma/database-prisma";
// import cartItemsSeed from "../utils/cartItemsSeed";

// async function seedCartItems() {
//   const countCartItems = await prisma.cartItem.count();
//   if (countCartItems === 0) {
//     await prisma.cartItem.createMany({
//       data: cartItemsSeed
//     });
//     console.log("✅ Cart items seeded.");
//   }
//   console.log("🟡 Cart Items already exist. Skipping Cart Items seeding.");
// }

// export default seedCartItems;
