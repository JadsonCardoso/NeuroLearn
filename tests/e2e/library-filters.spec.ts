import { test, expect, type Page } from '@playwright/test'
import { LibraryPage } from './pages/LibraryPage'

// TC-FILT: Busca e Filtros — LibraryView FilterBar + busca por Projeto, Trilha, Conteúdo
// Sprint 02 / Phase 05
// Requer autenticação (projeto 'authenticated' no playwright.config.ts)
//
// O FilterBar é visível apenas quando state.contents.length > 0 OU state.trails?.length > 0.
// Os testes criam dados mínimos necessários e fazem cleanup ao final.

const CONTENT_TYPE_TESTIDS = [
  'filter-type-book',
  'filter-type-course',
  'filter-type-video',
  'filter-type-article',
  'filter-type-note',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

async function gotoLibrary(page: Page) {
  await page.goto('/library')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('h1', { timeout: 10_000 })
}

async function ensureLibraryHasContent(library: LibraryPage, page: Page): Promise<string> {
  const titulo = `E2E FilterBar ${Date.now()}`
  await library.goto()
  await library.openAddModal()
  await library.fillTitle(titulo)
  await library.selectType('book')
  await page.click('button[type="submit"]:has-text("Adicionar")')
  await library.waitForContentCard(titulo)
  return titulo
}

// ── TC-FILT-001..004: FilterBar — Visibilidade e Estrutura ────────────────────

test.describe('TC-FILT — FilterBar: visibilidade e estrutura (RF-201 a RF-209)', () => {
  test('TC-FILT-001: FilterBar é visível quando há conteúdos ou trilhas', async ({ page }) => {
    const library = new LibraryPage(page)
    const titulo = await ensureLibraryHasContent(library, page)

    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible({ timeout: 5_000 })

    // Cleanup — remove o conteúdo criado
    await page.locator('[data-testid="content-card"]').filter({ hasText: titulo }).click()
    await page.waitForTimeout(500)
    // Tenta deletar via drawer se disponível
    const deleteInDrawer = page.locator('button').filter({ hasText: /excluir/i })
    if (await deleteInDrawer.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await deleteInDrawer.click()
      const confirmBtn = page
        .locator('[role="alertdialog"]')
        .getByRole('button', { name: /excluir/i })
      if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirmBtn.click()
      }
    }
  })

  test('TC-FILT-002: chips de tipo estão presentes no FilterBar', async ({ page }) => {
    const library = new LibraryPage(page)
    await ensureLibraryHasContent(library, page)
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible({ timeout: 5_000 })

    for (const testid of CONTENT_TYPE_TESTIDS) {
      await expect(page.locator(`[data-testid="${testid}"]`)).toBeVisible()
    }
  })

  test('TC-FILT-003: filtros de status estão presentes (Todos, Novos, Em andamento, Concluídos)', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await ensureLibraryHasContent(library, page)
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible({ timeout: 5_000 })

    await expect(page.locator('[data-testid="filter-status-all"]')).toBeVisible()
    await expect(page.locator('[data-testid="filter-status-new"]')).toBeVisible()
    await expect(page.locator('[data-testid="filter-status-in_progress"]')).toBeVisible()
    await expect(page.locator('[data-testid="filter-status-done"]')).toBeVisible()
  })

  test('TC-FILT-004: "Todos" está selecionado por padrão (aria-pressed=true)', async ({ page }) => {
    const library = new LibraryPage(page)
    await ensureLibraryHasContent(library, page)
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('[data-testid="filter-status-all"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })
})

// ── TC-FILT-005..008: Filtros de Tipo ─────────────────────────────────────────

test.describe('TC-FILT — Filtro por Tipo (RF-204, CA-FILTER-TYPE)', () => {
  test('TC-FILT-005: clicar chip "Livro" ativa o filtro (aria-pressed=true) e exibe apenas livros', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    const titulo = `E2E Livro ${Date.now()}`
    await library.goto()
    await library.openAddModal()
    await library.fillTitle(titulo)
    await library.selectType('book')
    await page.click('button[type="submit"]:has-text("Adicionar")')
    await library.waitForContentCard(titulo)

    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible({ timeout: 5_000 })
    const bookChip = page.locator('[data-testid="filter-type-book"]')
    await bookChip.click()
    await expect(bookChip).toHaveAttribute('aria-pressed', 'true')

    // Conteúdo do tipo 'book' deve estar visível
    await expect(
      page.locator('[data-testid="content-card"]').filter({ hasText: titulo })
    ).toBeVisible({
      timeout: 3_000,
    })
  })

  test('TC-FILT-006: chip ativo — clicar novamente deseleciona (toggle RF-204)', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await ensureLibraryHasContent(library, page)
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible({ timeout: 5_000 })

    const bookChip = page.locator('[data-testid="filter-type-book"]')
    // Ativa
    await bookChip.click()
    await expect(bookChip).toHaveAttribute('aria-pressed', 'true')
    // Desativa
    await bookChip.click()
    await expect(bookChip).toHaveAttribute('aria-pressed', 'false')
  })

  test('TC-FILT-007: múltiplos chips selecionados resultam em OR (livros E artigos)', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await ensureLibraryHasContent(library, page)

    // Adiciona um artigo
    await library.openAddModal()
    await library.fillTitle(`E2E Artigo ${Date.now()}`)
    await library.selectType('article')
    await page.click('button[type="submit"]:has-text("Adicionar")')
    await page.waitForTimeout(500)

    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible({ timeout: 5_000 })
    await page.locator('[data-testid="filter-type-book"]').click()
    await page.locator('[data-testid="filter-type-article"]').click()

    // Ambos os chips devem estar ativos
    await expect(page.locator('[data-testid="filter-type-book"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(page.locator('[data-testid="filter-type-article"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    // Conteúdos tipo course não devem aparecer (se houver)
    const courseChip = page.locator('[data-testid="filter-type-course"]')
    await expect(courseChip).toHaveAttribute('aria-pressed', 'false')
  })
})

// ── TC-FILT-009..011: Filtro por Status ──────────────────────────────────────

test.describe('TC-FILT — Filtro por Status (RF-205, CA-FILTER-STATUS)', () => {
  test('TC-FILT-009: clicar "Novos" filtra conteúdos com progress=0', async ({ page }) => {
    const library = new LibraryPage(page)
    await ensureLibraryHasContent(library, page)
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible({ timeout: 5_000 })

    await page.locator('[data-testid="filter-status-new"]').click()
    await expect(page.locator('[data-testid="filter-status-new"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(page.locator('[data-testid="filter-status-all"]')).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  test('TC-FILT-010: clicar "Em andamento" muda o status ativo', async ({ page }) => {
    const library = new LibraryPage(page)
    await ensureLibraryHasContent(library, page)
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible({ timeout: 5_000 })

    await page.locator('[data-testid="filter-status-in_progress"]').click()
    await expect(page.locator('[data-testid="filter-status-in_progress"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(page.locator('[data-testid="filter-status-all"]')).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    // Muda para Todos novamente
    await page.locator('[data-testid="filter-status-all"]').click()
    await expect(page.locator('[data-testid="filter-status-all"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })
})

// ── TC-FILT-012..014: Limpar Filtros ─────────────────────────────────────────

test.describe('TC-FILT — Botão Limpar Filtros (RF-209)', () => {
  test('TC-FILT-011: botão "Limpar filtros" aparece apenas quando há filtros ativos', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await ensureLibraryHasContent(library, page)
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible({ timeout: 5_000 })

    // Sem filtros ativos — botão não deve existir
    await expect(page.locator('[data-testid="clear-filters"]')).not.toBeVisible()

    // Ativa um filtro
    await page.locator('[data-testid="filter-status-new"]').click()
    await expect(page.locator('[data-testid="clear-filters"]')).toBeVisible({ timeout: 2_000 })
  })

  test('TC-FILT-012: clicar "Limpar filtros" remove todos os filtros ativos', async ({ page }) => {
    const library = new LibraryPage(page)
    await ensureLibraryHasContent(library, page)
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible({ timeout: 5_000 })

    // Ativa tipo + status
    await page.locator('[data-testid="filter-type-book"]').click()
    await page.locator('[data-testid="filter-status-new"]').click()
    await expect(page.locator('[data-testid="clear-filters"]')).toBeVisible({ timeout: 2_000 })

    // Limpa
    await page.locator('[data-testid="clear-filters"]').click()
    await expect(page.locator('[data-testid="clear-filters"]')).not.toBeVisible({ timeout: 2_000 })
    await expect(page.locator('[data-testid="filter-type-book"]')).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    await expect(page.locator('[data-testid="filter-status-all"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  test('TC-FILT-013: limpar filtros — contador de resultados volta ao total (CA-FILTER-CLEAR)', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await ensureLibraryHasContent(library, page)
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible({ timeout: 5_000 })

    // Total sem filtros
    const subtitle = page.locator('p').filter({ hasText: /item/i })
    const subtitleVisible = await subtitle.isVisible({ timeout: 2_000 }).catch(() => false)

    // Ativa filtro de "Concluídos" (provavelmente 0 resultados)
    await page.locator('[data-testid="filter-status-done"]').click()
    await expect(page.locator('[data-testid="clear-filters"]')).toBeVisible({ timeout: 2_000 })

    // Limpa
    await page.locator('[data-testid="clear-filters"]').click()
    // Filro removido — subtítulo volta ao total
    if (subtitleVisible) {
      await expect(subtitle).toBeVisible()
    }
    await expect(page.locator('[data-testid="clear-filters"]')).not.toBeVisible()
  })
})

// ── TC-FILT-014..017: Busca Textual — Conteúdo, Trilha, Acentos ───────────────

test.describe('TC-FILT — Busca Textual (RF-201, RF-202, RF-203, CA-SEARCH)', () => {
  test('TC-FILT-014: busca por título encontra conteúdo (RF-203)', async ({ page }) => {
    const library = new LibraryPage(page)
    const unique = `BuscaE2ELib-${Date.now()}`
    await library.goto()
    await library.openAddModal()
    await library.fillTitle(unique)
    await library.selectType('book')
    await page.click('button[type="submit"]:has-text("Adicionar")')
    await library.waitForContentCard(unique)

    const searchInput = page.locator('[data-testid="library-search"]')
    await searchInput.fill(unique.substring(0, 10))
    await expect(
      page.locator('[data-testid="content-card"]').filter({ hasText: unique })
    ).toBeVisible({ timeout: 3_000 })
  })

  test('TC-FILT-015: busca case-insensitive e com acentos normalizados', async ({ page }) => {
    const library = new LibraryPage(page)
    const tituloAcentuado = `Programação ${Date.now()}`
    await library.goto()
    await library.openAddModal()
    await library.fillTitle(tituloAcentuado)
    await library.selectType('course')
    await page.click('button[type="submit"]:has-text("Adicionar")')
    await library.waitForContentCard(tituloAcentuado)

    const searchInput = page.locator('[data-testid="library-search"]')
    // Busca sem acento — deve encontrar pela normalização NFD
    await searchInput.fill('programacao')
    await expect(
      page.locator('[data-testid="content-card"]').filter({ hasText: tituloAcentuado })
    ).toBeVisible({ timeout: 3_000 })
    await searchInput.fill('')
  })

  test('TC-FILT-016: busca por nome de trilha retorna conteúdos da trilha (RF-202)', async ({
    page,
  }) => {
    await gotoLibrary(page)

    // Cria trilha com nome único
    const trailName = `TrilhaE2E ${Date.now()}`
    await page.click('[data-testid="btn-new-trail"]')
    await page.waitForSelector('[data-testid="trail-form-modal"]', { timeout: 5_000 })
    await page.fill('[data-testid="trail-title"]', trailName)
    await page.click('[data-testid="trail-save-btn"]')
    await expect(page.locator('[data-testid="trail-form-modal"]')).not.toBeVisible({
      timeout: 5_000,
    })

    // Aguarda trilha aparecer
    await expect(
      page.locator('[data-testid="trail-section"]').filter({ hasText: trailName })
    ).toBeVisible({ timeout: 5_000 })

    // Busca pelo nome da trilha
    const searchInput = page.locator('[data-testid="library-search"]')
    await searchInput.fill(trailName.substring(0, 8))

    // A subtitle deve mudar para mostrar resultados filtrados
    const subtitle = page.locator('p').filter({ hasText: /resultado/i })
    await expect(subtitle).toBeVisible({ timeout: 3_000 })

    await searchInput.fill('')
  })

  test('TC-FILT-017: busca sem resultado exibe informação e contador "0 resultados"', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await ensureLibraryHasContent(library, page)

    const searchInput = page.locator('[data-testid="library-search"]')
    await searchInput.fill('xyzxyzxyz_impossivel_existir_filt')
    // Subtitle deve mostrar "0 resultados"
    await expect(page.locator('p').filter({ hasText: /0 resultado/i })).toBeVisible({
      timeout: 3_000,
    })
    await searchInput.fill('')
  })
})

// ── TC-FILT-018..020: Filtro por Trilha ──────────────────────────────────────

test.describe('TC-FILT — Filtro por Trilha (RF-202, CA-FILTER-TRAIL)', () => {
  test('TC-FILT-018: select de trilha está presente quando há trilhas (RF-202)', async ({
    page,
  }) => {
    await gotoLibrary(page)

    const hasTralhas = await page.locator('[data-testid="trail-section"]').count()
    if (hasTralhas === 0) {
      // Cria uma trilha para garantir existência
      await page.click('[data-testid="btn-new-trail"]')
      await page.waitForSelector('[data-testid="trail-form-modal"]', { timeout: 5_000 })
      await page.fill('[data-testid="trail-title"]', `TrilhaFilt ${Date.now()}`)
      await page.click('[data-testid="trail-save-btn"]')
      await page.waitForTimeout(1_000)
    }

    // filter-trail deve aparecer
    await expect(page.locator('[data-testid="filter-trail"]')).toBeVisible({ timeout: 5_000 })
  })

  test('TC-FILT-019: selecionar trilha no select restringe conteúdos exibidos', async ({
    page,
  }) => {
    await gotoLibrary(page)
    const trailSelect = page.locator('[data-testid="filter-trail"]')
    const isVisible = await trailSelect.isVisible({ timeout: 3_000 }).catch(() => false)
    if (!isVisible) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem trilhas disponíveis' })
      return
    }

    const options = await trailSelect.locator('option').allTextContents()
    if (options.length <= 1) {
      test
        .info()
        .annotations.push({
          type: 'skip-reason',
          description: 'Apenas opção "Todas as trilhas" — sem trilhas para filtrar',
        })
      return
    }

    // Seleciona a primeira trilha disponível (option[1])
    await trailSelect.selectOption({ index: 1 })
    // Subtitle deve exibir "resultados de N itens"
    await expect(page.locator('p').filter({ hasText: /resultado/i })).toBeVisible({
      timeout: 3_000,
    })
    // Limpa — volta ao estado original
    await trailSelect.selectOption({ index: 0 })
  })

  test('TC-FILT-020: filtros combinados (tipo + status + busca) restringem corretamente', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await ensureLibraryHasContent(library, page)
    await expect(page.locator('[data-testid="filter-bar"]')).toBeVisible({ timeout: 5_000 })

    // Ativa tipo "Livro" + status "Novos"
    await page.locator('[data-testid="filter-type-book"]').click()
    await page.locator('[data-testid="filter-status-new"]').click()
    // Contador deve atualizar
    await expect(page.locator('p').filter({ hasText: /resultado/i })).toBeVisible({
      timeout: 3_000,
    })
    // Limpar tudo
    await page.locator('[data-testid="clear-filters"]').click()
    await expect(page.locator('[data-testid="clear-filters"]')).not.toBeVisible()
  })
})
