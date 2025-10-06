import { prisma } from "../../database/database-prisma";

type CartItem = {
  productId: string;
  quantity: number;
  deliveryOptionId: string;
};

type OrderProduct = {
  productId: string;
  quantity: number;
  estimatedDeliveryTimeMs: number;
  product?: {
    id: string;
    name: string;
    image: string;
    stars: number;
    ratingCount: number;
    priceCents: number;
    keywords: string[];
  };
};

function mapOrderItem(
  item: {
    productId: string;
    quantity: number;
    estimatedDeliveryTimeMs: number | string | bigint;
    product?: {
      id: string;
      name: string;
      image: string;
      stars: number;
      ratingCount: number;
      priceCents: number;
      keywords: string[];
    };
  },
  expandProduct: boolean
): OrderProduct {
  const base = {
    productId: item.productId,
    quantity: item.quantity,
    estimatedDeliveryTimeMs: Number(item.estimatedDeliveryTimeMs)
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
        keywords: item.product.keywords
      }
    };
  }

  return base;
}

export async function listOrders(expandProduct: boolean) {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: expandProduct } } }
  });

  return orders.map((order) => ({
    id: order.id,
    orderTimeMs: Number(order.orderTimeMs),
    totalCostCents: order.totalCostCents,
    products: order.items.map((item) => mapOrderItem(item, expandProduct))
  }));
}

export async function createOrder(cart: CartItem[]) {
  if (!cart.length) {
    throw new Error("Cart cannot be empty");
  }

  const productIds = [...new Set(cart.map((item) => item.productId))];
  const deliveryOptionIds = [...new Set(cart.map((item) => item.deliveryOptionId))];

  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== productIds.length) {
    throw new Error("One or more products not found");
  }

  const deliveryOptions = await prisma.deliveryOption.findMany({
    where: { id: { in: deliveryOptionIds } }
  });
  if (deliveryOptions.length !== deliveryOptionIds.length) {
    throw new Error("One or more delivery options not found");
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const deliveryOptionMap = new Map(deliveryOptions.map((d) => [d.id, d]));

  const totalCostCents = Math.ceil(
    cart.reduce((acc, item) => {
      const product = productMap.get(item.productId)!;
      const deliveryOption = deliveryOptionMap.get(item.deliveryOptionId)!;
      return acc + product.priceCents * item.quantity + deliveryOption.priceCents;
    }, 0) * 1.1
  );

  const order = await prisma.order.create({
    data: {
      orderTimeMs: BigInt(Date.now()),
      totalCostCents,
      items: {
        create: cart.map((item) => {
          const deliveryOption = deliveryOptionMap.get(item.deliveryOptionId)!;
          return {
            productId: item.productId,
            quantity: item.quantity,
            estimatedDeliveryTimeMs: BigInt(deliveryOption.deliveryDays * 24 * 60 * 60 * 1000)
          };
        })
      }
    },
    include: { items: { include: { product: true } } }
  });

  return order;
}

export async function getOrderById(orderId: string, expandProduct: boolean) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: expandProduct } } }
  });

  if (!order) {
    return null;
  }

  return {
    id: order.id,
    orderTimeMs: Number(order.orderTimeMs),
    totalCostCents: order.totalCostCents,
    products: order.items.map((item) => mapOrderItem(item, expandProduct))
  };
}
