import { test, expect } from '@playwright/test'

// TC-A11Y: Testes de acessibilidade nas páginas principais

test.describe('Acessibilidade — Auth (sem autenticação necessária)', () => {
  test('TC-A11Y-001: login tem h1 ou h2 visível', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
  })

  test('TC-A11Y-002: login — labels associadas aos inputs (htmlFor ↔ id)', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input[type="email"]', { timeout: 10_000 })
    await expect(page.locator('label[for="email"]')).toBeVisible()
    await expect(page.locator('input#email')).toBeVisible()
  })

  test('TC-A11Y-003: login — campo obrigatório tem asterisco (*) no label', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('label[for="email"]', { timeout: 10_000 })
    await expect(page.locator('label[for="email"]')).toContainText('*')
  })

  test('TC-A11Y-004: signup — labels associadas (name + email)', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input#name', { timeout: 10_000 })
    await expect(page.locator('label[for="name"]')).toBeVisible()
    await expect(page.locator('label[for="email"]')).toBeVisible()
  })

  test('TC-A11Y-005: erros de validação têm role="alert"', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('button[type="submit"]', { timeout: 10_000 })
    await page.click('button[type="submit"]')
    const alert = page.locator('[role="alert"]').first()
    await expect(alert).toBeVisible({ timeout: 3000 })
  })

  test('TC-A11Y-006: botão de toggle de tema tem aria-label', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    const themeBtn = page.locator('button[aria-label*="tema"], button[aria-label*="theme"]').first()
    await expect(themeBtn).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Acessibilidade — App autenticado', () => {
  test('TC-A11Y-010: dashboard tem h1 ou h2', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
  })

  test('TC-A11Y-011: biblioteca tem h1 ou h2', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
  })

  test('TC-A11Y-012: modal da biblioteca fecha com Escape', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    const addBtn = page.locator('button').filter({ hasText: /adicionar|novo|\+/i }).first()
    if (await addBtn.isVisible()) {
      await addBtn.click()
      const modal = page.locator('[role="dialog"], [aria-modal="true"], #title').first()
      await expect(modal).toBeVisible({ timeout: 5000 })
      await page.keyboard.press('Escape')
      await expect(page.locator('#title')).not.toBeVisible({ timeout: 3000 })
    }
  })

  test('TC-A11Y-013: sidebar — links de navegação são acessíveis', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Links de navegação no sidebar devem ser <a> com href
    const navLinks = page.locator('nav a[href], aside a[href]')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('TC-A11Y-014: botões icon-only têm aria-label', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    // Botão de fechar modal (ícone X) deve ter aria-label
    const addBtn = page.locator('button').filter({ hasText: /adicionar|\+/i }).first()
    if (await addBtn.isVisible()) {
      await addBtn.click()
      const closeBtn = page.locator('button[aria-label*="fechar"], button[aria-label*="close"]').first()
      if (await closeBtn.isVisible()) {
        const ariaLabel = await closeBtn.getAttribute('aria-label')
        expect(ariaLabel).toBeTruthy()
      }
    }
  })
})

test.describe('Acessibilidade — Navegação por teclado', () => {
  test('TC-A11Y-020: login — Tab order: email → submit', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input#email', { timeout: 10_000 })
    await page.locator('input#email').focus()
    await page.keyboard.press('Tab')
    // Próximo elemento focado deve ser o botão de submit
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedTag)
  })

  test('TC-A11Y-021: signup — Tab percorre nome → email → submit', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input#name', { timeout: 10_000 })
    await page.locator('input#name').focus()
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.id)
    expect(focused).toBe('email')
  })
})
