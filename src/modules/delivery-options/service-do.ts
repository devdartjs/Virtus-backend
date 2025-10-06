import { prisma } from "../../database/database-prisma";
import { DeliveryOption } from "@prisma/client";

export class DeliveryOptionsService {
  static async getDeliveryOptions(): Promise<DeliveryOption[]> {
    const deliveryOptions = await prisma.deliveryOption.findMany();
    return deliveryOptions;
  }
}
