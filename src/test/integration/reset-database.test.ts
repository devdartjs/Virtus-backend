import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../../prisma/database-prisma";
import { resetRoute } from "../../modules/reset/controller-reset";

let app: any;

describe("Reset Route Integration", () => {
  beforeAll(() => {
    app = resetRoute;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("POST /api/v1/reset should reset and seed the database", async () => {
    const response = await app.handle(
      new Request("http://localhost:3004/api/v1/reset/", { method: "POST" })
    );
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty(
      "message",
      "Database reset and seeded successfully"
    );

    const products = await prisma.product.findMany();
    expect(products.length).toBeGreaterThan(0);

    const deliveryOptions = await prisma.deliveryOption.findMany();
    expect(deliveryOptions.length).toBeGreaterThan(0);
  });
});
