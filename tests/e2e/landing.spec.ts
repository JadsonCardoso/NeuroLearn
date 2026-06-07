import { test, expect } from '@playwright/test'

// TC-LAND: Roteamento da raiz e remoção do landing.html estático
test.describe('Landing Page', () => {
  test('TC-LAND-007: raiz / redireciona para /auth/login (sem sessão)', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('TC-LAND-006: /landing.html retorna 404 (arquivo removido)', async ({ page }) => {
    const response = await page.goto('/landing.html')
    expect(response?.status()).toBe(404)
  })

  test('TC-LAND-001: sem links para index.html na página de login', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('domcontentloaded')
    const links = await page.locator('a[href="index.html"]').count()
    expect(links).toBe(0)
  })

  test('TC-LAND-002: página de login tem link para /auth/signup', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('domcontentloaded')
    const signupLink = page.locator('a[href="/auth/signup"]').first()
    await expect(signupLink).toBeVisible()
  })

  test('TC-LAND-003: signup tem link para /auth/login', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.waitForLoadState('domcontentloaded')
    const loginLink = page.locator('a[href="/auth/login"]').first()
    await expect(loginLink).toBeVisible()
  })

  test('TC-LAND-005: não menciona "Arquivo HTML" na página de login', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('domcontentloaded')
    const content = await page.content()
    expect(content).not.toContain('Arquivo HTML')
    expect(content).not.toContain('landing.html')
  })
})
