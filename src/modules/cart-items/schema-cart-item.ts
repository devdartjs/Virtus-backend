import { t } from "elysia";

export const CartItemsSchemaT = t.Object({
  id: t.String(),
  productId: t.String(),
  quantity: t.Integer(),
  deliveryOptionId: t.String(),
});
