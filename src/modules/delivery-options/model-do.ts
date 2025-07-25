import { z } from "zod";

export const DeliveryOptionsSchema = z.object({
  id: z.string(),
  deliveryDays: z.int().nonnegative(),
  priceCents: z.int().nonnegative(),
});

export type DeliveryOption = z.infer<typeof DeliveryOptionsSchema>;
