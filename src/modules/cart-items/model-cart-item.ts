import { z } from "zod";

export const CartItemsSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  quantity: z.number().int().nonnegative(),
  deliveryOptionId: z.string(),
});

export type CartItem = z.infer<typeof CartItemsSchema>;
