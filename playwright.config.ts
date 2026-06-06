import { defineConfig, devices } from '@playwright/test'

const AUTH_FILE = 'tests/e2e/.auth/user.json'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'tests/reports/playwright' }], ['list']],

  use: {
    baseURL: 'http://localhost:3003',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Setup: autentica e salva sessão (roda antes dos outros projetos)
    {
      name: 'setup',
      testMatch: '**/global.setup.ts',
    },

    // Testes sem autenticação (landing, auth forms, UX validação)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/library.spec.ts', '**/review.spec.ts', '**/accessibility.spec.ts'],
    },

    // Testes autenticados (library, review, accessibility)
    {
      name: 'authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
      dependencies: ['setup'],
      testMatch: ['**/library.spec.ts', '**/review.spec.ts', '**/accessibility.spec.ts'],
    },
  ],

  webServer: {
    command: 'npm run dev:clean',
    url: 'http://localhost:3003',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
