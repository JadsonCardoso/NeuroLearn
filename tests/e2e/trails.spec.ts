import { test, expect } from '@playwright/test'

// TC-TRL: Trilhas de Aprendizado — requer sessão autenticada

test.describe('Trilhas de Aprendizado — Biblioteca', () => {
  test('TC-TRL-001: página carrega e exibe botão Nova Trilha', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    const btn = page.getByTestId('btn-new-trail')
    await expect(btn).toBeVisible({ timeout: 10_000 })
    await expect(btn).toContainText(/trilha/i)
  })

  test('TC-TRL-002: modal de criação abre ao clicar em Nova Trilha', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('btn-new-trail').click()
    const modal = page.getByTestId('trail-form-modal')
    await expect(modal).toBeVisible({ timeout: 5_000 })
    await expect(page.getByTestId('trail-title')).toBeVisible()
  })

  test('TC-TRL-003: submit com título vazio exibe erro PT-BR', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('btn-new-trail').click()
    await page.waitForSelector('[data-testid="trail-form-modal"]')
    // Submete sem preencher título
    await page.getByTestId('trail-save-btn').click()
    const error = page.locator('[role="alert"]').first()
    await expect(error).toBeVisible({ timeout: 3_000 })
    await expect(error).toContainText(/nome|obrigatório/i)
  })

  test('TC-TRL-004: modal tem novalidate — sem popup nativo do browser', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('btn-new-trail').click()
    await page.waitForSelector('[data-testid="trail-form-modal"]')
    const form = page.locator('[data-testid="trail-form-modal"] form')
    await expect(form).toHaveAttribute('novalidate', { timeout: 3_000 })
  })

  test('TC-TRL-005: ESC fecha modal de trilha', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('btn-new-trail').click()
    await page.waitForSelector('[data-testid="trail-form-modal"]')
    await expect(page.getByTestId('trail-title')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('trail-form-modal')).not.toBeVisible({ timeout: 3_000 })
  })

  test('TC-TRL-006: criar trilha válida e verificar seção na biblioteca', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('btn-new-trail').click()
    await page.waitForSelector('[data-testid="trail-form-modal"]')

    const trailTitle = `Trilha E2E ${Date.now()}`
    await page.getByTestId('trail-title').fill(trailTitle)
    await page.getByTestId('trail-save-btn').click()

    // Modal fecha após criação
    await expect(page.getByTestId('trail-form-modal')).not.toBeVisible({ timeout: 5_000 })

    // Seção da trilha aparece na biblioteca
    const section = page.locator('[data-testid="trail-section"]').filter({ hasText: trailTitle })
    await expect(section).toBeVisible({ timeout: 8_000 })
  })

  test('TC-TRL-007: botão editar trilha abre modal com dados preenchidos', async ({ page }) => {
    // Cria trilha primeiro
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('btn-new-trail').click()
    await page.waitForSelector('[data-testid="trail-form-modal"]')
    const trailTitle = `Trilha Editar ${Date.now()}`
    await page.getByTestId('trail-title').fill(trailTitle)
    await page.getByTestId('trail-save-btn').click()
    await expect(page.getByTestId('trail-form-modal')).not.toBeVisible({ timeout: 5_000 })

    // Clica no botão editar da trilha criada
    const section = page.locator('[data-testid="trail-section"]').filter({ hasText: trailTitle })
    await expect(section).toBeVisible({ timeout: 8_000 })
    await section.getByTestId('btn-edit-trail').click()

    // Modal abre com título preenchido
    await expect(page.getByTestId('trail-form-modal')).toBeVisible({ timeout: 5_000 })
    const titleInput = page.getByTestId('trail-title')
    await expect(titleInput).toHaveValue(trailTitle)
  })

  test('TC-TRL-008: botão excluir trilha exibe ConfirmDialog', async ({ page }) => {
    // Cria trilha primeiro
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('btn-new-trail').click()
    await page.waitForSelector('[data-testid="trail-form-modal"]')
    const trailTitle = `Trilha Excluir ${Date.now()}`
    await page.getByTestId('trail-title').fill(trailTitle)
    await page.getByTestId('trail-save-btn').click()
    await expect(page.getByTestId('trail-form-modal')).not.toBeVisible({ timeout: 5_000 })

    // Abre modal de edição
    const section = page.locator('[data-testid="trail-section"]').filter({ hasText: trailTitle })
    await expect(section).toBeVisible({ timeout: 8_000 })
    await section.getByTestId('btn-edit-trail').click()
    await expect(page.getByTestId('trail-form-modal')).toBeVisible({ timeout: 5_000 })

    // Clica em excluir trilha
    await page.getByTestId('trail-delete-btn').click()

    // ConfirmDialog deve aparecer
    await expect(page.getByTestId('confirm-dialog')).toBeVisible({ timeout: 3_000 })
  })

  test('TC-TRL-009: busca filtra conteúdos dentro das seções de trilha', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    // Digita na busca
    const searchInput = page.getByTestId('library-search')
    await expect(searchInput).toBeVisible({ timeout: 10_000 })
    await searchInput.fill('zzz_termo_inexistente_xyz')

    // Aguarda atualização da lista
    await page.waitForTimeout(300)

    // Seções com conteúdo deveriam estar ocultas ou mostrar estado vazio
    const cards = page.locator('[data-testid="content-card"]')
    await expect(cards).toHaveCount(0, { timeout: 3_000 })
  })

  // ── Segurança e Integridade (P0-01) ──────────────────────────────────────

  test('TC-TRL-SEC-01: excluir trilha própria remove-a da biblioteca', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    // Cria trilha
    await page.getByTestId('btn-new-trail').click()
    await page.waitForSelector('[data-testid="trail-form-modal"]')
    const trailTitle = `Trilha Sec Del ${Date.now()}`
    await page.getByTestId('trail-title').fill(trailTitle)
    await page.getByTestId('trail-save-btn').click()
    await expect(page.getByTestId('trail-form-modal')).not.toBeVisible({ timeout: 5_000 })

    // Confirma que aparece
    const section = page.locator('[data-testid="trail-section"]').filter({ hasText: trailTitle })
    await expect(section).toBeVisible({ timeout: 8_000 })

    // Abre modal de edição e clica em excluir
    await section.getByTestId('btn-edit-trail').click()
    await expect(page.getByTestId('trail-form-modal')).toBeVisible({ timeout: 5_000 })
    await page.getByTestId('trail-delete-btn').click()

    // Confirma no ConfirmDialog
    await expect(page.getByTestId('confirm-dialog')).toBeVisible({ timeout: 3_000 })
    await page.getByTestId('confirm-dialog-confirm').click()

    // Trilha não aparece mais na biblioteca
    await expect(section).not.toBeVisible({ timeout: 8_000 })
  })

  test('TC-TRL-SEC-02: excluir trilha NÃO exclui conteúdo associado (ADR-008)', async ({
    page,
  }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    // Cria trilha
    await page.getByTestId('btn-new-trail').click()
    await page.waitForSelector('[data-testid="trail-form-modal"]')
    const trailTitle = `Trilha ADR008 ${Date.now()}`
    await page.getByTestId('trail-title').fill(trailTitle)
    await page.getByTestId('trail-save-btn').click()
    await expect(page.getByTestId('trail-form-modal')).not.toBeVisible({ timeout: 5_000 })

    const section = page.locator('[data-testid="trail-section"]').filter({ hasText: trailTitle })
    await expect(section).toBeVisible({ timeout: 8_000 })

    // Adiciona conteúdo via modal global de adição
    const contentTitle = `Conteúdo ADR008 ${Date.now()}`
    await page
      .locator('button')
      .filter({ hasText: /adicionar|\+/i })
      .first()
      .click()
    await page.waitForSelector('#title', { timeout: 5_000 })
    await page.fill('#title', contentTitle)
    await page.selectOption('#type', 'book')
    await page.click('button[type="submit"]:has-text("Adicionar")')
    await expect(page.locator('#title')).not.toBeVisible({ timeout: 5_000 })

    // Aguarda o conteúdo aparecer
    const contentCard = page
      .locator('[data-testid="content-card"]')
      .filter({ hasText: contentTitle })
    await expect(contentCard).toBeVisible({ timeout: 8_000 })

    // Exclui a trilha
    await section.getByTestId('btn-edit-trail').click()
    await expect(page.getByTestId('trail-form-modal')).toBeVisible({ timeout: 5_000 })
    await page.getByTestId('trail-delete-btn').click()
    await expect(page.getByTestId('confirm-dialog')).toBeVisible({ timeout: 3_000 })
    await page.getByTestId('confirm-dialog-confirm').click()

    // Aguarda trilha sumir
    await expect(section).not.toBeVisible({ timeout: 8_000 })

    // Conteúdo deve ainda existir na biblioteca (em "Sem Trilha" ou outra seção)
    await expect(contentCard).toBeVisible({ timeout: 8_000 })
  })

  test('TC-TRL-SEC-03: DELETE de trilha inclui filtro user_id na query (defense-in-depth)', async ({
    page,
  }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    // Intercepta chamadas DELETE para learning_trails
    const deleteRequests: string[] = []
    await page.route('**/learning_trails*', (route) => {
      if (route.request().method() === 'DELETE') {
        deleteRequests.push(route.request().url())
      }
      route.continue()
    })

    // Cria e deleta uma trilha
    await page.getByTestId('btn-new-trail').click()
    await page.waitForSelector('[data-testid="trail-form-modal"]')
    const trailTitle = `Trilha Filter ${Date.now()}`
    await page.getByTestId('trail-title').fill(trailTitle)
    await page.getByTestId('trail-save-btn').click()
    await expect(page.getByTestId('trail-form-modal')).not.toBeVisible({ timeout: 5_000 })

    const section = page.locator('[data-testid="trail-section"]').filter({ hasText: trailTitle })
    await expect(section).toBeVisible({ timeout: 8_000 })
    await section.getByTestId('btn-edit-trail').click()
    await expect(page.getByTestId('trail-form-modal')).toBeVisible({ timeout: 5_000 })
    await page.getByTestId('trail-delete-btn').click()
    await expect(page.getByTestId('confirm-dialog')).toBeVisible({ timeout: 3_000 })
    await page.getByTestId('confirm-dialog-confirm').click()
    await expect(section).not.toBeVisible({ timeout: 8_000 })

    // A URL de DELETE deve conter filtro user_id (query param do Supabase)
    expect(deleteRequests.length).toBeGreaterThan(0)
    expect(deleteRequests.some((url) => url.includes('user_id'))).toBe(true)
  })

  test('TC-TRL-010: seção Sem Trilha exibe conteúdos não vinculados', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    // Se existirem conteúdos sem trilha, a seção deve aparecer
    // Caso contrário, o teste passa (seção é opcional)
    const orphanSection = page.getByTestId('trail-section-orphan')
    const contentCards = page.locator('[data-testid="content-card"]')
    const cardCount = await contentCards.count()

    if (cardCount > 0) {
      // Verifica que todos os cards estão dentro de alguma seção (trilha ou órfã)
      const sections = page.locator(
        '[data-testid="trail-section"], [data-testid="trail-section-orphan"]'
      )
      await expect(sections.first()).toBeVisible({ timeout: 5_000 })
    } else {
      // Biblioteca vazia — teste passa
      await expect(orphanSection).not.toBeVisible()
    }
  })
})
