import { prisma } from "../../../prisma/database-prisma";

export async function listOrders(expandProduct: boolean) {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: expandProduct,
        },
      },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    orderTimeMs: Number(order.orderTimeMs),
    totalCostCents: order.totalCostCents,
    products: order.items.map((item) => {
      const base = {
        productId: item.productId,
        quantity: item.quantity,
        estimatedDeliveryTimeMs: Number(item.estimatedDeliveryTimeMs),
      };

      if (expandProduct && item.product) {
        return {
          ...base,
          product: {
            id: item.product.id,
            name: item.product.name,
            image: item.product.image,
            stars: item.product.stars,
            ratingCount: item.product.ratingCount,
            priceCents: item.product.priceCents,
            keywords: item.product.keywords,
          },
        };
      }

      return base;
    }),
  }));
}

export async function createOrder(
  cart: {
    productId: string;
    quantity: number;
    deliveryOptionId: string;
  }[]
) {
  if (!cart.length) throw new Error("Cart cannot be empty");

  const productIds = [...new Set(cart.map((item) => item.productId))];
  const deliveryOptionIds = [
    ...new Set(cart.map((item) => item.deliveryOptionId)),
  ];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    throw new Error("One or more products not found");
  }

  const deliveryOptions = await prisma.deliveryOption.findMany({
    where: { id: { in: deliveryOptionIds } },
  });

  if (deliveryOptions.length !== deliveryOptionIds.length) {
    throw new Error("One or more delivery options not found");
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const deliveryOptionMap = new Map(deliveryOptions.map((d) => [d.id, d]));

  let totalCostCents = 0;

  for (const item of cart) {
    const product = productMap.get(item.productId)!;
    const deliveryOption = deliveryOptionMap.get(item.deliveryOptionId)!;

    const itemCost =
      product.priceCents * item.quantity + deliveryOption.priceCents;
    totalCostCents += itemCost;
  }

  totalCostCents = Math.ceil(totalCostCents * 1.1);

  const order = await prisma.order.create({
    data: {
      orderTimeMs: BigInt(Date.now()),
      totalCostCents,
      items: {
        create: cart.map((item) => {
          const deliveryOption = deliveryOptionMap.get(item.deliveryOptionId)!;
          const estimatedDeliveryTimeMs = BigInt(
            deliveryOption.deliveryDays * 24 * 60 * 60 * 1000
          );

          return {
            productId: item.productId,
            quantity: item.quantity,
            estimatedDeliveryTimeMs,
          };
        }),
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return order;
}

export async function getOrderById(orderId: string, expandProduct: boolean) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: expandProduct,
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    orderTimeMs: Number(order.orderTimeMs),
    totalCostCents: order.totalCostCents,
    products: order.items.map((item) => {
      const base = {
        productId: item.productId,
        quantity: item.quantity,
        estimatedDeliveryTimeMs: Number(item.estimatedDeliveryTimeMs),
      };

      if (expandProduct && item.product) {
        return {
          ...base,
          product: {
            id: item.product.id,
            name: item.product.name,
            image: item.product.image,
            stars: item.product.stars,
            ratingCount: item.product.ratingCount,
            priceCents: item.product.priceCents,
            keywords: item.product.keywords,
          },
        };
      }

      return base;
    }),
  };
}
