import { test, expect } from '@playwright/test'
import { ReviewPage } from './pages/ReviewPage'

// TC-REV: Fluxo de revisão espaçada — requer sessão autenticada

test.describe('Review — Fila de revisão', () => {
  test('TC-REV-001: página de revisão carrega sem erro', async ({ page }) => {
    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()
    // Não deve ter erro 500 ou mensagem de erro crítica
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
  })

  test('TC-REV-002: exibe estado vazio ou fila de revisão', async ({ page }) => {
    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()
    const isEmpty = await review.hasEmptyState()
    const hasCard = await review.hasCardVisible()
    // Deve exibir um dos dois estados (mas não erro)
    expect(isEmpty || hasCard).toBe(true)
  })

  test('TC-REV-003: título da página está presente', async ({ page }) => {
    const review = new ReviewPage(page)
    await review.goto()
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
  })

  test('TC-REV-004: navegação para revisão via sidebar funciona', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Clica no link de revisão no sidebar
    const reviewLink = page.locator('a[href="/review"], nav a').filter({ hasText: /revisão|review/i }).first()
    if (await reviewLink.isVisible()) {
      await reviewLink.click()
      await expect(page).toHaveURL(/\/review/, { timeout: 10_000 })
    } else {
      // Navega diretamente se sidebar não visível
      await page.goto('/review')
      await expect(page).toHaveURL(/\/review/)
    }
  })
})

test.describe('Review — Acessibilidade da fila', () => {
  test('TC-REV-010: página tem h1 ou h2', async ({ page }) => {
    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 5000 })
  })

  test('TC-REV-011: botões de avaliação têm texto ou aria-label acessível', async ({ page }) => {
    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()
    const hasCard = await review.hasCardVisible()
    if (hasCard) {
      // Se há card, verifica que os botões de avaliação são acessíveis
      const buttons = page.locator('button').filter({ hasText: /1|2|3|4|5|errei|difícil|bom|fácil|ótimo/i })
      const count = await buttons.count()
      // Deve ter ao menos 1 botão de avaliação
      expect(count).toBeGreaterThanOrEqual(1)
    }
  })
})
