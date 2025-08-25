import { beforeAll, afterAll, afterEach } from "vitest";

// Import test configuration first to load .env.test
import "../config.test";

import { setupTestDatabase, cleanupTestDatabase } from "../server/db.test";
import logger from "../server/logger";

// Global test setup
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  console.log("Integration tests completed");
  await cleanupTestDatabase();
});

afterEach(async () => {
  await cleanupTestDatabase();
  await setupTestDatabase();
});

// mocks: https://vitest.dev/guide/mocking.html
// vi.spyOn(db, "query").mockImplementation(mockQuery)
// Lo que hace es:
// crea un "espia" que intercepta las llamadas al método query del mi db
// .mockImplementation(mockQuery) => reemplaza la implementación real del método query con mi función mock
// => cada vez que el código llame db.query(), en lugar de ejecutar la consulta real a la base de datos, ejecuta mi función mockQuery.
