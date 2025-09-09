import { t } from "elysia";

export const ProductSchema = t.Object({
  id: t.String({ format: "uuid" }),
  name: t.String(),
  image: t.String(),
  stars: t.Number(),
  ratingCount: t.Integer(),
  priceCents: t.Integer(),
  keywords: t.Array(t.String())
});

export const OrderProductBaseSchema = t.Object({
  productId: t.String({ format: "uuid" }),
  quantity: t.Integer(),
  estimatedDeliveryTimeMs: t.Number()
});

export const OrderProductExpandedSchema = t.Intersect([
  OrderProductBaseSchema,
  t.Object({
    product: ProductSchema
  })
]);

export const OrderProductSchema = t.Union([OrderProductBaseSchema, OrderProductExpandedSchema]);

export const OrderSchema = t.Object({
  id: t.String({ format: "uuid" }),
  orderTimeMs: t.Number(),
  totalCostCents: t.Number(),
  products: t.Array(OrderProductSchema)
});

export const OrdersResponseSchema = t.Array(OrderSchema);

export const OrdersQuerySchema = t.Object({
  expand: t.Optional(t.Literal("products"))
});

//POST

export const CreateOrderCartItemSchema = t.Object({
  productId: t.String({ format: "uuid" }),
  quantity: t.Integer({ minimum: 1 }),
  deliveryOptionId: t.String()
});

export const CreateOrderSchema = t.Object({
  cart: t.Array(CreateOrderCartItemSchema)
});
