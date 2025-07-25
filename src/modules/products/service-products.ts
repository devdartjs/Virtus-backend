import { DeliveryOption } from "@prisma/client";
import { prisma } from "../../../prisma/database-prisma";
import { Product } from "./model-products";

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    const products = await prisma.product.findMany();
    return products;
  }
}
