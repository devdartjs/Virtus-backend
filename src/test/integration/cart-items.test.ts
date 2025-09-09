/* eslint no-console: ["error", { "allow": ["log", "error"] }] */
import { describe, test, expect, vi, afterEach, Mock } from "vitest";

vi.mock("../../modules/cart-items/service-cart-item");
vi.mock("../../modules/products/service-products");

import { cartItemsRoute } from "../../modules/cart-items/controller-cart-item";
import { CartItemsService } from "../../modules/cart-items/service-cart-item";
import { ProductService } from "../../modules/products/service-products";

const BASE_URL = "http://localhost:3004/api/v1/cart-items";
const mockCartId = "550e8400-e29b-41d4-a716-446655440000";
const mockProductId = "550e8400-e29b-41d4-a716-446655440001";

describe("CartItems Integration Tests", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("DELETE /cart-items/:id should delete a cart item (200)", async () => {
    const mockDeleteItem = {
      id: mockCartId,
      productId: mockProductId,
      quantity: 3,
      deliveryOptionId: "del-1",
    };

    (CartItemsService.deleteCartItem as Mock).mockResolvedValue(mockDeleteItem);

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}/${mockCartId}`, { method: "DELETE" })
    );

    expect(response.status).toBe(200);

    const text = await response.text();
    expect(text).toBe("");

    expect(CartItemsService.deleteCartItem).toHaveBeenCalledWith(mockCartId);
  });

  test("DELETE /cart-items/:id should return 404 if item not found", async () => {
    (CartItemsService.deleteCartItem as Mock).mockRejectedValue(
      new Error("Cart item not found")
    );

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}/${mockCartId}`, { method: "DELETE" })
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ message: "Cart item not found" });
  });

  test("DELETE /cart-items/:id should return 404 if item not found", async () => {
    (CartItemsService.deleteCartItem as Mock).mockRejectedValue(
      new Error("Cart item not found")
    );

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}/${mockCartId}`, { method: "DELETE" })
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty("message", "Cart item not found");
  });

  test("GET /cart-items should return a list of cart items", async () => {
    const mockItems = [
      {
        id: mockCartId,
        productId: mockProductId,
        quantity: 2,
        deliveryOptionId: "del-1",
      },
    ];

    (CartItemsService.getCartItems as Mock).mockResolvedValue(mockItems);

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}`, { method: "GET" })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(mockItems);
    expect(CartItemsService.getCartItems).toHaveBeenCalled();
  });

  test("GET /cart-items?expand=product should return items with product info", async () => {
    const mockItems = [
      {
        id: mockCartId,
        productId: mockProductId,
        quantity: 2,
        deliveryOptionId: "del-1",
      },
    ];

    const mockProducts = [
      {
        id: mockProductId,
        name: "Product 1",
        image: "images/products/product1.jpg",
        stars: 4.5,
        ratingCount: 87,
        priceCents: 1090,
        keywords: ["sample", "mock"],
      },
    ];

    (CartItemsService.getCartItems as Mock).mockResolvedValue(mockItems);
    (ProductService.getAllProducts as Mock).mockResolvedValue(mockProducts);

    const request = new Request(`${BASE_URL}?expand=product`, {
      method: "GET",
    });
    const response = await cartItemsRoute.handle(request);

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body[0]).toHaveProperty("product");
    expect(body[0].product).toEqual(mockProducts[0]);
  });

  test("GET /cart-items should return 500 on service failure", async () => {
    (CartItemsService.getCartItems as Mock).mockRejectedValue(
      new Error("DB error")
    );

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}`, { method: "GET" })
    );

    expect(response.status).toBe(500);
    const body = await response.text();
    expect(body).toContain("Failed to fetch cart items");
  });

  test("POST /cart-items should create a new cart item", async () => {
    const mockProduct = { id: mockProductId, name: "Product 1" };
    const mockCreatedItem = {
      id: mockCartId,
      productId: mockProductId,
      quantity: 3,
      deliveryOptionId: "1",
    };

    (ProductService.getProductById as Mock).mockResolvedValue(mockProduct);
    (CartItemsService.findByProductId as Mock).mockResolvedValue(null);
    (CartItemsService.createCartItem as Mock).mockResolvedValue(
      mockCreatedItem
    );

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: mockProductId, quantity: 3 }),
      })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toEqual(mockCreatedItem);
    expect(CartItemsService.createCartItem).toHaveBeenCalledWith({
      productId: mockProductId,
      quantity: 3,
      deliveryOptionId: "1",
    });
  });

  test("POST /cart-items should fail if quantity < 1", async () => {
    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: mockProductId, quantity: 0 }),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.text();
    expect(body).toContain("Quantity must be between 1 and 10");
  });

  test("POST /cart-items should fail if quantity > 10", async () => {
    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: mockProductId, quantity: 11 }),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.text();
    expect(body).toContain("Quantity must be between 1 and 10");
  });

  test("POST /cart-items should return 404 if product not found", async () => {
    (ProductService.getProductById as Mock).mockResolvedValue(null);

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: mockProductId, quantity: 2 }),
      })
    );

    expect(response.status).toBe(404);
    const body = await response.text();
    expect(body).toContain("Product not found");
  });

  test("POST /cart-items should update quantity if item already exists", async () => {
    const existingItem = {
      id: mockCartId,
      productId: mockProductId,
      quantity: 9,
      deliveryOptionId: "1",
    };
    const updatedItem = { ...existingItem, quantity: 10 };

    (ProductService.getProductById as Mock).mockResolvedValue({
      id: mockProductId,
      name: "P1",
    });
    (CartItemsService.findByProductId as Mock).mockResolvedValue(existingItem);
    (CartItemsService.updateCartItem as Mock).mockResolvedValue(updatedItem);

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: mockProductId, quantity: 5 }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.quantity).toBe(10);
    expect(CartItemsService.updateCartItem).toHaveBeenCalledWith(mockCartId, {
      quantity: 10,
    });
  });

  test("PUT /cart-items/:id should update a cart item", async () => {
    const mockUpdatedItem = {
      id: mockCartId,
      productId: mockProductId,
      quantity: 5,
      deliveryOptionId: "del-1",
    };

    (CartItemsService.updateCartItem as Mock).mockResolvedValue(
      mockUpdatedItem
    );

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}/${mockCartId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 5 }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(mockUpdatedItem);
    expect(CartItemsService.updateCartItem).toHaveBeenCalledWith(mockCartId, {
      quantity: 5,
    });
  });

  test("PUT /cart-items/:id should fail with 400 if no fields provided", async () => {
    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}/${mockCartId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.text();
    expect(body).toContain("At least one field must be provided to update.");
  });

  test("PUT /cart-items/:id should return 404 for P2025 error", async () => {
    (CartItemsService.updateCartItem as Mock).mockRejectedValue({
      code: "P2025",
    });

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}/${mockCartId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 5 }),
      })
    );

    expect(response.status).toBe(404);
    const body = await response.text();
    expect(body).toContain("Cart item not found");
  });

  test("PUT /cart-items/:id should return 400 for P2003 deliveryOptionId error", async () => {
    (CartItemsService.updateCartItem as Mock).mockRejectedValue({
      code: "P2003",
      meta: { field_name: "deliveryOptionId" },
    });

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}/${mockCartId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryOptionId: "invalid-id" }),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.text();
    expect(body).toContain("Delivery option not found");
  });

  test("PUT /cart-items/:id should return 400 for P2003 generic foreign key error", async () => {
    (CartItemsService.updateCartItem as Mock).mockRejectedValue({
      code: "P2003",
      meta: { field_name: "productId" },
    });

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}/${mockCartId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryOptionId: "invalid-ref" }),
      })
    );

    expect(response.status).toBe(400);
    const body = await response.text();
    expect(body).toContain("Invalid reference");
  });

  test("PUT /cart-items/:id should return 500 on unexpected error", async () => {
    (CartItemsService.updateCartItem as Mock).mockRejectedValue(
      new Error("DB crash")
    );

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}/${mockCartId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 2 }),
      })
    );

    expect(response.status).toBe(500);
    const body = await response.text();
    expect(body).toContain("Unexpected error updating cart item");
  });
});
