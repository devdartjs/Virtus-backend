import { Elysia, t } from "elysia";
import { record } from "@elysiajs/opentelemetry";
import { DeliveryOptionsService } from "./service-do";
import { DeliveryOptionsSchemaT } from "./schema-do";

export const deliveryOptionsRoute = new Elysia({ prefix: "/api/v1" }).get(
  "/delivery-options",
  async ({ set }) => {
    return record("db.listDeliveryOptions", async () => {
      try {
        const deliveryOptions =
          await DeliveryOptionsService.getDeliveryOptions();
        if (deliveryOptions.length === 0) {
          set.status = 400;
          throw new Error("No Delivery Options Available");
        }
        return deliveryOptions || [];
      } catch (err) {
        set.status = 500;
        throw err;
      }
    });
  },
  {
    response: t.Array(DeliveryOptionsSchemaT),
  }
);
