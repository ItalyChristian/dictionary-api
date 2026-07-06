import { defineConfig } from 'vitest/config';
import path from 'node:path';

const root = process.cwd();

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(root, 'src/core'),
      '@infrastructure': path.resolve(root, 'src/infrastructure'),
      '@adapters': path.resolve(root, 'src/adapters'),
      '@shared': path.resolve(root, 'src/shared')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/adapters/server.ts',
        'src/infrastructure/config/**',
        'src/**/types/**',
        'src/**/interfaces/**'
      ]
    }
  }
});
