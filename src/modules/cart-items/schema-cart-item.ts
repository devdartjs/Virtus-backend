import { t } from "elysia";

export const CartItemsSchemaT = t.Object({
  id: t.String({ format: "uuid" }),
  productId: t.String({ format: "uuid" }),
  quantity: t.Integer({ minimum: 0 }),
  deliveryOptionId: t.String(),
});
