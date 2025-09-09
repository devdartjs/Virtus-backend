export class ProductError extends Error {
  status = 400;
  code = "PRODUCT_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "ProductError";
  }

  toResponse() {
    return {
      message: this.message,
      code: this.code
    };
  }
}
