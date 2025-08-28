import { Elysia } from "elysia";
import { prisma } from "../../../prisma/database-prisma";

export const getPaymentSummaryRoute = new Elysia({
  prefix: "/api/v1/payment-summary",
}).get("/", async () => {
  const TAX_RATE = 0.1;

  const cartItems = await prisma.cartItem.findMany({
    include: {
      product: true,
      deliveryOption: true,
    },
  });

  let totalItems = 0;
  let productCostCents = 0;
  let shippingCostCents = 0;

  for (const item of cartItems) {
    totalItems += item.quantity;
    productCostCents += (item.product?.priceCents ?? 0) * item.quantity;
    shippingCostCents += (item.deliveryOption?.priceCents ?? 0) * item.quantity;
  }

  const totalCostBeforeTaxCents = productCostCents + shippingCostCents;
  const taxCents = Math.round(totalCostBeforeTaxCents * TAX_RATE);
  const totalCostCents = totalCostBeforeTaxCents + taxCents;

  return {
    totalItems,
    productCostCents,
    shippingCostCents,
    totalCostBeforeTaxCents,
    taxCents,
    totalCostCents,
  };
});
