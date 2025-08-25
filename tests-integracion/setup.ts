import { afterAll, beforeAll } from "vitest";

// Import test configuration first to load .env.test
import "../config.test";

import { cleanupTestDatabase } from "../server/db.test";

// Global test setup
beforeAll(async () => {
  await cleanupTestDatabase();
});

afterAll(async () => {
  console.log("Integration tests completed");
  await cleanupTestDatabase();
});
