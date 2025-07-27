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
