import { prisma } from "./database-prisma";

async function seed() {
  console.log("Seeding to:", process.env.DATABASE_URL);

  const countProducts = await prisma.product.count();
  if (countProducts === 0) {
    await prisma.product.createMany({
      data: [
        {
          id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
          image: "images/products/athletic-cotton-socks-6-pairs.jpg",
          name: "Black and Gray Athletic Cotton Socks - 6 Pairs",

          stars: 4.5,
          ratingCount: 87,

          priceCents: 1090,
          keywords: ["socks", "sports", "apparel"],
        },
        {
          id: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
          image: "images/products/intermediate-composite-basketball.jpg",
          name: "Intermediate Size Basketball",

          stars: 4,
          ratingCount: 127,

          priceCents: 2095,
          keywords: ["sports", "basketballs"],
        },
        {
          id: "83d4ca15-0f35-48f5-b7a3-1ea210004f2e",
          image: "images/products/adults-plain-cotton-tshirt-2-pack-teal.jpg",
          name: "Adults Plain Cotton T-Shirt - 2 Pack",

          stars: 4.5,
          ratingCount: 56,

          priceCents: 799,
          keywords: ["tshirts", "apparel", "mens"],
        },
        {
          id: "54e0eccd-8f36-462b-b68a-8182611d9add",
          image: "images/products/2-slot-toaster-white.jpg",
          name: "2 Slot Toaster - White",

          stars: 5,
          ratingCount: 2197,

          priceCents: 1899,
          keywords: ["toaster", "kitchen", "appliances"],
        },
        {
          id: "3ebe75dc-64d2-4137-8860-1f5a963e534b",
          image: "images/products/elegant-white-dinner-plate-set.jpg",
          name: "2 Piece White Dinner Plate Set",

          stars: 4,
          ratingCount: 37,

          priceCents: 2067,
          keywords: ["plates", "kitchen", "dining"],
        },
        {
          id: "8c9c52b5-5a19-4bcb-a5d1-158a74287c53",
          image: "images/products/3-piece-cooking-set.jpg",
          name: "3 Piece Non-Stick, Black Cooking Pot Set",

          stars: 4.5,
          ratingCount: 175,

          priceCents: 3499,
          keywords: ["kitchen", "cookware"],
        },
        {
          id: "dd82ca78-a18b-4e2a-9250-31e67412f98d",
          image:
            "images/products/women-plain-cotton-oversized-sweater-gray.jpg",
          name: "Cotton Oversized Sweater - Gray",

          stars: 4.5,
          ratingCount: 317,

          priceCents: 2400,
          keywords: ["sweaters", "apparel"],
        },
        {
          id: "77919bbe-0e56-475b-adde-4f24dfed3a04",
          image: "images/products/luxury-towel-set.jpg",
          name: "2 Piece Luxury Towel Set - White",

          stars: 4.5,
          ratingCount: 144,

          priceCents: 3599,
          keywords: [
            "bathroom",
            "washroom",
            "restroom",
            "towels",
            "bath towels",
          ],
        },
        {
          id: "6b07d4e7-f540-454e-8a1e-363f25dbae7d",
          image: "images/products/facial-tissue-2-ply-8-boxes.jpg",
          name: "Ultra Soft Tissue 2-Ply - 8 Boxes",

          stars: 4,
          ratingCount: 99,

          priceCents: 2374,
          keywords: ["kleenex", "tissues", "kitchen", "napkins"],
        },
        {
          id: "5968897c-4d27-4872-89f6-5bcb052746d7",
          image: "images/products/women-striped-beach-dress.jpg",
          name: "Women's Striped Beach Dress",

          stars: 4.5,
          ratingCount: 235,

          priceCents: 2970,
          keywords: ["robe", "swimsuit", "swimming", "bathing", "apparel"],
        },
        {
          id: "b86ddc8b-3501-4b17-9889-a3bad6fb585f",
          image: "images/products/women-sandal-heels-white-pink.jpg",
          name: "Women's Sandal Heels - Pink",

          stars: 4.5,
          ratingCount: 2286,

          priceCents: 5300,
          keywords: ["womens", "shoes", "heels", "sandals"],
        },
        {
          id: "aad29d11-ea98-41ee-9285-b916638cac4a",
          image: "images/products/round-sunglasses-gold.jpg",
          name: "Round Sunglasses",

          stars: 4.5,
          ratingCount: 30,

          priceCents: 3560,
          keywords: ["accessories", "shades"],
        },
        {
          id: "901eb2ca-386d-432e-82f0-6fb1ee7bf969",
          image: "images/products/blackout-curtain-set-beige.jpg",
          name: "Blackout Curtains Set - Beige",

          stars: 4.5,
          ratingCount: 232,

          priceCents: 4599,
          keywords: ["bedroom", "curtains", "home"],
        },
        {
          id: "82bb68d7-ebc9-476a-989c-c78a40ee5cd9",
          image: "images/products/women-summer-jean-shorts.jpg",
          name: "Women's Summer Jean Shorts",

          stars: 4,
          ratingCount: 160,

          priceCents: 1699,
          keywords: ["shorts", "apparel", "womens"],
        },
        {
          id: "c2a82c5e-aff4-435f-9975-517cfaba2ece",
          image: "images/products/electric-steel-hot-water-kettle-white.jpg",
          name: "Electric Hot Water Kettle - White",

          stars: 5,
          ratingCount: 846,

          priceCents: 5074,
          keywords: ["water kettle", "appliances", "kitchen"],
        },
        {
          id: "58b4fc92-e98c-42aa-8c55-b6b79996769a",
          image: "images/products/knit-athletic-sneakers-gray.jpg",
          name: "Waterproof Knit Athletic Sneakers - Gray",

          stars: 4,
          ratingCount: 89,

          priceCents: 5390,
          keywords: ["shoes", "running shoes", "footwear"],
        },
        {
          id: "a82c6bac-3067-4e68-a5ba-d827ac0be010",
          image: "images/products/straw-sunhat.jpg",
          name: "Straw Wide Brim Sun Hat",

          stars: 4,
          ratingCount: 215,

          priceCents: 2200,
          keywords: ["hats", "straw hats", "summer", "apparel"],
        },
        {
          id: "1c079479-8586-494f-ab53-219325432536",
          image: "images/products/men-athletic-shoes-white.jpg",
          name: "Men's Athletic Sneaker - White",

          stars: 4,
          ratingCount: 229,

          priceCents: 4590,
          keywords: ["shoes", "running shoes", "footwear", "mens"],
        },
        {
          id: "b0f17cc5-8b40-4ca5-9142-b61fe3d98c85",
          image: "images/products/men-stretch-wool-sweater-black.jpg",
          name: "Men's Wool Sweater - Black",

          stars: 4.5,
          ratingCount: 2465,

          priceCents: 3374,
          keywords: ["sweaters", "apparel"],
        },
        {
          id: "a93a101d-79ef-4cf3-a6cf-6dbe532a1b4a",
          image: "images/products/bathroom-mat.jpg",
          name: "Bathroom Bath Mat 16 x 32 Inch - Grey",

          stars: 4.5,
          ratingCount: 119,

          priceCents: 1850,
          keywords: ["bathmat", "bathroom", "home"],
        },
        {
          id: "4f4fbcc2-4e72-45cc-935c-9e13d79cc57f",
          image: "images/products/women-knit-ballet-flat-white.jpg",
          name: "Women's Ballet Flat - White",

          stars: 4,
          ratingCount: 326,

          priceCents: 2640,
          keywords: ["shoes", "flats", "womens", "footwear"],
        },
        {
          id: "8b5a2ee1-6055-422a-a666-b34ba28b76d4",
          image: "images/products/men-golf-polo-t-shirt-gray.jpg",
          name: "Men's Golf Polo Shirt - Gray",

          stars: 4.5,
          ratingCount: 2556,

          priceCents: 1599,
          keywords: ["tshirts", "shirts", "apparel", "mens"],
        },
        {
          id: "3fdfe8d6-9a15-4979-b459-585b0d0545b9",
          image: "images/products/laundry-detergent-tabs.jpg",
          name: "Laundry Detergent Tabs, 50 Loads",

          stars: 4.5,
          ratingCount: 305,

          priceCents: 2899,
          keywords: ["bathroom", "cleaning"],
        },
        {
          id: "e4f64a65-1377-42bc-89a5-e572d19252e2",
          image: "images/products/sky-leaf-branch-earrings.jpg",
          name: "Sterling Silver Leaf Branch Earrings",

          stars: 4.5,
          ratingCount: 52,

          priceCents: 6799,
          keywords: ["jewelry", "accessories", "womens"],
        },
        {
          id: "19c6a64a-5463-4d45-9af8-e41140a4100c",
          image: "images/products/duvet-cover-set-gray-queen.jpg",
          name: "Duvet Cover Set, Diamond Pattern",

          stars: 4,
          ratingCount: 456,

          priceCents: 4399,
          keywords: ["bedroom", "bed sheets", "sheets", "covers", "home"],
        },
        {
          id: "d2785924-743d-49b3-8f03-ec258e640503",
          image: "images/products/women-knit-beanie-pom-pom-blue.jpg",
          name: "Women's Knit Winter Beanie - Blue",

          stars: 5,
          ratingCount: 83,

          priceCents: 1950,
          keywords: ["hats", "winter hats", "beanies", "apparel", "womens"],
        },
        {
          id: "ee1f7c56-f977-40a4-9642-12ba5072e2b0",
          image: "images/products/men-chino-pants-beige.jpg",
          name: "Men's Chino Pants - Beige",

          stars: 4.5,
          ratingCount: 9017,

          priceCents: 2290,
          keywords: ["pants", "apparel", "mens"],
        },
        {
          id: "4df68c27-fd59-4a6a-bbd1-e754ddb6d53c",
          image: "images/products/men-navigator-sunglasses-black.jpg",
          name: "Men's Navigator Sunglasses",

          stars: 3.5,
          ratingCount: 42,

          priceCents: 3690,
          keywords: ["sunglasses", "glasses", "accessories", "shades"],
        },
        {
          id: "04701903-bc79-49c6-bc11-1af7e3651358",
          image: "images/products/men-brown-flat-sneakers.jpg",
          name: "Men's Brown Flat Sneakers",

          stars: 4.5,
          ratingCount: 562,

          priceCents: 2499,
          keywords: ["footwear", "men", "sneakers"],
        },
        {
          id: "4e37dd03-3b23-4bc6-9ff8-44e112a92c64",
          image: "images/products/non-stick-cooking-set-4-pieces.jpg",
          name: "Non-Stick Cook Set With Lids - 4 Pieces",

          stars: 4.5,
          ratingCount: 511,

          priceCents: 6797,
          keywords: ["cooking set", "kitchen"],
        },
        {
          id: "a434b69f-1bc1-482d-9ce7-cd7f4a66ce8d",
          image: "images/products/vanity-mirror-pink.jpg",
          name: "Vanity Mirror with LED Lights - Pink",

          stars: 4.5,
          ratingCount: 130,

          priceCents: 2549,
          keywords: ["bathroom", "washroom", "mirrors", "home"],
        },
        {
          id: "a45cfa0a-66d6-4dc7-9475-e2b01595f7d7",
          image: "images/products/women-relaxed-lounge-pants-pink.jpg",
          name: "Women's Relaxed Lounge Pants - Pink",

          stars: 4.5,
          ratingCount: 248,

          priceCents: 3400,
          keywords: ["pants", "apparel", "womens"],
        },
        {
          id: "d339adf3-e004-4c20-a120-40e8874c66cb",
          image: "images/products/crystal-zirconia-stud-earrings-pink.jpg",
          name: "Crystal Zirconia Stud Earrings - Pink",

          stars: 4.5,
          ratingCount: 117,

          priceCents: 3467,
          keywords: ["accessories", "womens"],
        },
        {
          id: "d37a651a-d501-483b-aae6-a9659b0757a0",
          image: "images/products/glass-screw-lid-food-containers.jpg",
          name: "Glass Screw Lid Containers - 3 Pieces",

          stars: 4,
          ratingCount: 126,

          priceCents: 2899,
          keywords: ["food containers", "kitchen"],
        },
        {
          id: "0d7f9afa-2efe-4fd9-b0fd-ba5663e0a524",
          image: "images/products/black-and-silver-espresso-maker.jpg",
          name: "Black and Silver Espresso Maker",

          stars: 4.5,
          ratingCount: 1211,
          priceCents: 8250,
          keywords: ["espresso makers", "kitchen", "appliances"],
        },
        {
          id: "02e3a47e-dd68-467e-9f71-8bf6f723fdae",
          image: "images/products/blackout-curtains-set-teal.jpg",
          name: "Blackout Curtains Set 42 x 84-Inch - Teal",

          stars: 4.5,
          ratingCount: 363,

          priceCents: 3099,
          keywords: ["bedroom", "home", "curtains"],
        },
        {
          id: "8a53b080-6d40-4a65-ab26-b24ecf700bce",
          image: "images/products/bath-towel-set-gray-rosewood.jpg",
          name: "Bath Towels 2 Pack - Gray, Rosewood",

          stars: 4.5,
          ratingCount: 93,

          priceCents: 2990,
          keywords: ["bathroom", "home", "towels"],
        },
        {
          id: "10ed8504-57db-433c-b0a3-fc71a35c88a1",
          image: "images/products/athletic-skateboard-shoes-gray.jpg",
          name: "Athletic Skateboard Shoes - Gray",

          stars: 4,
          ratingCount: 89,

          priceCents: 3390,
          keywords: ["shoes", "running shoes", "footwear"],
        },
        {
          id: "77a845b1-16ed-4eac-bdf9-5b591882113d",
          image: "images/products/ratingCountertop-push-blender-black.jpg",
          name: "ratingCountertop Push Blender - Black",

          stars: 4,
          ratingCount: 3,

          priceCents: 10747,
          keywords: ["food blenders", "kitchen", "appliances"],
        },
        {
          id: "bc2847e9-5323-403f-b7cf-57fde044a955",
          image: "images/products/men-cozy-fleece-hoodie-light-teal.jpg",
          name: "Men's Fleece Hoodie - Light Teal",

          stars: 4.5,
          ratingCount: 3157,

          priceCents: 3800,
          keywords: ["sweaters", "hoodies", "apparel", "mens"],
        },
        {
          id: "36c64692-677f-4f58-b5ec-0dc2cf109e27",
          image: "images/products/artistic-bowl-set-6-piece.jpg",
          name: "Artistic Bowl and Plate Set - 6 Pieces",

          stars: 5,
          ratingCount: 679,

          priceCents: 3899,
          keywords: ["bowls set", "kitchen"],
        },
        {
          id: "aaa65ef3-8d6f-4eb3-bc9b-a6ea49047d8f",
          image: "images/products/kitchen-paper-towels-8-pack.jpg",
          name: "2-Ply Kitchen Paper Towels - 8 Pack",

          stars: 4.5,
          ratingCount: 1045,

          priceCents: 1899,
          keywords: ["kitchen", "kitchen towels", "tissues"],
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

  const countOrders = await prisma.order.count();
  if (countOrders === 0) {
    const orders = [
      {
        id: "27cba69d-4c3d-4098-b42d-ac7fa62b7664",
        orderTimeMs: 1723456800000,
        totalCostCents: 3506,
        products: [
          {
            productId: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
            quantity: 1,
            estimatedDeliveryTimeMs: 1723716000000,
          },
          {
            productId: "83d4ca15-0f35-48f5-b7a3-1ea210004f2e",
            quantity: 2,
            estimatedDeliveryTimeMs: 1723456800000,
          },
        ],
      },
      {
        id: "b6b6c212-d30e-4d4a-805d-90b52ce6b37d",
        orderTimeMs: 1718013600000,
        totalCostCents: 4190,
        products: [
          {
            productId: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
            quantity: 2,
            estimatedDeliveryTimeMs: 1718618400000,
          },
        ],
      },
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
              estimatedDeliveryTimeMs: p.estimatedDeliveryTimeMs,
            })),
          },
        },
      });
    }

    console.log("✅ Orders and order items seeded.");
  } else {
    console.log("🟡 Orders already exist. Skipping order seeding.");
  }

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error("❌ Failed to seed:", e);
  process.exit(1);
});
