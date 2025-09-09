import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  image: z.string(),
  stars: z.number().min(0).max(5),
  ratingCount: z.number().int().nonnegative(),
  priceCents: z.number().int().nonnegative(),
  keywords: z.array(z.string())
});

export type Product = z.infer<typeof ProductSchema>;
