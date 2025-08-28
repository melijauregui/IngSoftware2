import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests-mocked/setup.ts'],
    include: ['tests-mocked/**/*.ts'],
    exclude: ['tests-mocked/setup.ts'],
    env: {
      NODE_ENV: 'test',
    },
  },
});
