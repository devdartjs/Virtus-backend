import { CartItem } from "@prisma/client";
import { prisma } from "../../../prisma/database-prisma";

export class CartItemsService {
  static async getCartItems(): Promise<CartItem[]> {
    return await prisma.cartItem.findMany();
  }

  static async createCartItem(data: {
    productId: string;
    quantity: number;
    deliveryOptionId: string;
  }) {
    return await prisma.cartItem.create({
      data: {
        product: { connect: { id: data.productId } },
        deliveryOption: { connect: { id: data.deliveryOptionId } },
        quantity: data.quantity,
      },
      select: {
        id: true,
        productId: true,
        quantity: true,
        deliveryOptionId: true,
      },
    });
  }

  static async deleteCartItem(id: string) {
    return await prisma.cartItem.delete({ where: { id } });
  }

  static async updateCartItem(
    id: string,
    data: { quantity?: number; deliveryOptionId?: string }
  ) {
    return await prisma.cartItem.update({
      where: { id },
      data: {
        ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
        ...(data.deliveryOptionId !== undefined
          ? { deliveryOption: { connect: { id: data.deliveryOptionId } } }
          : {}),
      },
      select: {
        id: true,
        productId: true,
        quantity: true,
        deliveryOptionId: true,
      },
    });
  }

  static async findCartItem(id: string) {
    return await prisma.cartItem.findUnique({ where: { id } });
  }
}
