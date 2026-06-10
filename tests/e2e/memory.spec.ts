import { test, expect } from '@playwright/test'

// COGNITIVE-PERSISTENCE-01 E2E
// Valida: autosave, draft recovery, SaveIndicator, MemoryView (Caderno Cognitivo)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SUPABASE_URL_PATTERN = '**/rest/v1/session_drafts**'

async function irParaFocus(page: import('@playwright/test').Page) {
  await page.goto('/focus')
  await page.waitForLoadState('networkidle')

  const temConteudo = await page
    .locator('[data-testid="focus-content-item"]')
    .first()
    .isVisible({ timeout: 5_000 })
    .catch(() => false)

  if (!temConteudo) return false

  await page.locator('[data-testid="focus-content-item"]').first().click()
  await page.waitForLoadState('networkidle')
  return true
}

// ---------------------------------------------------------------------------
// TC-MEM-001 a TC-MEM-003 — Autosave e SaveIndicator
// ---------------------------------------------------------------------------
test.describe('Memória — Autosave e SaveIndicator', () => {
  test('TC-MEM-001: SaveIndicator aparece como "Salvando…" ao upsert em andamento', async ({
    page,
  }) => {
    let resolveDraft: () => void
    const draftPending = new Promise<void>((r) => (resolveDraft = r))

    // Mock da rota Supabase para session_drafts — responde lentamente
    await page.route(SUPABASE_URL_PATTERN, async (route) => {
      if (route.request().method() === 'POST') {
        await draftPending
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
      }
    })

    const entrou = await irParaFocus(page)
    if (!entrou) {
      test.skip(true, 'Sem conteúdo disponível para Sessão de Foco')
      return
    }

    const textarea = page.locator('textarea').first()
    await textarea.fill('Anotação de teste para verificar o SaveIndicator durante o salvamento')

    // Salvo indicator deve aparecer enquanto o upsert está pendente
    await expect(page.locator('[data-testid="save-indicator"]')).toBeVisible({ timeout: 3_000 })

    resolveDraft!()
  })

  test('TC-MEM-002: SaveIndicator mostra "Salvo" após upsert bem-sucedido', async ({ page }) => {
    // Mock da rota — responde imediatamente com sucesso
    await page.route(SUPABASE_URL_PATTERN, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })

    const entrou = await irParaFocus(page)
    if (!entrou) {
      test.skip(true, 'Sem conteúdo disponível para Sessão de Foco')
      return
    }

    const textarea = page.locator('textarea').first()
    await textarea.fill(
      'Anotação longa o suficiente para disparar o autosave corretamente e verificar o indicador'
    )

    await expect(page.locator('[data-testid="save-indicator"]')).toBeVisible({ timeout: 4_000 })
    await expect(page.locator('[data-testid="save-indicator"]')).toContainText(/Salv/i)
  })

  test('TC-MEM-003: banner "Rascunho restaurado" aparece quando GET retorna draft', async ({
    page,
  }) => {
    // Mock GET session_drafts — retorna draft com notas
    await page.route(SUPABASE_URL_PATTERN, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'draft-001',
              user_id: 'user-test',
              content_id: 'content-test',
              notes: 'Anotação salva anteriormente',
              highlights: ['Conceito importante'],
              teach_text: '',
              updated_at: new Date().toISOString(),
            },
          ]),
        })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      }
    })

    const entrou = await irParaFocus(page)
    if (!entrou) {
      test.skip(true, 'Sem conteúdo disponível para Sessão de Foco')
      return
    }

    await expect(page.locator('[data-testid="draft-banner"]')).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('[data-testid="draft-banner"]')).toContainText('Rascunho restaurado')
  })

  test('TC-MEM-003b: sem draft → banner NÃO aparece', async ({ page }) => {
    // Mock GET session_drafts — retorna vazio
    await page.route(SUPABASE_URL_PATTERN, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
    })

    const entrou = await irParaFocus(page)
    if (!entrou) {
      test.skip(true, 'Sem conteúdo disponível para Sessão de Foco')
      return
    }

    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="draft-banner"]')).not.toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// TC-MEM-004 a TC-MEM-008 — Caderno Cognitivo (MemoryView)
// ---------------------------------------------------------------------------
test.describe('Memória — Caderno Cognitivo', () => {
  test('TC-MEM-004: Caderno acessível via link na sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const link = page.locator('[data-testid="sidebar-memory-link"]')
    await expect(link).toBeVisible({ timeout: 5_000 })

    await link.click()
    await expect(page).toHaveURL(/\/memory/, { timeout: 5_000 })
    await expect(page.locator('[data-testid="memory-view"]')).toBeVisible({ timeout: 5_000 })
  })

  test('TC-MEM-005: Caderno mostra empty state quando não há sessões', async ({ page }) => {
    await page.goto('/memory')
    await page.waitForLoadState('networkidle')

    // Usuário sem sessões vê o estado vazio
    // (pode ou não ter sessões — verificamos se a view renderiza sem crash)
    await expect(page.locator('[data-testid="memory-view"]')).toBeVisible({ timeout: 5_000 })

    const hasSessions = await page
      .locator('[data-testid="memory-content-group"]')
      .first()
      .isVisible({ timeout: 2_000 })
      .catch(() => false)

    if (!hasSessions) {
      await expect(page.locator('[data-testid="memory-empty-state"]')).toBeVisible({
        timeout: 3_000,
      })
    }
  })

  test('TC-MEM-006: Caderno com sessões exibe grupos de conteúdo', async ({ page }) => {
    await page.goto('/memory')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-testid="memory-view"]')).toBeVisible({ timeout: 5_000 })

    const hasSessions = await page
      .locator('[data-testid="memory-content-group"]')
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false)

    if (hasSessions) {
      // Verifica que há ao menos um grupo com uma sessão
      await expect(page.locator('[data-testid="memory-session-item"]').first()).toBeVisible({
        timeout: 3_000,
      })
    } else {
      test.skip(true, 'Usuário não tem sessões registradas')
    }
  })

  test('TC-MEM-007: busca filtra grupos por título de conteúdo', async ({ page }) => {
    await page.goto('/memory')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('[data-testid="memory-search"]')
    await expect(searchInput).toBeVisible({ timeout: 5_000 })

    // Digitar algo que não existe → empty state de busca
    await searchInput.fill('xyzconteudoinexistente123')
    await page.waitForTimeout(300)

    // Não deve exibir grupos ou deve exibir o empty state de busca
    const groups = page.locator('[data-testid="memory-content-group"]')
    const count = await groups.count()
    expect(count).toBe(0)
  })

  test('TC-MEM-008: accordion expande e colapsa sessão', async ({ page }) => {
    await page.goto('/memory')
    await page.waitForLoadState('networkidle')

    const hasSessions = await page
      .locator('[data-testid="memory-session-item"]')
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false)

    if (!hasSessions) {
      test.skip(true, 'Sem sessões para testar accordion')
      return
    }

    const trigger = page.locator('[data-testid="memory-session-accordion-trigger"]').first()
    await expect(trigger).toBeVisible({ timeout: 3_000 })

    // Expandir
    await trigger.click()
    await expect(page.locator('[data-testid="memory-session-body"]').first()).toBeVisible({
      timeout: 2_000,
    })

    // Colapsar
    await trigger.click()
    await expect(page.locator('[data-testid="memory-session-body"]').first()).not.toBeVisible({
      timeout: 2_000,
    })
  })
})
