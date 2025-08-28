import { config } from 'dotenv';
import { beforeAll, afterAll } from 'vitest';

// Load environment variables for tests
config();

// Global test setup
beforeAll(async () => {
  // Any global setup can go here
});

afterAll(async () => {
  // Any global cleanup can go here
});

// mocks: https://vitest.dev/guide/mocking.html
// vi.spyOn(db, "query").mockImplementation(mockQuery)
// Lo que hace es:
// crea un "espia" que intercepta las llamadas al método query del mi db
// .mockImplementation(mockQuery) => reemplaza la implementación real del método query con mi función mock
// => cada vez que el código llame db.query(), en lugar de ejecutar la consulta real a la base de datos, ejecuta mi función mockQuery.
