import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    // Each test file gets its own in-memory MongoDB; running files one at a time keeps start-up light.
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 120000,
  },
});
