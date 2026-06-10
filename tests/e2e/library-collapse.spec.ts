import { test, expect } from '@playwright/test'

// TC-COL: Collapse/expand de trilhas — persistência em localStorage
// Testes sem autenticação verificam redirecionamento e ausência de erros 500.

test.describe('Trail Collapse — Redirecionamento e Estrutura', () => {
  test('TC-COL-001: /app/library sem sessão redireciona para login', async ({ page }) => {
    await page.goto('/app/library')
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
  })

  test('TC-COL-002: /app/library não emite erro 500', async ({ page }) => {
    await page.goto('/app/library')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
  })

  test('TC-COL-003: data-testid trail-section não aparece sem autenticação', async ({ page }) => {
    await page.goto('/app/library')
    await page.waitForLoadState('domcontentloaded')
    // Redireciona para login antes de renderizar conteúdo autenticado
    await expect(page.locator('[data-testid="trail-section"]')).not.toBeVisible()
  })
})
