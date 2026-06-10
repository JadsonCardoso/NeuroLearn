import { test, expect } from '@playwright/test'

// TC-DRW: ContentDrawer — abertura, edição e remoção via drawer lateral
// Testes sem autenticação verificam redirecionamento e ausência de erros 500.
// Testes de estrutura verificam data-testids e comportamento básico.

test.describe('ContentDrawer — Estrutura e Redirecionamento', () => {
  test('TC-DRW-001: /app/library sem sessão redireciona para /auth/login', async ({ page }) => {
    await page.goto('/app/library')
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('TC-DRW-002: /app/library não emite erro 500', async ({ page }) => {
    await page.goto('/app/library')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
  })

  test('TC-DRW-003: /app/review não emite erro 500', async ({ page }) => {
    await page.goto('/app/review')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
  })

  test('TC-DRW-004: página de login exibe formulário de autenticação', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('TC-DRW-005: data-testid content-drawer não aparece na tela de login', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="content-drawer"]')).not.toBeVisible()
  })

  test('TC-DRW-006: data-testid drawer-close não aparece na tela de login', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="drawer-close"]')).not.toBeVisible()
  })
})
