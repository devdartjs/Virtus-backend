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

  test("DELETE /cart-items/:id should delete a cart item", async () => {
    const mockDeleteItem = {
      id: mockCartId,
      productId: mockProductId,
      quantity: 3,
      deliveryOptionId: "del-1",
    };
    (CartItemsService.deleteCartItem as Mock).mockResolvedValue({
      mockDeleteItem,
    });

    const response = await cartItemsRoute.handle(
      new Request(`${BASE_URL}/${mockCartId}`, { method: "DELETE" })
    );

    if (response.status === 500) {
      console.error("response 500 body:", await response.text());
    }

    expect(response.status).toBe(204);
    expect(CartItemsService.deleteCartItem).toHaveBeenCalledWith(mockCartId);
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
});
