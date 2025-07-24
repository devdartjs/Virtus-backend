import { Elysia } from "elysia";
import { prisma } from "../database/prisma";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .get("/products", async () => {
    const products = await prisma.product.findMany();
    return products;
  })
  .listen(process.env.PORT || 5000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
