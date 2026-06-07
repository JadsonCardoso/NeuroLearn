import { test, expect } from '@playwright/test'

// SPRINT-2 E2E — US-02.4: Tela de resultado com Cognitive Score recalculado
// Todos os cenários requerem sessão autenticada (projeto 'authenticated')

test.describe('Sprint2 — Review Result Screen with Cognitive Score (US-02.4)', () => {
  async function completeOneReviewSession(page: import('@playwright/test').Page) {
    await page.goto('/review')
    await page.waitForLoadState('networkidle')

    const hasCard = await page.locator('.flashcard-wrap').isVisible({ timeout: 5_000 }).catch(() => false)
    return hasCard
  }

  test('TC-S2-REV-001: tela de resultado exibe seção Cognitive Score', async ({ page }) => {
    const hasCard = await completeOneReviewSession(page)
    if (!hasCard) {
      test.skip(true, 'Sem cards para revisar')
      return
    }

    // Completa a fila inteira virando e avaliando cada card
    let cardsLeft = true
    while (cardsLeft) {
      const cardVisible = await page.locator('.flashcard-wrap').isVisible({ timeout: 2_000 }).catch(() => false)
      if (!cardVisible) break
      await page.keyboard.press('Space')
      await page.keyboard.press('4')
      await page.waitForTimeout(200)
      // Verifica se chegou na tela de resultado
      const doneVisible = await page.locator('[data-testid="result-cognitive-score"]').isVisible({ timeout: 500 }).catch(() => false)
      if (doneVisible) { cardsLeft = false }
    }

    await expect(page.locator('[data-testid="result-cognitive-score"]')).toBeVisible({ timeout: 5_000 })
  })

  test('TC-S2-REV-002: Cognitive Score exibe valor numérico X/100', async ({ page }) => {
    const hasCard = await completeOneReviewSession(page)
    if (!hasCard) {
      test.skip(true, 'Sem cards para revisar')
      return
    }

    let cardsLeft = true
    while (cardsLeft) {
      const cardVisible = await page.locator('.flashcard-wrap').isVisible({ timeout: 2_000 }).catch(() => false)
      if (!cardVisible) break
      await page.keyboard.press('Space')
      await page.keyboard.press('4')
      await page.waitForTimeout(200)
      const doneVisible = await page.locator('[data-testid="result-cognitive-score"]').isVisible({ timeout: 500 }).catch(() => false)
      if (doneVisible) { cardsLeft = false }
    }

    await expect(page.locator('[data-testid="result-cognitive-score"]')).toBeVisible({ timeout: 5_000 })

    // Score value é um número
    const scoreText = await page.locator('[data-testid="result-score-value"]').innerText()
    const score = parseInt(scoreText)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)

    // Deve ter "/100" próximo ao valor
    await expect(page.locator('text=/\\/100/')).toBeVisible()
  })

  test('TC-S2-REV-003: label "Cognitive Score" está visível na tela de resultado', async ({ page }) => {
    const hasCard = await completeOneReviewSession(page)
    if (!hasCard) {
      test.skip(true, 'Sem cards para revisar')
      return
    }

    let cardsLeft = true
    while (cardsLeft) {
      const cardVisible = await page.locator('.flashcard-wrap').isVisible({ timeout: 2_000 }).catch(() => false)
      if (!cardVisible) break
      await page.keyboard.press('Space')
      await page.keyboard.press('4')
      await page.waitForTimeout(200)
      const doneVisible = await page.locator('[data-testid="result-cognitive-score"]').isVisible({ timeout: 500 }).catch(() => false)
      if (doneVisible) { cardsLeft = false }
    }

    await expect(page.locator('text=Cognitive Score')).toBeVisible({ timeout: 5_000 })
  })

  test('TC-S2-REV-004: tela de resultado mantém stats Cards e Desempenho', async ({ page }) => {
    const hasCard = await completeOneReviewSession(page)
    if (!hasCard) {
      test.skip(true, 'Sem cards para revisar')
      return
    }

    let cardsLeft = true
    while (cardsLeft) {
      const cardVisible = await page.locator('.flashcard-wrap').isVisible({ timeout: 2_000 }).catch(() => false)
      if (!cardVisible) break
      await page.keyboard.press('Space')
      await page.keyboard.press('4')
      await page.waitForTimeout(200)
      const doneVisible = await page.locator('[data-testid="result-cognitive-score"]').isVisible({ timeout: 500 }).catch(() => false)
      if (doneVisible) { cardsLeft = false }
    }

    // Stats originais ainda devem aparecer
    await expect(page.locator('text=Cards')).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('text=Desempenho')).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('text=/XP ganho/')).toBeVisible({ timeout: 5_000 })
  })

  test('TC-S2-REV-005: botão "Voltar ao Dashboard" navega para /dashboard', async ({ page }) => {
    const hasCard = await completeOneReviewSession(page)
    if (!hasCard) {
      test.skip(true, 'Sem cards para revisar')
      return
    }

    let cardsLeft = true
    while (cardsLeft) {
      const cardVisible = await page.locator('.flashcard-wrap').isVisible({ timeout: 2_000 }).catch(() => false)
      if (!cardVisible) break
      await page.keyboard.press('Space')
      await page.keyboard.press('4')
      await page.waitForTimeout(200)
      const doneVisible = await page.locator('[data-testid="result-cognitive-score"]').isVisible({ timeout: 500 }).catch(() => false)
      if (doneVisible) { cardsLeft = false }
    }

    await page.locator('button', { hasText: 'Voltar ao Dashboard' }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5_000 })
  })
})
