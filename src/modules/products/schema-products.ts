import { t } from "elysia";

export const ProductSchemaT = t.Object({
  id: t.String({ format: "uuid" }),
  name: t.String(),
  image: t.String(),
  stars: t.Number({ minimum: 0, maximum: 5 }),
  ratingCount: t.Integer({ minimum: 0 }),
  priceCents: t.Integer({ minimum: 0 }),
  keywords: t.Array(t.String()),
});
