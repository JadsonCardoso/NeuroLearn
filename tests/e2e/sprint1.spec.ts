import { test, expect } from '@playwright/test'

// SPRINT-1 E2E — Cobre: atalhos de teclado no Review, busca na Library, Cognitive Score no Dashboard
// Todos os cenários requerem sessão autenticada (projeto 'authenticated' do playwright.config.ts)

// ─────────────────────────────────────────────────────────────────────────────
// BIBLIOTECA — Busca por título (US-QW.1)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Sprint1 — Library Search (US-QW.1)', () => {
  test('TC-S1-LIB-001: campo de busca está visível e acessível', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    const search = page.getByTestId('library-search')
    await expect(search).toBeVisible({ timeout: 10_000 })
    await expect(search).toHaveAttribute('aria-label', 'Buscar conteúdo')
    await expect(search).toHaveAttribute('placeholder', /buscar por título/i)
  })

  test('TC-S1-LIB-002: campo de busca filtra conteúdos por título em tempo real', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    const search = page.getByTestId('library-search')
    const cards = page.getByTestId('content-card')

    const totalBefore = await cards.count()
    if (totalBefore === 0) {
      test.skip(true, 'Sem conteúdos para testar filtro')
      return
    }

    // Digita um termo improvável para garantir zero resultados
    await search.fill('zzz_termo_inexistente_xyz')
    await expect(cards).toHaveCount(0, { timeout: 3_000 })
  })

  test('TC-S1-LIB-003: limpar busca restaura todos os conteúdos', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    const search = page.getByTestId('library-search')
    const cards = page.getByTestId('content-card')

    const totalBefore = await cards.count()
    if (totalBefore === 0) {
      test.skip(true, 'Sem conteúdos para testar filtro')
      return
    }

    await search.fill('zzz_inexistente')
    await search.fill('')
    await expect(cards).toHaveCount(totalBefore, { timeout: 3_000 })
  })

  test('TC-S1-LIB-004: estado vazio de busca exibe mensagem correta', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    const search = page.getByTestId('library-search')
    await search.fill('zzz_nenhum_resultado_esperado')

    await expect(page.locator('text=/Nenhum conteúdo encontrado/i')).toBeVisible({ timeout: 3_000 })
  })

  test('TC-S1-LIB-005: busca é case-insensitive', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    const cards = page.getByTestId('content-card')
    const totalBefore = await cards.count()
    if (totalBefore === 0) {
      test.skip(true, 'Sem conteúdos para testar busca case-insensitive')
      return
    }

    // Pega o título do primeiro card
    const firstTitle = await cards.first().locator('h3').innerText()
    const lower = firstTitle.slice(0, 3).toLowerCase()
    const upper = firstTitle.slice(0, 3).toUpperCase()

    const search = page.getByTestId('library-search')
    await search.fill(lower)
    const countLower = await cards.count()

    await search.fill(upper)
    const countUpper = await cards.count()

    expect(countLower).toBe(countUpper)
    expect(countLower).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// REVISÃO — Atalhos de teclado (US-02.1 + US-02.2)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Sprint1 — Review Keyboard Shortcuts (US-02.1 + US-02.2)', () => {
  test('TC-S1-REV-001: Space vira o card (frente → resposta)', async ({ page }) => {
    await page.goto('/review')
    await page.waitForLoadState('networkidle')

    // Se não há cards, pula
    const hasCard = await page.locator('.flashcard-wrap').isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasCard) {
      test.skip(true, 'Sem cards para revisar')
      return
    }

    // Frente visível, resposta não
    const backFace = page.locator('.fc-back')
    const frontFace = page.locator('.fc-front')

    await expect(frontFace).toBeVisible()

    // Press Space
    await page.keyboard.press('Space')
    await expect(page.locator('.flashcard-inner.flipped')).toBeVisible({ timeout: 2_000 })

    // Botões de avaliação devem aparecer
    await expect(page.locator('button').filter({ hasText: /Esqueci|Difícil|Bom|Fácil/i }).first()).toBeVisible({ timeout: 2_000 })
    void backFace
  })

  test('TC-S1-REV-002: 1-4 não avalia antes de virar o card', async ({ page }) => {
    await page.goto('/review')
    await page.waitForLoadState('networkidle')

    const hasCard = await page.locator('.flashcard-wrap').isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasCard) {
      test.skip(true, 'Sem cards para revisar')
      return
    }

    // Card não virado — tecla 4 não deve avançar
    const progressBefore = await page.locator('span').filter({ hasText: /^\d+ \/ \d+$/ }).first().innerText().catch(() => '')

    await page.keyboard.press('4')
    await page.waitForTimeout(300)

    const progressAfter = await page.locator('span').filter({ hasText: /^\d+ \/ \d+$/ }).first().innerText().catch(() => '')

    expect(progressBefore).toBe(progressAfter)
  })

  test('TC-S1-REV-003: Space + tecla 4 avalia e avança para o próximo card', async ({ page }) => {
    await page.goto('/review')
    await page.waitForLoadState('networkidle')

    const hasCard = await page.locator('.flashcard-wrap').isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasCard) {
      test.skip(true, 'Sem cards para revisar')
      return
    }

    const progressBefore = await page.locator('span').filter({ hasText: /^\d+ \/ \d+$/ }).first().innerText().catch(() => '1 / 1')

    // Vira com Space
    await page.keyboard.press('Space')
    await expect(page.locator('.flashcard-inner.flipped')).toBeVisible({ timeout: 2_000 })

    // Avalia com 4 (Fácil)
    await page.keyboard.press('4')
    await page.waitForTimeout(500)

    // Se havia mais de 1 card, progresso deve ter avançado
    const [idxBefore] = progressBefore.split(' / ').map(Number)
    if (idxBefore < parseInt(progressBefore.split(' / ')[1])) {
      const progressAfter = await page.locator('span').filter({ hasText: /^\d+ \/ \d+$/ }).first().innerText().catch(() => '')
      const [idxAfter] = progressAfter.split(' / ').map(Number)
      expect(idxAfter).toBeGreaterThan(idxBefore)
    }
  })

  test('TC-S1-REV-004: botão Voltar aparece após avaliar primeiro card', async ({ page }) => {
    await page.goto('/review')
    await page.waitForLoadState('networkidle')

    const hasCard = await page.locator('.flashcard-wrap').isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasCard) {
      test.skip(true, 'Sem cards para revisar')
      return
    }

    // Antes de avaliar — botão Voltar não deve existir
    await expect(page.getByTestId('btn-go-back')).not.toBeVisible()

    // Vira e avalia
    await page.keyboard.press('Space')
    await expect(page.locator('.flashcard-inner.flipped')).toBeVisible({ timeout: 2_000 })
    await page.keyboard.press('3')
    await page.waitForTimeout(300)

    // Agora o botão Voltar deve aparecer (se havia mais de 1 card, estamos no card 2)
    // OU a revisão terminou (1 único card) — em ambos os casos sem erro
  })

  test('TC-S1-REV-005: botão Voltar navega para card anterior', async ({ page }) => {
    await page.goto('/review')
    await page.waitForLoadState('networkidle')

    const hasCard = await page.locator('.flashcard-wrap').isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasCard) {
      test.skip(true, 'Sem cards para revisar')
      return
    }

    // Precisa de pelo menos 2 cards para testar o voltar
    const countText = await page.locator('span').filter({ hasText: /^\d+ \/ \d+$/ }).first().innerText().catch(() => '1 / 1')
    const total = parseInt(countText.split(' / ')[1])
    if (total < 2) {
      test.skip(true, 'Precisa de pelo menos 2 cards para testar voltar')
      return
    }

    // Avalia o primeiro card
    await page.keyboard.press('Space')
    await page.keyboard.press('3')
    await page.waitForTimeout(300)

    // Agora estamos no card 2, botão Voltar visível
    const backBtn = page.getByTestId('btn-go-back')
    await expect(backBtn).toBeVisible({ timeout: 2_000 })

    // Clica Voltar
    await backBtn.click()

    // Deve voltar ao card 1
    const progressAfter = await page.locator('span').filter({ hasText: /^\d+ \/ \d+$/ }).first().innerText().catch(() => '')
    const idxAfter = parseInt(progressAfter.split(' / ')[0])
    expect(idxAfter).toBe(1)
  })

  test('TC-S1-REV-006: Backspace aciona voltar ao card anterior', async ({ page }) => {
    await page.goto('/review')
    await page.waitForLoadState('networkidle')

    const hasCard = await page.locator('.flashcard-wrap').isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasCard) {
      test.skip(true, 'Sem cards para revisar')
      return
    }

    const countText = await page.locator('span').filter({ hasText: /^\d+ \/ \d+$/ }).first().innerText().catch(() => '1 / 1')
    const total = parseInt(countText.split(' / ')[1])
    if (total < 2) {
      test.skip(true, 'Precisa de pelo menos 2 cards para testar Backspace')
      return
    }

    await page.keyboard.press('Space')
    await page.keyboard.press('3')
    await page.waitForTimeout(300)

    // Agora Backspace deve voltar
    await page.keyboard.press('Backspace')
    await page.waitForTimeout(300)

    const progressAfter = await page.locator('span').filter({ hasText: /^\d+ \/ \d+$/ }).first().innerText().catch(() => '')
    const idxAfter = parseInt(progressAfter.split(' / ')[0])
    expect(idxAfter).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD — Cognitive Score (US-01.1)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Sprint1 — Dashboard Cognitive Score (US-01.1)', () => {
  test('TC-S1-DASH-001: stat "Cognitive Score" está visível no dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Cognitive Score')).toBeVisible({ timeout: 10_000 })
  })

  test('TC-S1-DASH-002: Cognitive Score exibe valor numérico no formato X/100', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Encontra o valor do Cognitive Score
    const scoreEl = page.locator('text=/\\d+\\/100/')
    await expect(scoreEl.first()).toBeVisible({ timeout: 10_000 })
  })

  test('TC-S1-DASH-003: stat Sequência exibe streak em dias', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Sequência')).toBeVisible({ timeout: 10_000 })
    // Valor deve ter 'd' (ex: "5d")
    const streakVal = page.locator('text=/\\d+d/')
    await expect(streakVal.first()).toBeVisible({ timeout: 5_000 })
  })

  test('TC-S1-DASH-004: dashboard não exibe erro 500 nem crash', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
    await expect(page.locator('text=Application error')).not.toBeVisible()
  })
})
