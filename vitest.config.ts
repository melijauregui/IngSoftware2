import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.ts", "tests-integracion/**/*.ts"],
    exclude: ["tests/setup.ts", "tests-integracion/setup.ts"],
    env: {
      NODE_ENV: "test",
    },
  },
});
