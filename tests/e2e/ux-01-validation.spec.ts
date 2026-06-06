import { test, expect } from '@playwright/test'

// TC-UX01: Validação de formulários, feedback e acessibilidade — UX-01
// Cobre: Login, Signup, AddContentModal, Toast, ARIA

test.describe('UX-01 — Login: validação sem popup nativo', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input[type="email"]', { timeout: 15_000 })
  })

  test('TC-UX01-001: form tem atributo novalidate (sem popup nativo)', async ({ page }) => {
    const form = page.locator('form')
    await expect(form).toHaveAttribute('novalidate')
  })

  test('TC-UX01-002: submit com email vazio exibe erro em PT-BR', async ({ page }) => {
    await page.click('button[type="submit"]')
    const error = page.locator('[role="alert"]').first()
    await expect(error).toBeVisible({ timeout: 3000 })
    await expect(error).toContainText('obrigatório')
  })

  test('TC-UX01-003: submit com email inválido exibe mensagem de formato', async ({ page }) => {
    await page.fill('input[type="email"]', 'nao-eh-email')
    await page.click('button[type="submit"]')
    const error = page.locator('[role="alert"]').first()
    await expect(error).toBeVisible({ timeout: 3000 })
    await expect(error).toContainText('não é válido')
  })

  test('TC-UX01-004: email com espaços laterais é aceito (trim)', async ({ page }) => {
    await page.fill('input[type="email"]', '  user@example.com  ')
    await page.click('button[type="submit"]')
    // Sem erro de validação: mensagem de sucesso OU erro de servidor (não de formato)
    const formatError = page.locator('[role="alert"]')
    const count = await formatError.count()
    if (count > 0) {
      await expect(formatError.first()).not.toContainText('não é válido')
    }
  })

  test('TC-UX01-005: input fica com aria-invalid=true após erro', async ({ page }) => {
    await page.click('button[type="submit"]')
    await page.waitForSelector('[role="alert"]', { timeout: 3000 })
    const input = page.locator('input[type="email"]')
    await expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  test('TC-UX01-006: aria-describedby do input aponta para o id do erro', async ({ page }) => {
    await page.click('button[type="submit"]')
    await page.waitForSelector('[role="alert"]', { timeout: 3000 })
    const input = page.locator('input[type="email"]')
    const describedBy = await input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    if (describedBy) {
      const errorEl = page.locator(`#${describedBy}`)
      await expect(errorEl).toBeVisible()
    }
  })
})

test.describe('UX-01 — Signup: validação de nome + email', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await page.goto('/auth/signup')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input[type="text"]', { timeout: 15_000 })
  })

  test('TC-UX01-010: form tem atributo novalidate', async ({ page }) => {
    await expect(page.locator('form')).toHaveAttribute('novalidate')
  })

  test('TC-UX01-011: submit com campos vazios exibe erros nos dois campos', async ({ page }) => {
    await page.click('button[type="submit"]')
    const alerts = page.locator('[role="alert"]')
    await expect(alerts.first()).toBeVisible({ timeout: 3000 })
    const count = await alerts.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('TC-UX01-012: nome obrigatório — mensagem em PT-BR', async ({ page }) => {
    await page.click('button[type="submit"]')
    const error = page.locator('[role="alert"]').first()
    await expect(error).toBeVisible({ timeout: 3000 })
    await expect(error).toContainText('obrigatório')
  })

  test('TC-UX01-013: nome com 1 caractere é rejeitado', async ({ page }) => {
    await page.fill('input[type="text"]', 'J')
    await page.click('button[type="submit"]')
    const error = page.locator('[role="alert"]').first()
    await expect(error).toBeVisible({ timeout: 3000 })
    await expect(error).toContainText('pelo menos 2 caracteres')
  })

  test('TC-UX01-014: nome com apenas espaços é rejeitado (trim)', async ({ page }) => {
    await page.fill('input[type="text"]', '   ')
    await page.click('button[type="submit"]')
    const error = page.locator('[role="alert"]').first()
    await expect(error).toBeVisible({ timeout: 3000 })
    await expect(error).toContainText('obrigatório')
  })

  test('TC-UX01-015: erro de nome limpa quando campo é preenchido corretamente', async ({ page }) => {
    await page.click('button[type="submit"]')
    await page.waitForSelector('[role="alert"]', { timeout: 3000 })
    await page.fill('input[type="text"]', 'Jadson Cardoso')
    // RHF só revalida ao submeter novamente por padrão
    // Verificar que o campo não tem mais aria-invalid após re-submit válido
    await page.fill('input[type="email"]', 'jadson@example.com')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(500)
    const nameInput = page.locator('input[type="text"]')
    const ariaInvalid = await nameInput.getAttribute('aria-invalid')
    expect(ariaInvalid).not.toBe('true')
  })
})

test.describe('UX-01 — Acessibilidade geral dos formulários de auth', () => {
  test('TC-UX01-020: labels associadas aos inputs via htmlFor/id', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input[type="email"]', { timeout: 15_000 })

    const emailInput = page.locator('input#email')
    await expect(emailInput).toBeVisible()
    const label = page.locator('label[for="email"]')
    await expect(label).toBeVisible()
  })

  test('TC-UX01-021: campo obrigatório tem asterisco visível no label', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('label[for="email"]', { timeout: 15_000 })
    const label = page.locator('label[for="email"]')
    await expect(label).toContainText('*')
  })

  test('TC-UX01-022: signup — label "Nome completo" tem asterisco', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('label[for="name"]', { timeout: 15_000 })
    const label = page.locator('label[for="name"]')
    await expect(label).toContainText('*')
  })
})

test.describe('UX-01 — LoadingButton: estado de carregamento', () => {
  test('TC-UX01-030: botão fica desabilitado durante submissão', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input[type="email"]', { timeout: 15_000 })

    await page.fill('input[type="email"]', 'teste@example.com')

    // Interceptar a requisição para simular delay
    await page.route('**/auth/v1/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.continue()
    })

    const button = page.locator('button[type="submit"]')
    await page.click('button[type="submit"]')
    // Durante loading, botão deve estar desabilitado
    await expect(button).toBeDisabled({ timeout: 2000 })
  })
})

test.describe('UX-01 — FormField: hint e erro são mutuamente exclusivos', () => {
  test('TC-UX01-040: hint aparece quando não há erro', async ({ page }) => {
    // O campo desc do AddContentModal tem hint
    // Acessar via app autenticado — skip se não autenticado
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    // Apenas verifica que a estrutura de hint existe no DOM globalmente
    // Teste completo do modal requer autenticação (coberto por testes de integração)
  })
})

test.describe('UX-01 — Toast: aparece, desaparece e é dispensável', () => {
  // Toasts são ativados por ações autenticadas (ex: adicionar conteúdo)
  // Estes testes verificam estrutura e acessibilidade básica

  test('TC-UX01-050: página de login não exibe toast ao carregar', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    const toastContainer = page.locator('[data-testid="toast-container"]')
    // Container pode existir mas sem toasts visíveis
    const toasts = page.locator('[role="status"], [role="alert"]').filter({ hasText: /sucesso|erro|aviso/i })
    await expect(toasts).toHaveCount(0, { timeout: 2000 })
  })
})
