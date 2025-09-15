import { t } from "elysia";
import { ProductSchemaT } from "../products/schema-products";

export const CartItemsSchemaT = t.Object({
  id: t.String(),
  productId: t.String(),
  quantity: t.Number(),
  deliveryOptionId: t.String(),
  product: t.Optional(ProductSchemaT)
});
