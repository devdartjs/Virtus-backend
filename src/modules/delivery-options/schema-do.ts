import { t } from "elysia";

export const DeliveryOptionsSchemaT = t.Object({
  id: t.String(),
  deliveryDays: t.Integer(),
  priceCents: t.Integer(),
});
