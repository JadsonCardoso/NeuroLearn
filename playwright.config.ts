import { defineConfig, devices } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

// Playwright não carrega .env.local automaticamente (diferente do Next.js).
// Leitura manual necessária para global.setup.ts ter acesso às variáveis de ambiente.
const envLocalPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf-8').split(/\r?\n/)
  for (const line of lines) {
    const match = line.match(/^([^#=\s][^=]*?)=(.+)$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim()
    }
  }
}

const AUTH_FILE = 'tests/e2e/.auth/user.json'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'tests/reports/playwright' }], ['list']],

  // globalSetup roda UMA vez antes de todos os testes, no mesmo processo que o config.
  // O arquivo exporta uma função default — padrão correto para globalSetup.
  globalSetup: './tests/e2e/global.setup.ts',

  use: {
    baseURL: 'http://localhost:3003',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Testes sem autenticação (landing, auth forms, UX validação)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [
        '**/library.spec.ts',
        '**/trails.spec.ts',
        '**/review.spec.ts',
        '**/accessibility.spec.ts',
        '**/crud-01.spec.ts',
        '**/sprint1.spec.ts',
        '**/sprint2.spec.ts',
        '**/sprint3.spec.ts',
        '**/sprint4.spec.ts',
        '**/capture-screenshots.spec.ts',
        '**/profile.spec.ts',
        '**/ai-validation.spec.ts',
      ],
    },

    // Testes autenticados (library, review, accessibility, crud-01) — requerem user.json gerado pelo globalSetup
    {
      name: 'authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
      testMatch: [
        '**/library.spec.ts',
        '**/trails.spec.ts',
        '**/review.spec.ts',
        '**/accessibility.spec.ts',
        '**/crud-01.spec.ts',
        '**/sprint1.spec.ts',
        '**/sprint2.spec.ts',
        '**/sprint3.spec.ts',
        '**/sprint4.spec.ts',
        '**/capture-screenshots.spec.ts',
        '**/profile.spec.ts',
        '**/ai-validation.spec.ts',
      ],
    },
  ],

  webServer: {
    command: 'npm run dev:clean',
    url: 'http://localhost:3003',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
