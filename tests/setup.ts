import { config } from "dotenv";
import { beforeAll, afterAll } from "vitest";

// Load environment variables for tests
config();

// Global test setup
beforeAll(async () => {
  // Any global setup can go here
});

afterAll(async () => {
  // Any global cleanup can go here
});
