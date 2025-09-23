import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      all: true,
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "node_modules/**",
        "src/**/*.d.ts",
        "src/generated/**",
        "src/generated/prisma/**",
        "src/instrumentation.ts",
        "src/loadEnv.ts",
        "src/server.ts"
      ],
      reportsDirectory: "./coverage",
      reportOnFailure: true
    }
  }
});
