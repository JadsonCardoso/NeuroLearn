import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // globals: true expõe expect/describe/it globalmente (necessário para @testing-library/jest-dom)
    globals: true,

    // Ambiente padrão node; arquivos que precisam de DOM declaram: // @vitest-environment jsdom
    environment: 'node',

    // Setup global: matchers do Testing Library (@testing-library/jest-dom)
    setupFiles: ['src/test/setup.ts'],

    include: [
      'src/engine/**/*.test.ts',
      'src/lib/security/**/*.test.ts',
      'src/lib/ai/**/*.test.ts',
      'src/lib/validation/**/*.test.ts',
      'src/services/**/*.test.ts',
      'src/store/**/*.test.{ts,tsx}',
      'src/hooks/**/*.test.{ts,tsx}',
      'src/components/**/*.test.{ts,tsx}',
      'src/modules/**/*.test.{ts,tsx}',
    ],

    coverage: {
      provider: 'v8',
      include: [
        'src/engine/**/*.ts',
        'src/lib/security/**/*.ts',
        'src/lib/ai/**/*.ts',
        'src/lib/validation/**/*.ts',
        'src/services/**/*.ts',
        'src/store/**/*.{ts,tsx}',
        'src/hooks/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.test.{ts,tsx}', 'src/test/**'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
