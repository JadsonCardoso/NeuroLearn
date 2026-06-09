import { test, expect } from '@playwright/test'

// AI Validation E2E — T-A4 (ARCHITECTURE-REFINE-01)
// Valida o comportamento da UI quando as rotas de IA retornam:
//   - HTTP 422 com code=AI_INVALID_OUTPUT (novo em T-A4)
//   - HTTP 500 com code=AI_ERROR
//   - HTTP 200 com resposta válida (caminho feliz)

// ---------------------------------------------------------------------------
// /api/ai/generate-flashcards — GenerateFlashcardsModal (LibraryView)
// ---------------------------------------------------------------------------
test.describe('IA — generate-flashcards', () => {
  const NOTAS = 'Anotações de teste para geração de flashcards com IA. Conteúdo mínimo para passar a validação de input do formulário de geração.'

  async function abrirModal(page: import('@playwright/test').Page) {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    const temConteudo = await page
      .locator('[data-testid="btn-generate-ai"]')
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    if (!temConteudo) return false

    await page.locator('[data-testid="btn-generate-ai"]').first().click()
    await expect(page.locator('[data-testid="generate-flashcards-modal"]')).toBeVisible({ timeout: 3_000 })
    return true
  }

  test('TC-AIV-GF-001: modal exibe mensagem de erro quando API retorna 422 (AI_INVALID_OUTPUT)', async ({ page }) => {
    const abriu = await abrirModal(page)
    if (!abriu) {
      test.skip(true, 'Sem conteúdo na biblioteca')
      return
    }

    await page.route('**/api/ai/generate-flashcards', async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'IA retornou resposta inválida', code: 'AI_INVALID_OUTPUT' }),
      })
    })

    await page.locator('[data-testid="gen-notes-input"]').fill(NOTAS)
    await page.locator('[data-testid="btn-generate"]').click()

    await expect(page.locator('[data-testid="gen-error"]')).toBeVisible({ timeout: 6_000 })
    await expect(page.locator('[data-testid="gen-error"]')).toContainText('IA retornou resposta inválida')
    // Formulário permanece ativo — usuário pode tentar novamente
    await expect(page.locator('[data-testid="gen-notes-input"]')).toBeVisible()
  })

  test('TC-AIV-GF-002: modal exibe erro genérico quando API retorna 500 (AI_ERROR)', async ({ page }) => {
    const abriu = await abrirModal(page)
    if (!abriu) {
      test.skip(true, 'Sem conteúdo na biblioteca')
      return
    }

    await page.route('**/api/ai/generate-flashcards', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Erro ao processar com IA. Tente novamente.', code: 'AI_ERROR' }),
      })
    })

    await page.locator('[data-testid="gen-notes-input"]').fill(NOTAS)
    await page.locator('[data-testid="btn-generate"]').click()

    await expect(page.locator('[data-testid="gen-error"]')).toBeVisible({ timeout: 6_000 })
    await expect(page.locator('[data-testid="gen-error"]')).toContainText('Erro ao processar com IA')
  })

  test('TC-AIV-GF-003: modal avança para revisão quando API retorna cards válidos', async ({ page }) => {
    const abriu = await abrirModal(page)
    if (!abriu) {
      test.skip(true, 'Sem conteúdo na biblioteca')
      return
    }

    await page.route('**/api/ai/generate-flashcards', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          cards: [
            { front: 'O que é fotossíntese?', back: 'Conversão de luz solar em energia química.' },
            { front: 'O que são cloroplastos?', back: 'Organelas responsáveis pela fotossíntese.' },
          ],
        }),
      })
    })

    await page.locator('[data-testid="gen-notes-input"]').fill(NOTAS)
    await page.locator('[data-testid="btn-generate"]').click()

    // Avança para a tela de revisão dos cards gerados
    await expect(page.locator('[data-testid="gen-card-0"]')).toBeVisible({ timeout: 6_000 })
    await expect(page.locator('[data-testid="gen-card-1"]')).toBeVisible()
    await expect(page.locator('[data-testid="gen-error"]')).not.toBeVisible()
  })

  test('TC-AIV-GF-004: modal não chama API com anotações abaixo de 50 chars', async ({ page }) => {
    const abriu = await abrirModal(page)
    if (!abriu) {
      test.skip(true, 'Sem conteúdo na biblioteca')
      return
    }

    let chamouAPI = false
    await page.route('**/api/ai/generate-flashcards', async (route) => {
      chamouAPI = true
      await route.continue()
    })

    await page.locator('[data-testid="gen-notes-input"]').fill('Curto demais')
    await page.locator('[data-testid="btn-generate"]').click()

    // Validação client-side: erro aparece sem chamar a API
    await expect(page.locator('[data-testid="gen-error"]')).toBeVisible({ timeout: 3_000 })
    expect(chamouAPI).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// /api/ai/analyze-teaching — ActiveView (Modo Professor)
// ---------------------------------------------------------------------------
test.describe('IA — analyze-teaching', () => {
  const TEXTO_LONGO = 'Explicação detalhada sobre o tema estudado com mais de cem caracteres para habilitar a análise da IA no modo professor de aprendizado ativo.'

  async function entrarModoProfesor(page: import('@playwright/test').Page) {
    await page.goto('/active')
    await page.waitForLoadState('networkidle')

    const temModo = await page.locator('text=Modo Professor').first().isVisible({ timeout: 5_000 }).catch(() => false)
    if (!temModo) return false

    await page.locator('text=Modo Professor').first().click()

    const temSel = await page.locator('text=Escolha um conteúdo').isVisible({ timeout: 3_000 }).catch(() => false)
    if (!temSel) return false

    await page.locator('.card').nth(1).click()
    return true
  }

  test('TC-AIV-AT-001: exibe mensagem de erro quando API retorna 422 (AI_INVALID_OUTPUT)', async ({ page }) => {
    const entrou = await entrarModoProfesor(page)
    if (!entrou) {
      test.skip(true, 'ActiveView não carregou ou sem conteúdo')
      return
    }

    await page.route('**/api/ai/analyze-teaching', async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'IA retornou resposta inválida', code: 'AI_INVALID_OUTPUT' }),
      })
    })

    await page.locator('textarea').fill(TEXTO_LONGO)
    await page.locator('[data-testid="btn-analyze-teaching"]').click()

    // Erro exibido abaixo do botão
    await expect(page.locator('text=IA retornou resposta inválida')).toBeVisible({ timeout: 6_000 })
    // Painel de análise NÃO deve aparecer
    await expect(page.locator('[data-testid="teaching-analysis"]')).not.toBeVisible()
  })

  test('TC-AIV-AT-002: exibe erro de conexão quando API não responde', async ({ page }) => {
    const entrou = await entrarModoProfesor(page)
    if (!entrou) {
      test.skip(true, 'ActiveView não carregou ou sem conteúdo')
      return
    }

    await page.route('**/api/ai/analyze-teaching', async (route) => {
      await route.abort('connectionrefused')
    })

    await page.locator('textarea').fill(TEXTO_LONGO)
    await page.locator('[data-testid="btn-analyze-teaching"]').click()

    await expect(page.locator('text=Falha na conexão')).toBeVisible({ timeout: 6_000 })
    await expect(page.locator('[data-testid="teaching-analysis"]')).not.toBeVisible()
  })

  test('TC-AIV-AT-003: exibe painel de análise quando API retorna resposta válida', async ({ page }) => {
    const entrou = await entrarModoProfesor(page)
    if (!entrou) {
      test.skip(true, 'ActiveView não carregou ou sem conteúdo')
      return
    }

    await page.route('**/api/ai/analyze-teaching', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          analysis: {
            clarity_score: 85,
            coverage_score: 72,
            gaps: ['Exemplos práticos'],
            strengths: ['Estrutura clara'],
            suggestions: ['Adicione mais exemplos concretos'],
            estimated_retention: 78,
          },
        }),
      })
    })

    await page.locator('textarea').fill(TEXTO_LONGO)
    await page.locator('[data-testid="btn-analyze-teaching"]').click()

    await expect(page.locator('[data-testid="teaching-analysis"]')).toBeVisible({ timeout: 6_000 })
    await expect(page.locator('[data-testid="teaching-retention-badge"]')).toContainText('78%')
    await expect(page.locator('[data-testid="teaching-clarity-score"]')).toContainText('85')
  })
})

// ---------------------------------------------------------------------------
// /api/ai/generate-quiz — ActiveView (Quiz Adaptativo)
// ---------------------------------------------------------------------------
test.describe('IA — generate-quiz', () => {
  async function entrarModoQuiz(page: import('@playwright/test').Page) {
    await page.goto('/active')
    await page.waitForLoadState('networkidle')

    const temQuiz = await page.locator('text=Quiz Adaptativo').first().isVisible({ timeout: 5_000 }).catch(() => false)
    if (!temQuiz) return false

    await page.locator('text=Quiz Adaptativo').first().click()

    const temSel = await page.locator('text=Escolha um conteúdo').isVisible({ timeout: 3_000 }).catch(() => false)
    if (!temSel) return false

    return true
  }

  test('TC-AIV-GQ-001: exibe quiz-error quando todas as chamadas de API falham com 422', async ({ page }) => {
    const entrou = await entrarModoQuiz(page)
    if (!entrou) {
      test.skip(true, 'ActiveView não carregou ou sem conteúdo')
      return
    }

    await page.route('**/api/ai/generate-quiz', async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'IA retornou resposta inválida', code: 'AI_INVALID_OUTPUT' }),
      })
    })

    await page.locator('.card').nth(1).click()

    await expect(page.locator('[data-testid="quiz-error"]')).toBeVisible({ timeout: 12_000 })
    await expect(page.locator('[data-testid="quiz-error"]')).toContainText('Não foi possível gerar o quiz')
    // Quiz playing state NÃO deve aparecer
    await expect(page.locator('[data-testid="quiz-playing"]')).not.toBeVisible()
  })

  test('TC-AIV-GQ-002: quiz inicia quando API retorna distratores válidos', async ({ page }) => {
    const entrou = await entrarModoQuiz(page)
    if (!entrou) {
      test.skip(true, 'ActiveView não carregou ou sem conteúdo')
      return
    }

    await page.route('**/api/ai/generate-quiz', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          distractors: ['Opção errada A', 'Opção errada B', 'Opção errada C'],
        }),
      })
    })

    await page.locator('.card').nth(1).click()

    // Com distratores válidos, o quiz deve iniciar no estado playing
    await expect(page.locator('[data-testid="quiz-playing"]')).toBeVisible({ timeout: 12_000 })
    await expect(page.locator('[data-testid="quiz-question"]')).toBeVisible()
    await expect(page.locator('[data-testid="quiz-error"]')).not.toBeVisible()
  })
})
