import { test, expect } from '@playwright/test'

// TC-LAND: Landing page — links e navegação
test.describe('Landing Page', () => {
  test('TC-LAND-006: serve /landing.html sem autenticação', async ({ page }) => {
    const response = await page.goto('/landing.html')
    expect(response?.status()).toBe(200)
  })

  test('TC-LAND-007: raiz / redireciona para /landing.html', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/landing\.html/)
  })

  test('TC-LAND-001: sem links para index.html', async ({ page }) => {
    await page.goto('/landing.html')
    const links = await page.locator('a[href="index.html"]').count()
    expect(links).toBe(0)
  })

  test('TC-LAND-002: botão nav aponta para /auth/login', async ({ page }) => {
    await page.goto('/landing.html')
    const loginBtn = page.locator('a[href="/auth/login"]').first()
    await expect(loginBtn).toBeVisible()
  })

  test('TC-LAND-003: CTA principal aponta para /auth/signup', async ({ page }) => {
    await page.goto('/landing.html')
    const signupBtn = page.locator('a[href="/auth/signup"]').first()
    await expect(signupBtn).toBeVisible()
  })

  test('TC-LAND-004: footer links de produto corretos', async ({ page }) => {
    await page.goto('/landing.html')
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible()
    await expect(page.locator('a[href="/library"]')).toBeVisible()
    await expect(page.locator('a[href="/review"]')).toBeVisible()
    await expect(page.locator('a[href="/skills"]')).toBeVisible()
  })

  test('TC-LAND-005: não menciona "Arquivo HTML"', async ({ page }) => {
    await page.goto('/landing.html')
    const content = await page.content()
    expect(content).not.toContain('Arquivo HTML')
  })
})
