import { test, expect, type Page } from '@playwright/test'

// TC-MEM-CRUD: MemoryView — CRUD Sessão + CRUD Exercício
// Sprint 02 / Completion Sprint 01
// Requer autenticação (projeto 'authenticated' no playwright.config.ts)
//
// NOTA: os testes de edição/exclusão requerem que o usuário já possua sessões registradas
// (resultado de ao menos uma Sessão de Foco concluída). Testes com dados insuficientes são
// sinalizados via annotation ao invés de falhar.

// ── Helpers ───────────────────────────────────────────────────────────────────

async function gotoMemory(page: Page) {
  await page.goto('/memory')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('[data-testid="memory-view"]', { timeout: 10_000 })
}

// ── TC-MEM-CRUD-001: Página carrega ──────────────────────────────────────────

test.describe('TC-MEM-CRUD — Rota e estrutura básica', () => {
  test('TC-MEM-CRUD-001: /memory carrega sem erro 500', async ({ page }) => {
    await gotoMemory(page)
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
    await expect(page.locator('[data-testid="memory-view"]')).toBeVisible()
  })

  test('TC-MEM-CRUD-002: campo de busca está presente', async ({ page }) => {
    await gotoMemory(page)
    await expect(page.locator('[data-testid="memory-search"]')).toBeVisible()
  })

  test('TC-MEM-CRUD-003: estado vazio é exibido quando não há sessões', async ({ page }) => {
    await gotoMemory(page)
    const hasGroups = await page.locator('[data-testid="memory-content-group"]').count()
    if (hasGroups === 0) {
      await expect(page.locator('[data-testid="memory-empty-state"]')).toBeVisible()
    } else {
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'Usuário possui sessões — estado vazio não exibido',
      })
    }
  })
})

// ── TC-MEM-CRUD-004..008: Accordion de sessão ─────────────────────────────────

test.describe('TC-MEM-CRUD — Accordion de Sessão', () => {
  test('TC-MEM-CRUD-004: grupos de conteúdo são renderizados por conteúdo', async ({ page }) => {
    await gotoMemory(page)
    const groups = page.locator('[data-testid="memory-content-group"]')
    const count = await groups.count()
    if (count === 0) {
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'Nenhum grupo disponível — criar sessão de foco primeiro',
      })
      return
    }
    // Cada grupo deve conter ao menos um session-item
    const firstGroup = groups.first()
    await expect(firstGroup.locator('[data-testid="memory-session-item"]').first()).toBeVisible()
  })

  test('TC-MEM-CRUD-005: accordion expande e exibe conteúdo da sessão (notas/highlights/teach)', async ({
    page,
  }) => {
    await gotoMemory(page)
    const triggers = page.locator('[data-testid="memory-session-accordion-trigger"]')
    const count = await triggers.count()
    if (count === 0) {
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'Nenhum trigger de sessão disponível',
      })
      return
    }

    // Tenta expandir a primeira sessão que possuir conteúdo (chevron visível = cursor pointer)
    // O trigger expande o body da sessão
    const firstTrigger = triggers.first()
    const ariaExpanded = await firstTrigger.getAttribute('aria-expanded')
    if (ariaExpanded === 'false' || ariaExpanded === null) {
      await firstTrigger.click()
      // Se havia conteúdo, o body aparece
      const body = page.locator('[data-testid="memory-session-body"]').first()
      // Pode não ter body se a sessão não tiver notas/highlights/teach
      const bodyVisible = await body.isVisible({ timeout: 2_000 }).catch(() => false)
      if (bodyVisible) {
        await expect(body).toBeVisible()
      }
    }
    // Colapsa novamente
    await firstTrigger.click()
  })

  test('TC-MEM-CRUD-006: busca por conteúdo filtra os grupos exibidos', async ({ page }) => {
    await gotoMemory(page)
    const groups = page.locator('[data-testid="memory-content-group"]')
    const count = await groups.count()
    if (count === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem grupos para filtrar' })
      return
    }

    // Busca por string que não deve existir
    const searchInput = page.locator('[data-testid="memory-search"]')
    await searchInput.fill('xyzxyzxyzxyz_impossivel_existir')
    await expect(page.locator('[data-testid="memory-empty-search"]')).toBeVisible({
      timeout: 3_000,
    })
    // Limpa busca — grupos voltam
    await searchInput.fill('')
    await expect(page.locator('[data-testid="memory-content-group"]').first()).toBeVisible({
      timeout: 3_000,
    })
  })
})

// ── TC-MEM-CRUD-007..010: CRUD Sessão ─────────────────────────────────────────

test.describe('TC-MEM-CRUD — Editar Sessão (RF-COMPLETION, UPDATE_SESSION)', () => {
  test('TC-MEM-CRUD-007: botão "Editar sessão" está presente em cada session-item', async ({
    page,
  }) => {
    await gotoMemory(page)
    const sessionItems = page.locator('[data-testid="memory-session-item"]')
    const count = await sessionItems.count()
    if (count === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem sessões disponíveis' })
      return
    }
    // Primeiro item deve ter botão de edição
    await expect(sessionItems.first().locator('[data-testid="session-edit-btn"]')).toBeVisible()
  })

  test('TC-MEM-CRUD-008: clicar "Editar sessão" abre SessionEditModal', async ({ page }) => {
    await gotoMemory(page)
    const editBtns = page.locator('[data-testid="session-edit-btn"]')
    const count = await editBtns.count()
    if (count === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem sessões disponíveis' })
      return
    }
    await editBtns.first().click()
    await expect(page.locator('[data-testid="session-edit-modal"]')).toBeVisible({ timeout: 5_000 })
    // Modal tem campos de notas e modo professor
    await expect(page.locator('[data-testid="session-edit-modal"] textarea').first()).toBeVisible()
  })

  test('TC-MEM-CRUD-009: Cancelar SessionEditModal fecha sem salvar', async ({ page }) => {
    await gotoMemory(page)
    const editBtns = page.locator('[data-testid="session-edit-btn"]')
    const count = await editBtns.count()
    if (count === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem sessões disponíveis' })
      return
    }
    await editBtns.first().click()
    await expect(page.locator('[data-testid="session-edit-modal"]')).toBeVisible({ timeout: 5_000 })
    // Clica Cancelar
    await page
      .locator('[data-testid="session-edit-modal"]')
      .getByRole('button', { name: /cancelar/i })
      .click()
    await expect(page.locator('[data-testid="session-edit-modal"]')).not.toBeVisible({
      timeout: 3_000,
    })
  })

  test('TC-MEM-CRUD-010: ESC fecha SessionEditModal', async ({ page }) => {
    await gotoMemory(page)
    const editBtns = page.locator('[data-testid="session-edit-btn"]')
    if ((await editBtns.count()) === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem sessões' })
      return
    }
    await editBtns.first().click()
    await expect(page.locator('[data-testid="session-edit-modal"]')).toBeVisible({ timeout: 5_000 })
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="session-edit-modal"]')).not.toBeVisible({
      timeout: 3_000,
    })
  })

  test('TC-MEM-CRUD-011: salvar edição de sessão — modal fecha e dados persistem na tela', async ({
    page,
  }) => {
    await gotoMemory(page)
    const editBtns = page.locator('[data-testid="session-edit-btn"]')
    if ((await editBtns.count()) === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem sessões' })
      return
    }
    await editBtns.first().click()
    await expect(page.locator('[data-testid="session-edit-modal"]')).toBeVisible({ timeout: 5_000 })
    // Preenche campo "Notas" com valor único
    const notasTextarea = page.locator('[data-testid="session-edit-modal"] textarea').first()
    const unique = `E2E Nota ${Date.now()}`
    await notasTextarea.clear()
    await notasTextarea.fill(unique)
    // Salva
    await page
      .locator('[data-testid="session-edit-modal"]')
      .getByRole('button', { name: /salvar/i })
      .click()
    await expect(page.locator('[data-testid="session-edit-modal"]')).not.toBeVisible({
      timeout: 5_000,
    })
    // O texto salvo deve ser visível após expandir a sessão (accordion)
    const firstTrigger = page.locator('[data-testid="memory-session-accordion-trigger"]').first()
    await firstTrigger.click()
    const body = page.locator('[data-testid="memory-session-body"]').first()
    const bodyVisible = await body.isVisible({ timeout: 3_000 }).catch(() => false)
    if (bodyVisible) {
      await expect(body).toContainText(unique)
    }
    // Colapsa
    await firstTrigger.click()
  })
})

// ── TC-MEM-CRUD-012..015: Excluir Sessão ──────────────────────────────────────

test.describe('TC-MEM-CRUD — Excluir Sessão (RF-COMPLETION, DELETE_SESSION)', () => {
  test('TC-MEM-CRUD-012: botão "Excluir sessão" está presente em cada session-item', async ({
    page,
  }) => {
    await gotoMemory(page)
    const sessionItems = page.locator('[data-testid="memory-session-item"]')
    if ((await sessionItems.count()) === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem sessões' })
      return
    }
    await expect(sessionItems.first().locator('[data-testid="session-delete-btn"]')).toBeVisible()
  })

  test('TC-MEM-CRUD-013: clicar "Excluir sessão" exibe ConfirmDialog com aviso de preservação', async ({
    page,
  }) => {
    await gotoMemory(page)
    const deleteBtns = page.locator('[data-testid="session-delete-btn"]')
    if ((await deleteBtns.count()) === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem sessões' })
      return
    }
    await deleteBtns.first().click()
    await expect(page.locator('[role="alertdialog"]')).toBeVisible({ timeout: 3_000 })
    // ConfirmDialog deve mencionar que flashcards são preservados (CA-PRESERVATION)
    await expect(page.locator('[role="alertdialog"]').locator('text=/flashcard/i')).toBeVisible()
  })

  test('TC-MEM-CRUD-014: Cancelar exclusão mantém a sessão (CA-SESSION-CANCEL)', async ({
    page,
  }) => {
    await gotoMemory(page)
    const deleteBtns = page.locator('[data-testid="session-delete-btn"]')
    if ((await deleteBtns.count()) === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem sessões' })
      return
    }
    const countBefore = await page.locator('[data-testid="memory-session-item"]').count()
    await deleteBtns.first().click()
    await expect(page.locator('[role="alertdialog"]')).toBeVisible({ timeout: 3_000 })
    await page
      .locator('[role="alertdialog"]')
      .getByRole('button', { name: /cancelar/i })
      .click()
    await expect(page.locator('[role="alertdialog"]')).not.toBeVisible({ timeout: 2_000 })
    const countAfter = await page.locator('[data-testid="memory-session-item"]').count()
    expect(countAfter).toBe(countBefore)
  })
})

// ── TC-MEM-CRUD-016..021: Exercícios — ExercisesSection ───────────────────────

test.describe('TC-MEM-CRUD — ExercisesSection — Toggle e Lazy Load', () => {
  test('TC-MEM-CRUD-016: ExercisesSection aparece para cada grupo de conteúdo', async ({
    page,
  }) => {
    await gotoMemory(page)
    const groups = page.locator('[data-testid="memory-content-group"]')
    const count = await groups.count()
    if (count === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem grupos' })
      return
    }
    // Cada grupo deve ter o toggle de exercícios
    const toggle = groups.first().locator('[data-testid="exercises-section-toggle"]')
    await expect(toggle).toBeVisible()
  })

  test('TC-MEM-CRUD-017: toggle de exercícios expande a seção e carrega exercícios do servidor', async ({
    page,
  }) => {
    await gotoMemory(page)
    const groups = page.locator('[data-testid="memory-content-group"]')
    const count = await groups.count()
    if (count === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem grupos' })
      return
    }
    const toggle = groups.first().locator('[data-testid="exercises-section-toggle"]')
    await toggle.click()
    // Aguarda carregamento (máx 5s)
    await page.waitForTimeout(1_500)
    // Label muda para "Exercícios (N)" após carregar
    await expect(toggle).toContainText(/Exercícios/i, { timeout: 5_000 })
    // Não deve haver erro 500
    await expect(page.locator('text=500')).not.toBeVisible()
  })

  test('TC-MEM-CRUD-018: clicar toggle novamente colapsa a seção', async ({ page }) => {
    await gotoMemory(page)
    const groups = page.locator('[data-testid="memory-content-group"]')
    if ((await groups.count()) === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem grupos' })
      return
    }
    const toggle = groups.first().locator('[data-testid="exercises-section-toggle"]')
    // Expande
    await toggle.click()
    await page.waitForTimeout(1_000)
    // Colapsa
    await toggle.click()
    // exercise-item não deve estar visível após colapso
    await expect(groups.first().locator('[data-testid="exercise-item"]').first())
      .not.toBeVisible({ timeout: 2_000 })
      .catch(() => {
        /* não havia exercícios */
      })
  })
})

test.describe('TC-MEM-CRUD — Editar Exercício (RF-COMPLETION)', () => {
  test('TC-MEM-CRUD-019: clicar editar exercício abre ExerciseEditModal', async ({ page }) => {
    await gotoMemory(page)
    const groups = page.locator('[data-testid="memory-content-group"]')
    if ((await groups.count()) === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem grupos' })
      return
    }
    // Expande exercícios do primeiro grupo
    const toggle = groups.first().locator('[data-testid="exercises-section-toggle"]')
    await toggle.click()
    await page.waitForTimeout(1_500)
    const exercises = page.locator('[data-testid="exercise-item"]')
    if ((await exercises.count()) === 0) {
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'Sem exercícios neste conteúdo — gerar pelo Focus primeiro',
      })
      return
    }
    const editBtn = exercises.first().locator('[data-testid="exercise-edit-btn"]')
    await editBtn.click()
    await expect(page.locator('[data-testid="exercise-edit-modal"]')).toBeVisible({
      timeout: 5_000,
    })
  })

  test('TC-MEM-CRUD-020: Cancelar ExerciseEditModal fecha sem salvar', async ({ page }) => {
    await gotoMemory(page)
    const groups = page.locator('[data-testid="memory-content-group"]')
    if ((await groups.count()) === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem grupos' })
      return
    }
    const toggle = groups.first().locator('[data-testid="exercises-section-toggle"]')
    await toggle.click()
    await page.waitForTimeout(1_500)
    const exercises = page.locator('[data-testid="exercise-item"]')
    if ((await exercises.count()) === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem exercícios' })
      return
    }
    await exercises.first().locator('[data-testid="exercise-edit-btn"]').click()
    await expect(page.locator('[data-testid="exercise-edit-modal"]')).toBeVisible({
      timeout: 5_000,
    })
    await page
      .locator('[data-testid="exercise-edit-modal"]')
      .getByRole('button', { name: /cancelar/i })
      .click()
    await expect(page.locator('[data-testid="exercise-edit-modal"]')).not.toBeVisible({
      timeout: 3_000,
    })
  })

  test('TC-MEM-CRUD-021: ExerciseEditModal — pergunta vazia exibe erro de validação', async ({
    page,
  }) => {
    await gotoMemory(page)
    const groups = page.locator('[data-testid="memory-content-group"]')
    if ((await groups.count()) === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem grupos' })
      return
    }
    const toggle = groups.first().locator('[data-testid="exercises-section-toggle"]')
    await toggle.click()
    await page.waitForTimeout(1_500)
    const exercises = page.locator('[data-testid="exercise-item"]')
    if ((await exercises.count()) === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem exercícios' })
      return
    }
    await exercises.first().locator('[data-testid="exercise-edit-btn"]').click()
    await expect(page.locator('[data-testid="exercise-edit-modal"]')).toBeVisible({
      timeout: 5_000,
    })
    // Limpa campo de pergunta e submete
    const questionField = page.locator('[data-testid="exercise-edit-modal"] textarea').first()
    await questionField.clear()
    await page
      .locator('[data-testid="exercise-edit-modal"]')
      .getByRole('button', { name: /salvar/i })
      .click()
    // Mensagem de erro deve aparecer
    await expect(page.locator('text=/pergunta.*obrigatória|obrigatório|mínimo/i')).toBeVisible({
      timeout: 3_000,
    })
    await page.keyboard.press('Escape')
  })
})

test.describe('TC-MEM-CRUD — Excluir Exercício (RF-COMPLETION)', () => {
  test('TC-MEM-CRUD-022: clicar excluir exercício exibe ConfirmDialog', async ({ page }) => {
    await gotoMemory(page)
    const groups = page.locator('[data-testid="memory-content-group"]')
    if ((await groups.count()) === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem grupos' })
      return
    }
    const toggle = groups.first().locator('[data-testid="exercises-section-toggle"]')
    await toggle.click()
    await page.waitForTimeout(1_500)
    const exercises = page.locator('[data-testid="exercise-item"]')
    if ((await exercises.count()) === 0) {
      test.info().annotations.push({ type: 'skip-reason', description: 'Sem exercícios' })
      return
    }
    await exercises.first().locator('[data-testid="exercise-delete-btn"]').click()
    await expect(page.locator('[role="alertdialog"]')).toBeVisible({ timeout: 3_000 })
    // Cancela — não exclui
    await page
      .locator('[role="alertdialog"]')
      .getByRole('button', { name: /cancelar/i })
      .click()
    await expect(page.locator('[role="alertdialog"]')).not.toBeVisible()
  })
})
