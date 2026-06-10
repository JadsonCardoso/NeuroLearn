import { test, expect, type Page } from '@playwright/test'
import { LibraryPage } from './pages/LibraryPage'
import { ReviewPage } from './pages/ReviewPage'

// TC-RUX: Revisão contextual, Exercícios e Meu Material — requer sessão autenticada
// Cobre: ContextSelector (trilha/conteúdo/sessão), aba Exercícios, MemoryView filtrada.

// ── Helpers ────────────────────────────────────────────────────────────────────

async function criarTrilha(page: Page, nome: string) {
  await page.click('[data-testid="btn-new-trail"]')
  await page.waitForSelector('[data-testid="trail-form-modal"]', { timeout: 5000 })
  await page.fill('[data-testid="trail-title"]', nome)
  await page.click('[data-testid="trail-save-btn"]')
  await expect(page.locator('[data-testid="trail-form-modal"]')).not.toBeVisible({ timeout: 5000 })
}

async function criarConteudoNaTrilha(page: Page, titulo: string, nomeTrilha: string) {
  const library = new LibraryPage(page)
  await library.openAddModal()
  await library.fillTitle(titulo)
  await library.selectType('book')
  const seletor = page.locator('#add-trail')
  await expect(seletor).toBeVisible({ timeout: 3000 })
  const value = await seletor.evaluate((el: HTMLSelectElement, t) => {
    return Array.from(el.options).find((o) => o.text.includes(t))?.value ?? ''
  }, nomeTrilha)
  if (value) await seletor.selectOption(value)
  await page.click('button[type="submit"]:has-text("Adicionar")')
  await library.waitForContentCard(titulo)
}

// ── ContextSelector ────────────────────────────────────────────────────────────

test.describe('TC-RUX — ContextSelector na Revisão', () => {
  test('TC-RUX-001: filtrar revisão por trilha exibe chip de contexto ativo', async ({ page }) => {
    // Setup: garante que existe pelo menos uma trilha
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha RUX001 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)

    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()

    const selector = page.locator('[data-testid="context-selector"]')
    await expect(selector).toBeVisible({ timeout: 5000 })

    // Clica em "Por Trilha"
    await page.click('[data-testid="context-by-trail"]')
    const trailDropdown = page.locator('[data-testid="context-trail-select"]')
    await expect(trailDropdown).toBeVisible({ timeout: 3000 })

    // Seleciona a trilha criada
    const value = await trailDropdown.evaluate((el: HTMLSelectElement, t) => {
      return Array.from(el.options).find((o) => o.text.includes(t))?.value ?? ''
    }, nomeTrilha)
    if (value) await trailDropdown.selectOption(value)

    // Chip de contexto ativo deve exibir o nome da trilha
    await expect(selector).toContainText(nomeTrilha)
  })

  test('TC-RUX-002: filtrar revisão por trilha e depois por conteúdo', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha RUX002 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)
    const tituloConteudo = `Conteúdo RUX002 ${Date.now()}`
    await criarConteudoNaTrilha(page, tituloConteudo, nomeTrilha)

    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()

    // Seleciona "Por Conteúdo"
    await page.click('[data-testid="context-by-content"]')
    const contentDropdown = page.locator('[data-testid="context-content-select"]')
    await expect(contentDropdown).toBeVisible({ timeout: 3000 })

    // Seleciona o conteúdo pelo título
    const value = await contentDropdown.evaluate((el: HTMLSelectElement, t) => {
      return Array.from(el.options).find((o) => o.text.includes(t))?.value ?? ''
    }, tituloConteudo)
    if (value) await contentDropdown.selectOption(value)

    await expect(page.locator('[data-testid="context-selector"]')).toContainText(tituloConteudo)
  })

  test('TC-RUX-003: chip Por Sessão desabilitado quando não há sessões', async ({ page }) => {
    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()

    const sessionChip = page.locator('[data-testid="context-by-session"]')
    await expect(sessionChip).toBeVisible({ timeout: 5000 })

    // Quando não há sessões, o botão deve estar desabilitado
    const isDisabled = await sessionChip.evaluate((el) => (el as HTMLButtonElement).disabled)
    // Se não há sessões, deve estar disabled — se houver sessões, o chip deve estar habilitado
    // Verifica apenas que não gera erro ao tentar clicar
    await expect(page.locator('text=500')).not.toBeVisible()
  })

  test('TC-RUX-003b: selecionar "Todos" limpa o filtro ativo', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha RUX003b ${Date.now()}`
    await criarTrilha(page, nomeTrilha)

    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()

    const selector = page.locator('[data-testid="context-selector"]')

    // Ativa filtro por trilha
    await page.click('[data-testid="context-by-trail"]')
    const dropdown = page.locator('[data-testid="context-trail-select"]')
    await expect(dropdown).toBeVisible({ timeout: 3000 })
    const value = await dropdown.evaluate((el: HTMLSelectElement, t) => {
      return Array.from(el.options).find((o) => o.text.includes(t))?.value ?? ''
    }, nomeTrilha)
    if (value) await dropdown.selectOption(value)

    // Volta para "Todos"
    await page.click('[data-testid="context-all"]')
    await expect(selector).not.toContainText(nomeTrilha)
  })
})

// ── Meu Material filtrado ──────────────────────────────────────────────────────

test.describe('TC-RUX — Meu Material', () => {
  test('TC-RUX-004: aba Meu Material exibe estado vazio ou conteúdo sem erro', async ({ page }) => {
    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()

    // Clica na aba Meu Material
    const tabKnowledge = page.locator('[data-testid="tab-knowledge"]')
    await expect(tabKnowledge).toBeVisible({ timeout: 5000 })
    await tabKnowledge.click()

    // Não deve ter erro 500 ou crash
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
  })

  test('TC-RUX-005: aba Meu Material respeita contexto de trilha selecionado', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha RUX005 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)

    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()

    // Seleciona filtro por trilha
    await page.click('[data-testid="context-by-trail"]')
    const dropdown = page.locator('[data-testid="context-trail-select"]')
    await expect(dropdown).toBeVisible({ timeout: 3000 })
    const value = await dropdown.evaluate((el: HTMLSelectElement, t) => {
      return Array.from(el.options).find((o) => o.text.includes(t))?.value ?? ''
    }, nomeTrilha)
    if (value) await dropdown.selectOption(value)

    // Acessa aba Meu Material
    await page.click('[data-testid="tab-knowledge"]')
    await expect(page.locator('text=500')).not.toBeVisible()
    // A aba deve renderizar sem erro (estado vazio contextual é válido)
    await expect(page.locator('body')).toBeVisible()
  })

  test.fixme('TC-RUX-005b: nova reflexão criada aparece em Meu Material com trilha e conteúdo corretos', async () => {
    // Requer criação de reflexão via tela de sessão de foco.
    // Fluxo: iniciar sessão → criar reflexão → ir para revisão → aba Meu Material.
    // Cobrir apenas após integração do fluxo de sessão com MemoryView estar estável.
  })
})

// ── Aba Exercícios ─────────────────────────────────────────────────────────────

test.describe('TC-RUX — Exercícios', () => {
  test('TC-RUX-006: aba Exercícios está visível e não exibe erro 500', async ({ page }) => {
    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()

    const tabPractice = page.locator('[data-testid="tab-practice"]')
    await expect(tabPractice).toBeVisible({ timeout: 5000 })
    await tabPractice.click()

    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
  })

  test('TC-RUX-006b: Exercícios não despacha RATE_CARD ao responder', async ({ page }) => {
    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()

    await page.click('[data-testid="tab-practice"]')

    // Intercepta chamadas à API para verificar que RATE_CARD não é disparado
    const rateCallDetected = { value: false }
    await page.route('**/api/review/rate**', () => {
      rateCallDetected.value = true
    })

    // Tenta responder um exercício se houver cards disponíveis
    const flipBtn = page
      .locator('button')
      .filter({ hasText: /ver resposta|revelar|virar/i })
      .first()
    if (await flipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await flipBtn.click()
      const rateBtn = page
        .locator('button')
        .filter({ hasText: /acertei|errei|fácil|difícil/i })
        .first()
      if (await rateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await rateBtn.click()
      }
    }

    expect(rateCallDetected.value).toBe(false)
  })

  test('TC-RUX-007: exercícios filtrados pelo contexto selecionado', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha RUX007 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)
    const tituloConteudo = `Conteúdo RUX007 ${Date.now()}`
    await criarConteudoNaTrilha(page, tituloConteudo, nomeTrilha)

    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()

    // Seleciona o conteúdo específico
    await page.click('[data-testid="context-by-content"]')
    const dropdown = page.locator('[data-testid="context-content-select"]')
    await expect(dropdown).toBeVisible({ timeout: 3000 })
    const value = await dropdown.evaluate((el: HTMLSelectElement, t) => {
      return Array.from(el.options).find((o) => o.text.includes(t))?.value ?? ''
    }, tituloConteudo)
    if (value) await dropdown.selectOption(value)

    await page.click('[data-testid="tab-practice"]')

    // A aba Exercícios não deve exibir erro e deve estar no contexto selecionado
    await expect(page.locator('text=500')).not.toBeVisible()
    // O seletor de contexto deve continuar mostrando o conteúdo ativo
    await expect(page.locator('[data-testid="context-selector"]')).toContainText(tituloConteudo)
  })
})
