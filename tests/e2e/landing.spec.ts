import { test, expect } from '@playwright/test'

test.describe('Landing Page — LANDING-01', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })

  // --- Renderização e estrutura ---

  test('TC-LAND-010: raiz / renderiza landing page (sem sessão)', async ({ page }) => {
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toBeVisible()
    const h1 = await page.locator('h1').textContent()
    expect(h1).toContain('Aprenda')
  })

  test('TC-LAND-011: navbar visível com link Entrar', async ({ page }) => {
    const navbar = page.locator('nav[aria-label="Navegação principal"]')
    await expect(navbar).toBeVisible()
    const entrarLink = navbar.locator('a[href="/auth/login"]')
    await expect(entrarLink).toBeVisible()
  })

  test('TC-LAND-012: título SEO correto', async ({ page }) => {
    await expect(page).toHaveTitle(/NeuroLearn/)
  })

  test('TC-LAND-013: seção #como-funciona existe', async ({ page }) => {
    const section = page.locator('#como-funciona')
    await expect(section).toBeVisible()
  })

  test('TC-LAND-014: seção #waitlist existe', async ({ page }) => {
    const section = page.locator('#waitlist')
    await expect(section).toBeVisible()
  })

  test('TC-LAND-015: footer com copyright visível', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible()
    const footer = await page.locator('footer').textContent()
    expect(footer).toContain('NeuroLearn')
  })

  // --- CTA Hero ---

  test('TC-LAND-016: botão "Entrar para o Beta" aponta para #waitlist', async ({ page }) => {
    const cta = page.locator('a[href="#waitlist"]').first()
    await expect(cta).toBeVisible()
  })

  // --- Formulário de Waitlist ---

  test('TC-LAND-020: formulário waitlist exibe erros com campos vazios', async ({ page }) => {
    await page.locator('#waitlist').scrollIntoViewIfNeeded()
    const submitBtn = page.locator('#waitlist button[type="submit"]')
    await submitBtn.click()
    const errors = page.locator('#waitlist p[style*="color: rgb(239, 68, 68)"]')
    await expect(errors.first()).toBeVisible()
  })

  test('TC-LAND-021: formulário waitlist exibe erro de email inválido', async ({ page }) => {
    await page.locator('#waitlist').scrollIntoViewIfNeeded()
    await page.locator('#waitlist input[name="name"]').fill('João')
    await page.locator('#waitlist input[name="email"]').fill('nao-e-email')
    await page.locator('#waitlist button[type="submit"]').click()
    const error = page.locator('#waitlist p[style*="color: rgb(239, 68, 68)"]')
    await expect(error.first()).toBeVisible()
  })

  test('TC-LAND-022: formulário waitlist não usa validação nativa do browser', async ({ page }) => {
    await page.locator('#waitlist').scrollIntoViewIfNeeded()
    const form = page.locator('#waitlist form')
    const noValidate = await form.getAttribute('novalidate')
    expect(noValidate).not.toBeNull()
  })

  // --- Testes legados (sem regressão) ---

  test('TC-LAND-006: /landing.html retorna 404', async ({ page }) => {
    const response = await page.goto('/landing.html')
    expect(response?.status()).toBe(404)
  })

  test('TC-LAND-001: página de login não tem link para index.html', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('domcontentloaded')
    const links = await page.locator('a[href="index.html"]').count()
    expect(links).toBe(0)
  })

  test('TC-LAND-002: página de login tem link para /auth/signup', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('a[href="/auth/signup"]').first()).toBeVisible()
  })

  test('TC-LAND-003: signup tem link para /auth/login', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('a[href="/auth/login"]').first()).toBeVisible()
  })
})
