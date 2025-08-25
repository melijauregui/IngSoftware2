import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests-integracion/**/*.ts"],
    exclude: [
      "tests-integracion/setup.ts",
      "tests-integracion/tests-functions.ts",
    ],
    env: {
      NODE_ENV: "test",
    },
    // Configuración para ejecutar tests secuencialmente
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Configuración específica para tests de integración
    testTimeout: 15000,
    hookTimeout: 10000,
    // Ejecutar tests secuencialmente
    sequence: {
      concurrent: false,
    },
    // Optimizaciones para velocidad
    silent: false,
    reporters: ["verbose"],
  },
});
