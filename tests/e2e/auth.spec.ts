import { test, expect } from '@playwright/test'

// TC-AUTH: Páginas de autenticação — estrutura e comportamento
// v1: login e cadastro via Magic Link apenas (senha comentada)

test.describe('Auth — Login', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('TC-AUTH-004: página de login carrega e exibe formulário Magic Link', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15000 })
    // v1: sem campo de senha (Magic Link only)
    await expect(page.locator('input[type="password"]')).not.toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  // COMENTADO — v2: reativar quando tabs de modo (senha/magic) forem reativadas
  // test('TC-AUTH-005: tab Magic Link oculta campo senha', async ({ page }) => {
  //   await page.goto('/auth/login')
  //   await page.waitForLoadState('networkidle')
  //   await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15000 })
  //   await page.getByText('Magic Link').click()
  //   await expect(page.locator('input[type="password"]')).not.toBeVisible()
  //   await expect(page.locator('input[type="email"]')).toBeVisible()
  // })

  test('TC-AUTH-005: formulário exibe apenas campo email', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('input[type="password"]')).not.toBeVisible()
  })

  // COMENTADO — v2: reativar quando login por senha for reativado
  // test('TC-AUTH-007: credenciais inválidas exibem mensagem de erro', async ({ page }) => {
  //   await page.goto('/auth/login')
  //   await page.waitForLoadState('networkidle')
  //   await page.fill('input[type="email"]', 'invalido@teste.com')
  //   await page.fill('input[type="password"]', 'senhaerrada')
  //   await page.click('button[type="submit"]')
  //   await expect(page.locator('text=Email ou senha incorretos')).toBeVisible({ timeout: 10000 })
  // })

  test('TC-AUTH-007: botão de magic link está presente e habilitado', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    const btn = page.locator('button[type="submit"]')
    await expect(btn).toBeVisible({ timeout: 15000 })
    await expect(btn).toBeEnabled()
    await expect(btn).toContainText(/Magic Link/i)
  })

  test('TC-AUTH-015: toggle de tema presente e funcional', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    const toggleBtn = page.locator('button').filter({ hasText: /Claro|Escuro/ })
    await expect(toggleBtn).toBeVisible({ timeout: 15000 })
    await toggleBtn.click()
    await expect(toggleBtn).toBeVisible()
  })

  test('TC-AUTH-001: rota protegida sem sessão redireciona para login', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 })
    await ctx.close()
  })
})

test.describe('Auth — Signup', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('TC-AUTH-009: página de cadastro exibe campos nome e email', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('input[type="text"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('input[type="email"]')).toBeVisible()
    // v1: sem campo de senha (Magic Link only)
    await expect(page.locator('input[type="password"]')).not.toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  // COMENTADO — v2: reativar quando campo de senha for reativado no cadastro
  // test('TC-AUTH-010: senha menor que 6 chars bloqueia submit', async ({ page }) => {
  //   await page.goto('/auth/signup')
  //   await page.waitForLoadState('networkidle')
  //   await page.fill('input[type="text"]', 'Teste')
  //   await page.fill('input[type="email"]', 'teste@teste.com')
  //   await page.fill('input[type="password"]', '123')
  //   await page.click('button[type="submit"]')
  //   await expect(page).toHaveURL(/\/auth\/signup/)
  // })

  test('TC-AUTH-010: nome em branco bloqueia envio do magic link', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('input[type="text"]')).toBeVisible({ timeout: 15000 })
    // Deixa nome vazio, preenche email e tenta submeter
    await page.fill('input[type="email"]', 'teste@teste.com')
    await page.click('button[type="submit"]')
    // Sem nome, o campo required impede o envio — permanece na página
    await expect(page).toHaveURL(/\/auth\/signup/)
  })
})
