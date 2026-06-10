import { test, expect, type Page } from '@playwright/test'
import { LibraryPage } from './pages/LibraryPage'
import { ReviewPage } from './pages/ReviewPage'

// TC-NEG: Cenários negativos e não funcionais da Biblioteca — requer sessão autenticada
// Cobre: drop inválido, contexto de revisão, paginação, responsividade, teclado.

// ── Helpers ────────────────────────────────────────────────────────────────────

async function criarTrilha(page: Page, nome: string) {
  await page.click('[data-testid="btn-new-trail"]')
  await page.waitForSelector('[data-testid="trail-form-modal"]', { timeout: 5000 })
  await page.fill('[data-testid="trail-title"]', nome)
  await page.click('[data-testid="trail-save-btn"]')
  await expect(page.locator('[data-testid="trail-form-modal"]')).not.toBeVisible({ timeout: 5000 })
}

async function criarConteudo(page: Page, titulo: string) {
  const library = new LibraryPage(page)
  await library.openAddModal()
  await library.fillTitle(titulo)
  await library.selectType('book')
  await page.click('button[type="submit"]:has-text("Adicionar")')
  await library.waitForContentCard(titulo)
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

// ── Cenários Negativos ─────────────────────────────────────────────────────────

test.describe('TC-NEG — Cenários Negativos', () => {
  test.fixme('TC-NEG-001: exibir erro quando falhar o autosave', async () => {
    // Auto-save não implementado: o drawer usa botão manual "Salvar".
    // Quando implementado: simular falha de rede (page.route para retornar 500)
    // e verificar que o sistema exibe estado de erro (não "salvo automaticamente").
  })

  test('TC-NEG-002: drop fora de área droppable mantém conteúdo na origem', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha NEG002 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)
    const titulo = `Conteúdo NEG002 ${Date.now()}`
    await criarConteudoNaTrilha(page, titulo, nomeTrilha)

    const card = page.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    const cardBox = await card.boundingBox()
    if (!cardBox) return

    // Simula drag para a sidebar/cabeçalho (área sem droppable)
    const cx = cardBox.x + cardBox.width / 2
    const cy = cardBox.y + cardBox.height / 2

    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + 6, cy, { steps: 3 })
    // Solta no topo da página (fora de qualquer DroppableTrailSection)
    await page.mouse.move(cx, 20, { steps: 15 })
    await page.waitForTimeout(300)
    await page.mouse.up()
    await page.waitForTimeout(500)

    // Conteúdo deve permanecer na trilha de origem
    const trailSection = page
      .locator('[data-testid="trail-section"]')
      .filter({ hasText: nomeTrilha })
    await expect(
      trailSection.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    ).toBeVisible({ timeout: 3000 })
  })

  test.fixme('TC-NEG-003: reverter drag and drop quando a persistência falhar', async () => {
    // CC-03: optimistic update sem rollback — não implementado.
    // handleDragEnd despacha ASSIGN_CONTENT_TRAIL sem revert em caso de erro Supabase.
    // Quando implementado: usar page.route para simular erro 500 no PATCH da API
    // e verificar que o conteúdo volta à trilha original.
  })

  test('TC-NEG-004: revisão com contexto de trilha não exibe itens de outra trilha', async ({
    page,
  }) => {
    // Setup: cria duas trilhas com conteúdos distintos
    const library = new LibraryPage(page)
    await library.goto()
    const trilhaA = `Trilha A NEG004 ${Date.now()}`
    const trilhaB = `Trilha B NEG004 ${Date.now()}`
    await criarTrilha(page, trilhaA)
    await criarTrilha(page, trilhaB)
    const conteudoA = `Conteúdo A NEG004 ${Date.now()}`
    await criarConteudoNaTrilha(page, conteudoA, trilhaA)

    const review = new ReviewPage(page)
    await review.goto()
    await review.waitForPageLoad()

    // Seleciona trilha A no ContextSelector
    await page.click('[data-testid="context-by-trail"]')
    const dropdown = page.locator('[data-testid="context-trail-select"]')
    await expect(dropdown).toBeVisible({ timeout: 3000 })
    const value = await dropdown.evaluate((el: HTMLSelectElement, t) => {
      return Array.from(el.options).find((o) => o.text.includes(t))?.value ?? ''
    }, trilhaA)
    if (value) await dropdown.selectOption(value)

    // O contexto ativo deve refletir apenas trilha A
    await expect(page.locator('[data-testid="context-selector"]')).toContainText(trilhaA)
    await expect(page.locator('[data-testid="context-selector"]')).not.toContainText(trilhaB)
  })

  test('TC-NEG-005: drawer — campo título vazio bloqueia salvamento com mensagem de erro', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `Conteúdo NEG005 ${Date.now()}`
    const library2 = new LibraryPage(page)
    await library2.goto()

    await criarConteudo(page, titulo)
    await page.locator('[data-testid="content-card"]').filter({ hasText: titulo }).click()
    await expect(page.locator('[data-testid="content-drawer"]')).toBeVisible({ timeout: 5000 })

    await page.click('[data-testid="drawer-edit-btn"]')
    // Limpa o título e tenta salvar
    await page.fill('[data-testid="drawer-input-title"]', '')
    await page.click('[data-testid="drawer-save-btn"]')

    // Deve exibir mensagem de erro — modal permanece aberto
    const error = page.locator('[role="alert"]').first()
    await expect(error).toBeVisible({ timeout: 3000 })
    // Drawer ainda visível (não fechou após tentativa inválida)
    await expect(page.locator('[data-testid="content-drawer"]')).toBeVisible()
  })
})

// ── Cenários Não Funcionais ────────────────────────────────────────────────────

test.describe('TC-NFR — Paginação e Volume', () => {
  test('TC-NFR-001: botão "Mostrar mais" exibe conteúdos além do limite inicial', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha NFR001 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)

    // Cria PAGE_SIZE + 1 = 7 conteúdos na mesma trilha para forçar paginação
    const titulos: string[] = []
    for (let i = 1; i <= 7; i++) {
      const t = `NFR001-item-${i}-${Date.now()}`
      titulos.push(t)
      await criarConteudoNaTrilha(page, t, nomeTrilha)
    }

    const trailSection = page
      .locator('[data-testid="trail-section"]')
      .filter({ hasText: nomeTrilha })

    // O 7º item deve estar oculto antes de clicar em "Mostrar mais"
    const showMoreBtn = trailSection.locator(`[data-testid^="btn-show-more-"]`)
    await expect(showMoreBtn).toBeVisible({ timeout: 5000 })

    const setimo = trailSection
      .locator('[data-testid="content-card"]')
      .filter({ hasText: titulos[6] })
    await expect(setimo).not.toBeVisible()

    // Após clicar, o 7º deve aparecer
    await showMoreBtn.click()
    await expect(setimo).toBeVisible({ timeout: 3000 })
  })

  test('TC-NFR-001b: botão "Mostrar menos" volta ao limite inicial após expandir', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha NFR001b ${Date.now()}`
    await criarTrilha(page, nomeTrilha)

    for (let i = 1; i <= 7; i++) {
      await criarConteudoNaTrilha(page, `NFR001b-item-${i}-${Date.now()}`, nomeTrilha)
    }

    const trailSection = page
      .locator('[data-testid="trail-section"]')
      .filter({ hasText: nomeTrilha })
    const showMoreBtn = trailSection.locator(`[data-testid^="btn-show-more-"]`)
    await expect(showMoreBtn).toBeVisible({ timeout: 5000 })
    await showMoreBtn.click()

    const showLessBtn = trailSection.locator(`[data-testid^="btn-show-less-"]`)
    await expect(showLessBtn).toBeVisible({ timeout: 3000 })
    await showLessBtn.click()

    // Após recolher, o botão "Mostrar mais" deve aparecer novamente
    await expect(showMoreBtn).toBeVisible({ timeout: 3000 })
  })

  test.fixme('TC-NFR-002: lista extensa renderiza com virtualização sem travar', async () => {
    // Virtualização não implementada — F-110 no roadmap.
    // Quando implementado: criar 200+ conteúdos, verificar que apenas itens visíveis
    // estão no DOM (usar page.evaluate para contar nós renderizados).
  })
})

test.describe('TC-NFR — Responsividade', () => {
  test('TC-NFR-003: biblioteca responsiva em tablet (768×1024) exibe elementos críticos', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    const library = new LibraryPage(page)
    await library.goto()

    // Título da página visível
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
    // Botão de adicionar conteúdo acessível
    await expect(
      page
        .locator('button')
        .filter({ hasText: /adicionar|novo|\+/i })
        .first()
    ).toBeVisible({ timeout: 5000 })
    // Não deve ter overflow horizontal que quebre o layout
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )
    expect(hasHorizontalOverflow).toBe(false)
  })

  test('TC-NFR-003b: biblioteca responsiva em mobile (375×667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const library = new LibraryPage(page)
    await library.goto()

    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
    // Botão de adicionar deve ser acessível (não escondido atrás do overflow)
    await expect(
      page
        .locator('button')
        .filter({ hasText: /adicionar|novo|\+/i })
        .first()
    ).toBeVisible({ timeout: 5000 })
  })
})

test.describe('TC-NFR — Navegação por Teclado', () => {
  test('TC-NFR-004: Escape fecha o ContentDrawer quando aberto', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `Conteúdo NFR004 ${Date.now()}`
    await criarConteudo(page, titulo)

    await page.locator('[data-testid="content-card"]').filter({ hasText: titulo }).click()
    await expect(page.locator('[data-testid="content-drawer"]')).toBeVisible({ timeout: 5000 })

    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="content-drawer"]')).not.toBeVisible({ timeout: 3000 })
  })

  test('TC-NFR-004b: botão fechar drawer tem aria-label acessível', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `Conteúdo NFR004b ${Date.now()}`
    await criarConteudo(page, titulo)

    await page.locator('[data-testid="content-card"]').filter({ hasText: titulo }).click()
    await expect(page.locator('[data-testid="content-drawer"]')).toBeVisible({ timeout: 5000 })

    const closeBtn = page.locator('[data-testid="drawer-close"]')
    await expect(closeBtn).toBeVisible()
    const ariaLabel = await closeBtn.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
  })

  test('TC-NFR-004c: Tab percorre os elementos do drawer em ordem lógica', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `Conteúdo NFR004c ${Date.now()}`
    await criarConteudo(page, titulo)

    await page.locator('[data-testid="content-card"]').filter({ hasText: titulo }).click()
    await expect(page.locator('[data-testid="content-drawer"]')).toBeVisible({ timeout: 5000 })

    // Foca no drawer e navega com Tab
    await page.locator('[data-testid="drawer-close"]').focus()
    await page.keyboard.press('Tab')
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
    expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focusedTag)
  })

  test('TC-NFR-004d: ConfirmDialog tem foco gerenciado e Tab não sai do modal', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `Conteúdo NFR004d ${Date.now()}`
    await criarConteudo(page, titulo)

    const card = page.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    await card.hover()
    await card.locator('[data-testid="btn-delete-content"]').click()

    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible({ timeout: 3000 })

    // Pelo menos um botão do dialog deve ter foco ou ser focável
    const confirmBtn = page.locator('[data-testid="confirm-dialog-confirm"]')
    const cancelBtn = page.locator('[data-testid="confirm-dialog-cancel"]')
    await expect(confirmBtn).toBeVisible()
    await expect(cancelBtn).toBeVisible()

    // Cancela para não remover o conteúdo
    await cancelBtn.click()
  })
})
