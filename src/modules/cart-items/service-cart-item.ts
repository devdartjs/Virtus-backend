import { CartItem } from "@prisma/client";
import { prisma } from "../../../prisma/database-prisma";

export class CartItemsService {
  static async getCartItems(): Promise<CartItem[]> {
    const cartItems = await prisma.cartItem.findMany();
    return cartItems;
  }
}
