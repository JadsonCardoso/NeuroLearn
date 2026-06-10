import { test, expect } from '@playwright/test'

// TC-REV-CTX: Revisão contextual — ContextSelector, aba Exercícios, Meu Material contextual
// Testes sem autenticação verificam redirecionamento e ausência de erros 500.

test.describe('ReviewView Contextual — Redirecionamento e Estrutura', () => {
  test('TC-REV-CTX-001: /app/review sem sessão redireciona para /auth/login', async ({ page }) => {
    await page.goto('/app/review')
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('TC-REV-CTX-002: /app/review não emite erro 500', async ({ page }) => {
    await page.goto('/app/review')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
  })

  test('TC-REV-CTX-003: data-testid context-selector não aparece sem autenticação', async ({
    page,
  }) => {
    await page.goto('/app/review')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="context-selector"]')).not.toBeVisible()
  })

  test('TC-REV-CTX-004: data-testid tab-practice não aparece sem autenticação', async ({
    page,
  }) => {
    await page.goto('/app/review')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="tab-practice"]')).not.toBeVisible()
  })

  test('TC-REV-CTX-005: data-testid tab-knowledge não aparece sem autenticação', async ({
    page,
  }) => {
    await page.goto('/app/review')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="tab-knowledge"]')).not.toBeVisible()
  })
})
