import { test, expect, type Page } from '@playwright/test'
import { LibraryPage } from './pages/LibraryPage'

// TC-LUX: Funcionalidades UX avançadas da Biblioteca — requer sessão autenticada
// Cobre: ContentDrawer, edição, exclusão com undo, criação com trilha, DnD, collapse.

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

async function arrastarPara(page: Page, origemSeletor: string, destinoSeletor: string) {
  const orig = await page.locator(origemSeletor).first().boundingBox()
  const dest = await page.locator(destinoSeletor).first().boundingBox()
  if (!orig || !dest) return
  const ox = orig.x + orig.width / 2
  const oy = orig.y + orig.height / 2
  const dx = dest.x + dest.width / 2
  const dy = dest.y + dest.height / 2
  await page.mouse.move(ox, oy)
  await page.mouse.down()
  await page.mouse.move(ox + 6, oy, { steps: 3 })
  await page.mouse.move(dx, dy, { steps: 20 })
  await page.waitForTimeout(300)
  await page.mouse.up()
  await page.waitForTimeout(500)
}

// ── ContentDrawer ──────────────────────────────────────────────────────────────

test.describe('TC-LUX — ContentDrawer', () => {
  test('TC-LUX-001: abrir drawer contextual ao clicar em card', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `TC-LUX-001 ${Date.now()}`
    await criarConteudo(page, titulo)

    await page.locator('[data-testid="content-card"]').filter({ hasText: titulo }).click()

    const drawer = page.locator('[data-testid="content-drawer"]')
    await expect(drawer).toBeVisible({ timeout: 5000 })
    await expect(drawer).toContainText(titulo)
    await expect(page.locator('[data-testid="drawer-tab-cards"]')).toBeVisible()
    await expect(page.locator('[data-testid="drawer-tab-sessions"]')).toBeVisible()
    await expect(page.locator('[data-testid="drawer-close"]')).toBeVisible()
  })

  test('TC-LUX-002: editar conteúdo pelo drawer atualiza card na lista sem reload', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `TC-LUX-002 ${Date.now()}`
    const tituloNovo = `TC-LUX-002 EDITADO ${Date.now()}`
    await criarConteudo(page, titulo)

    await page.locator('[data-testid="content-card"]').filter({ hasText: titulo }).click()
    await expect(page.locator('[data-testid="content-drawer"]')).toBeVisible({ timeout: 5000 })

    await page.click('[data-testid="drawer-edit-btn"]')
    await page.fill('[data-testid="drawer-input-title"]', tituloNovo)
    await page.click('[data-testid="drawer-save-btn"]')

    await expect(page.locator('[data-testid="content-drawer"]')).toContainText(tituloNovo)
    await library.waitForContentCard(tituloNovo)
  })

  test.fixme('TC-LUX-003: exibir estado "salvando" e "salvo automaticamente" ao editar', async () => {
    // Auto-save não implementado.
    // O drawer usa botão manual "Salvar" (drawer-save-btn + loading state).
    // Feature futura: exibir badge "salvando..." / "salvo automaticamente" ao alterar campo.
  })

  test('TC-LUX-004: remover conteúdo via btn-delete exibe ConfirmDialog', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `TC-LUX-004 ${Date.now()}`
    await criarConteudo(page, titulo)

    const card = page.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    await card.hover()
    await card.locator('[data-testid="btn-delete-content"]').click()

    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible({ timeout: 3000 })
    // Cancela para não destruir dados de outros testes
    await page.click('[data-testid="confirm-dialog-cancel"]')
    await expect(card).toBeVisible()
  })

  test('TC-LUX-004b: confirmar remoção oculta card imediatamente e exibe undo toast', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `TC-LUX-004b ${Date.now()}`
    await criarConteudo(page, titulo)

    const card = page.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    await card.hover()
    await card.locator('[data-testid="btn-delete-content"]').click()
    await page.click('[data-testid="confirm-dialog-confirm"]')

    await expect(card).not.toBeVisible({ timeout: 3000 })
    await expect(page.locator('button:has-text("Desfazer")')).toBeVisible({ timeout: 4000 })
  })

  test('TC-LUX-004c: clicar Desfazer restaura o conteúdo removido', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `TC-LUX-004c ${Date.now()}`
    await criarConteudo(page, titulo)

    const card = page.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    await card.hover()
    await card.locator('[data-testid="btn-delete-content"]').click()
    await page.click('[data-testid="confirm-dialog-confirm"]')
    await page.click('button:has-text("Desfazer")')

    await library.waitForContentCard(titulo)
  })

  test('TC-LUX-004d: fechar drawer via overlay fecha sem erro', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const titulo = `TC-LUX-004d ${Date.now()}`
    await criarConteudo(page, titulo)

    await page.locator('[data-testid="content-card"]').filter({ hasText: titulo }).click()
    await expect(page.locator('[data-testid="content-drawer"]')).toBeVisible({ timeout: 5000 })

    await page.click('[data-testid="drawer-overlay"]')
    await expect(page.locator('[data-testid="content-drawer"]')).not.toBeVisible({ timeout: 3000 })
  })
})

// ── Conteúdo + Trilha ──────────────────────────────────────────────────────────

test.describe('TC-LUX — Criação e Associação de Trilha', () => {
  test('TC-LUX-005: criar conteúdo associado a trilha existente', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha LUX005 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)

    const titulo = `Conteúdo LUX005 ${Date.now()}`
    await criarConteudoNaTrilha(page, titulo, nomeTrilha)

    const trailSection = page
      .locator('[data-testid="trail-section"]')
      .filter({ hasText: nomeTrilha })
    await expect(
      trailSection.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    ).toBeVisible({ timeout: 5000 })

    // Não deve aparecer em conteúdos sem trilha
    const orphan = page.locator('[data-testid="trail-section-orphan"]')
    const orphanCard = orphan.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    await expect(orphanCard).not.toBeVisible()
  })

  test.fixme('TC-LUX-006: criar nova trilha dentro do modal de criação de conteúdo', async () => {
    // Não implementado.
    // O AddContentModal exibe apenas um <select> de trilhas existentes.
    // Feature futura: botão "Nova trilha" inline abre TrailFormModal mantendo o fluxo.
  })

  test('TC-LUX-007: trocar trilha de conteúdo via edição', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeA = `Trilha A LUX007 ${Date.now()}`
    const nomeB = `Trilha B LUX007 ${Date.now()}`
    await criarTrilha(page, nomeA)
    await criarTrilha(page, nomeB)

    const titulo = `Conteúdo LUX007 ${Date.now()}`
    await criarConteudoNaTrilha(page, titulo, nomeA)

    // Abre modal de edição via btn-edit-content
    const card = page.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    await card.hover()
    await card.locator('[data-testid="btn-edit-content"]').click()

    // Muda a trilha para B
    const editTrailSelect = page.locator('#edit-trail')
    await expect(editTrailSelect).toBeVisible({ timeout: 3000 })
    const value = await editTrailSelect.evaluate((el: HTMLSelectElement, t) => {
      return Array.from(el.options).find((o) => o.text.includes(t))?.value ?? ''
    }, nomeB)
    if (value) await editTrailSelect.selectOption(value)
    await page.click('button[type="submit"]:has-text("Salvar")')

    // Deve aparecer em B
    const sectionB = page.locator('[data-testid="trail-section"]').filter({ hasText: nomeB })
    await expect(
      sectionB.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    ).toBeVisible({ timeout: 5000 })

    // Não deve aparecer em A
    const sectionA = page.locator('[data-testid="trail-section"]').filter({ hasText: nomeA })
    await expect(
      sectionA.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    ).not.toBeVisible()
  })

  test('TC-LUX-008: remover associação de trilha mantém conteúdo existente', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha LUX008 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)

    const titulo = `Conteúdo LUX008 ${Date.now()}`
    await criarConteudoNaTrilha(page, titulo, nomeTrilha)

    const card = page.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    await card.hover()
    await card.locator('[data-testid="btn-edit-content"]').click()

    const editTrailSelect = page.locator('#edit-trail')
    await expect(editTrailSelect).toBeVisible({ timeout: 3000 })
    await editTrailSelect.selectOption('')
    await page.click('button[type="submit"]:has-text("Salvar")')

    // Conteúdo deve continuar existindo na seção de sem-trilha
    const orphanSection = page.locator('[data-testid="trail-section-orphan"]')
    await expect(
      orphanSection.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    ).toBeVisible({ timeout: 5000 })
  })
})

// ── Drag and Drop ──────────────────────────────────────────────────────────────

test.describe('TC-LUX — Drag and Drop', () => {
  test('TC-LUX-009: arrastar conteúdo sem trilha para uma trilha', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha DnD LUX009 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)
    const titulo = `Conteúdo DnD LUX009 ${Date.now()}`
    await criarConteudo(page, titulo)

    // Confirma que está na seção orphan antes do DnD
    const orphanSection = page.locator('[data-testid="trail-section-orphan"]')
    await expect(
      orphanSection.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    ).toBeVisible({ timeout: 3000 })

    const trailSection = page
      .locator('[data-testid="trail-section"]')
      .filter({ hasText: nomeTrilha })

    await arrastarPara(
      page,
      `[data-testid="content-card"]:has-text("${titulo}")`,
      `[data-testid="trail-section"]:has-text("${nomeTrilha}")`
    )

    // Verifica que o conteúdo foi movido para a trilha
    await expect(
      trailSection.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    ).toBeVisible({ timeout: 5000 })
  })

  test('TC-LUX-010: arrastar conteúdo de uma trilha para outra', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeA = `Trilha Orig LUX010 ${Date.now()}`
    const nomeB = `Trilha Dest LUX010 ${Date.now()}`
    await criarTrilha(page, nomeA)
    await criarTrilha(page, nomeB)

    const titulo = `Conteúdo DnD LUX010 ${Date.now()}`
    await criarConteudoNaTrilha(page, titulo, nomeA)

    const sectionA = page.locator('[data-testid="trail-section"]').filter({ hasText: nomeA })
    const sectionB = page.locator('[data-testid="trail-section"]').filter({ hasText: nomeB })

    await arrastarPara(
      page,
      `[data-testid="content-card"]:has-text("${titulo}")`,
      `[data-testid="trail-section"]:has-text("${nomeB}")`
    )

    await expect(
      sectionB.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    ).toBeVisible({ timeout: 5000 })

    await expect(
      sectionA.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    ).not.toBeVisible()
  })
})

// ── Collapse / Expand ──────────────────────────────────────────────────────────

test.describe('TC-LUX — Collapse de Trilha', () => {
  test('TC-LUX-011: recolher e expandir trilha alterna visibilidade dos cards', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha COL LUX011 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)
    const titulo = `Conteúdo COL LUX011 ${Date.now()}`
    await criarConteudoNaTrilha(page, titulo, nomeTrilha)

    const trailSection = page
      .locator('[data-testid="trail-section"]')
      .filter({ hasText: nomeTrilha })
    const collapseBtn = trailSection.locator('[data-testid^="btn-collapse-trail-"]')
    const card = trailSection.locator('[data-testid="content-card"]').filter({ hasText: titulo })

    await expect(card).toBeVisible()

    // Recolher
    await collapseBtn.click()
    await expect(card).not.toBeVisible({ timeout: 3000 })

    // Expandir
    await collapseBtn.click()
    await expect(card).toBeVisible({ timeout: 3000 })
  })

  test('TC-LUX-012: estado recolhido persiste após recarregar a página', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    const nomeTrilha = `Trilha COL LUX012 ${Date.now()}`
    await criarTrilha(page, nomeTrilha)
    const titulo = `Conteúdo COL LUX012 ${Date.now()}`
    await criarConteudoNaTrilha(page, titulo, nomeTrilha)

    const trailSection = page
      .locator('[data-testid="trail-section"]')
      .filter({ hasText: nomeTrilha })
    const collapseBtn = trailSection.locator('[data-testid^="btn-collapse-trail-"]')
    const card = trailSection.locator('[data-testid="content-card"]').filter({ hasText: titulo })

    await collapseBtn.click()
    await expect(card).not.toBeVisible({ timeout: 3000 })

    await page.reload()
    await page.waitForLoadState('networkidle')

    const trailSectionPosReload = page
      .locator('[data-testid="trail-section"]')
      .filter({ hasText: nomeTrilha })
    const cardPosReload = trailSectionPosReload
      .locator('[data-testid="content-card"]')
      .filter({ hasText: titulo })

    await expect(cardPosReload).not.toBeVisible({ timeout: 5000 })
  })
})
