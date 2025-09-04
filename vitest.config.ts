import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    environment: "node",

    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      all: true,
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "node_modules/**"],
    },
  },
});
