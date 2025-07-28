import { Elysia, t } from "elysia";
import { record } from "@elysiajs/opentelemetry";
import { DeliveryOptionsService } from "./service-do";
import { DeliveryOptionsSchemaT } from "./schema-do";

export const deliveryOptionsRoute = new Elysia({
  prefix: "/api/v1/delivery-options",
}).get(
  "/",
  async ({ set, query }) => {
    return record("db.listDeliveryOptions", async () => {
      try {
        const deliveryOptions =
          await DeliveryOptionsService.getDeliveryOptions();
        if (deliveryOptions.length === 0) {
          set.status = 400;
          throw new Error("No Delivery Options Available");
        }

        if (query.expand === "estimatedDeliveryTime") {
          const now = Date.now();
          return deliveryOptions.map((option: any) => ({
            ...option,
            estimatedDeliveryTimeMs:
              now + (option.deliveryDays ?? 0) * 24 * 60 * 60 * 1000,
          }));
        }

        return deliveryOptions || [];
      } catch (err) {
        set.status = 500;
        throw err;
      }
    });
  },
  {
    query: t.Object({
      expand: t.Optional(t.String()),
    }),
    response: t.Array(
      t.Intersect([
        DeliveryOptionsSchemaT,
        t.Object({
          estimatedDeliveryTimeMs: t.Optional(t.Number()),
        }),
      ])
    ),
  }
);
