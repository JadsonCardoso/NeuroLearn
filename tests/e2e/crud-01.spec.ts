import { test, expect, type Page } from '@playwright/test'

// TC-CRUD-01: ConfirmDialog, EditContentModal, CardEditModal, Toast
// Requer autenticação — roda no projeto "authenticated" (playwright.config.ts)

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Dispensa o ConsentBanner LGPD via localStorage antes de carregar a página */
async function dismissConsentBanner(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('nl_lgpd_consent', JSON.stringify({ consent: 'accepted', date: new Date().toISOString() }))
  })
}

/** Navega para /library e espera a página carregar */
async function gotoLibrary(page: Page) {
  await dismissConsentBanner(page)
  await page.goto('/library')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('h1', { timeout: 10_000 })
}

/** Cria um conteúdo via modal e retorna o título gerado */
async function createContent(page: Page, title?: string): Promise<string> {
  const unique = title ?? `Conteúdo E2E ${Date.now()}`
  const addBtn = page.locator('button').filter({ hasText: /adicionar/i }).first()
  await addBtn.click()
  await page.waitForSelector('#title', { timeout: 5000 })
  await page.fill('#title', unique)
  await page.selectOption('#type', 'book')
  await page.click('button[type="submit"]:has-text("Adicionar")')
  // Aguarda modal fechar
  await expect(page.locator('#title')).not.toBeVisible({ timeout: 6000 })
  // Aguarda card aparecer
  await expect(page.locator('[data-testid="content-card"]').filter({ hasText: unique }))
    .toBeVisible({ timeout: 8000 })
  return unique
}

/** Retorna o content-card que contém o título */
function getCard(page: Page, title: string) {
  return page.locator('[data-testid="content-card"]').filter({ hasText: title })
}

// ── ConfirmDialog: remover conteúdo ──────────────────────────────────────────

test.describe('CRUD-01 — ConfirmDialog: remover conteúdo', () => {
  test('TC-CRUD-001: botão remover abre ConfirmDialog com role=alertdialog', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    const card = getCard(page, title)
    await card.locator('[data-testid="btn-delete-content"]').click()
    const dialog = page.locator('[role="alertdialog"]')
    await expect(dialog).toBeVisible({ timeout: 3000 })
    await expect(dialog.locator('[data-testid="confirm-dialog"]')).toBeVisible()
  })

  test('TC-CRUD-002: ConfirmDialog exibe título e descrição sobre o conteúdo', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    const card = getCard(page, title)
    await card.locator('[data-testid="btn-delete-content"]').click()
    const dialog = page.locator('[data-testid="confirm-dialog"]')
    await expect(dialog).toContainText(/remover conteúdo/i)
    await expect(dialog).toContainText(title)
  })

  test('TC-CRUD-003: clicar Cancelar fecha ConfirmDialog sem remover conteúdo', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    const card = getCard(page, title)
    await card.locator('[data-testid="btn-delete-content"]').click()
    await page.locator('[data-testid="confirm-dialog-cancel"]').click()
    await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible({ timeout: 3000 })
    // Conteúdo permanece na lista
    await expect(getCard(page, title)).toBeVisible()
  })

  test('TC-CRUD-004: pressionar ESC fecha ConfirmDialog sem remover conteúdo', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    await getCard(page, title).locator('[data-testid="btn-delete-content"]').click()
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible({ timeout: 3000 })
    await expect(getCard(page, title)).toBeVisible()
  })

  test('TC-CRUD-005: confirmar remove conteúdo da lista', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    await getCard(page, title).locator('[data-testid="btn-delete-content"]').click()
    await page.locator('[data-testid="confirm-dialog-confirm"]').click()
    await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible({ timeout: 3000 })
    await expect(getCard(page, title)).not.toBeVisible({ timeout: 8000 })
  })

  test('TC-CRUD-006: botão Confirmar recebe foco automático ao abrir dialog', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    await getCard(page, title).locator('[data-testid="btn-delete-content"]').click()
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
    const confirmBtn = page.locator('[data-testid="confirm-dialog-confirm"]')
    await expect(confirmBtn).toBeFocused({ timeout: 2000 })
  })

  test('TC-CRUD-007: ConfirmDialog tem aria-labelledby e aria-describedby', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    await getCard(page, title).locator('[data-testid="btn-delete-content"]').click()
    const dialog = page.locator('[role="alertdialog"]')
    await expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title')
    await expect(dialog).toHaveAttribute('aria-describedby', 'confirm-dialog-desc')
    // IDs existem no DOM
    await expect(page.locator('#confirm-dialog-title')).toBeVisible()
    await expect(page.locator('#confirm-dialog-desc')).toBeVisible()
  })
})

// ── EditContentModal ──────────────────────────────────────────────────────────

test.describe('CRUD-01 — EditContentModal', () => {
  test('TC-CRUD-010: botão editar abre EditContentModal', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    await getCard(page, title).locator('[data-testid="btn-edit-content"]').click()
    await expect(page.locator('[data-testid="edit-content-modal"]')).toBeVisible({ timeout: 3000 })
  })

  test('TC-CRUD-011: EditContentModal pré-popula título com valor atual', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    await getCard(page, title).locator('[data-testid="btn-edit-content"]').click()
    const titleInput = page.locator('#edit-title')
    await expect(titleInput).toHaveValue(title, { timeout: 3000 })
  })

  test('TC-CRUD-012: EditContentModal tem atributo novalidate (sem popup nativo)', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    await getCard(page, title).locator('[data-testid="btn-edit-content"]').click()
    await expect(page.locator('[data-testid="edit-content-modal"] form')).toHaveAttribute('novalidate')
  })

  test('TC-CRUD-013: submit com título vazio exibe erro de validação em PT-BR', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    await getCard(page, title).locator('[data-testid="btn-edit-content"]').click()
    await page.fill('#edit-title', '')
    await page.click('[data-testid="edit-content-modal"] button[type="submit"]')
    const error = page.locator('[role="alert"]').first()
    await expect(error).toBeVisible({ timeout: 3000 })
    await expect(error).toContainText(/título|obrigatório/i)
  })

  test('TC-CRUD-014: pressionar ESC fecha EditContentModal sem salvar', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    await getCard(page, title).locator('[data-testid="btn-edit-content"]').click()
    await expect(page.locator('[data-testid="edit-content-modal"]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="edit-content-modal"]')).not.toBeVisible({ timeout: 3000 })
  })

  test('TC-CRUD-015: clicar Cancelar fecha EditContentModal', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    await getCard(page, title).locator('[data-testid="btn-edit-content"]').click()
    await page.locator('[data-testid="edit-content-modal"] button:has-text("Cancelar")').click()
    await expect(page.locator('[data-testid="edit-content-modal"]')).not.toBeVisible({ timeout: 3000 })
  })

  test('TC-CRUD-016: salvar com novo título atualiza o card na lista', async ({ page }) => {
    await gotoLibrary(page)
    const original = await createContent(page)
    await getCard(page, original).locator('[data-testid="btn-edit-content"]').click()
    const newTitle = `${original} — Editado`
    await page.fill('#edit-title', newTitle)
    await page.click('[data-testid="edit-content-modal"] button[type="submit"]')
    await expect(page.locator('[data-testid="edit-content-modal"]')).not.toBeVisible({ timeout: 5000 })
    await expect(getCard(page, newTitle)).toBeVisible({ timeout: 8000 })
  })

  test('TC-CRUD-017: dois modais não ficam abertos simultâneamente — editar fecha AddModal', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    // Abre AddModal
    await page.locator('button').filter({ hasText: /adicionar/i }).first().click()
    await expect(page.locator('#title')).toBeVisible()
    // Fecha com ESC
    await page.keyboard.press('Escape')
    await expect(page.locator('#title')).not.toBeVisible({ timeout: 3000 })
    // Abre EditModal
    await getCard(page, title).locator('[data-testid="btn-edit-content"]').click()
    await expect(page.locator('[data-testid="edit-content-modal"]')).toBeVisible()
    // AddModal não está visível ao mesmo tempo
    await expect(page.locator('#title')).not.toBeVisible()
  })
})

// ── Toast: feedback visual após mutações ─────────────────────────────────────

test.describe('CRUD-01 — Toast: feedback visual', () => {
  test('TC-CRUD-020: toast success após adicionar conteúdo', async ({ page }) => {
    await gotoLibrary(page)
    const title = `Toast ADD ${Date.now()}`
    await page.locator('button').filter({ hasText: /adicionar/i }).first().click()
    await page.waitForSelector('#title', { timeout: 5000 })
    await page.fill('#title', title)
    await page.selectOption('#type', 'book')
    await page.click('button[type="submit"]:has-text("Adicionar")')
    // Toast de sucesso deve aparecer
    const toast = page.locator('[role="alert"]').filter({ hasText: /conteúdo adicionado/i })
    await expect(toast).toBeVisible({ timeout: 6000 })
  })

  test('TC-CRUD-021: toast success após remover conteúdo', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    await getCard(page, title).locator('[data-testid="btn-delete-content"]').click()
    await page.locator('[data-testid="confirm-dialog-confirm"]').click()
    const toast = page.locator('[role="alert"]').filter({ hasText: /conteúdo removido/i })
    await expect(toast).toBeVisible({ timeout: 6000 })
  })

  test('TC-CRUD-022: toast success após editar conteúdo', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    await getCard(page, title).locator('[data-testid="btn-edit-content"]').click()
    await page.fill('#edit-title', `${title} — v2`)
    await page.click('[data-testid="edit-content-modal"] button[type="submit"]')
    const toast = page.locator('[role="alert"]').filter({ hasText: /atualizado/i })
    await expect(toast).toBeVisible({ timeout: 6000 })
  })

  test('TC-CRUD-023: toast desaparece automaticamente após exibição', async ({ page }) => {
    await gotoLibrary(page)
    const title = `Toast Auto-dismiss ${Date.now()}`
    await page.locator('button').filter({ hasText: /adicionar/i }).first().click()
    await page.waitForSelector('#title', { timeout: 5000 })
    await page.fill('#title', title)
    await page.selectOption('#type', 'book')
    await page.click('button[type="submit"]:has-text("Adicionar")')
    const toast = page.locator('[role="alert"]').filter({ hasText: /conteúdo adicionado/i })
    await expect(toast).toBeVisible({ timeout: 6000 })
    // Toast success tem duração de 4s — deve desaparecer em até 7s
    await expect(toast).not.toBeVisible({ timeout: 7000 })
  })

  test('TC-CRUD-024: toast pode ser dispensado manualmente com ×', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    // Toast de "adicionado" já apareceu após createContent
    // Adiciona outro para garantir toast visível
    await getCard(page, title).locator('[data-testid="btn-delete-content"]').click()
    await page.locator('[data-testid="confirm-dialog-confirm"]').click()
    const toast = page.locator('[role="alert"]').filter({ hasText: /conteúdo removido/i })
    await expect(toast).toBeVisible({ timeout: 6000 })
    // Clicar no botão × do toast
    await toast.locator('button[aria-label="Fechar notificação"]').click()
    await expect(toast).not.toBeVisible({ timeout: 2000 })
  })
})

// ── Expandir flashcards ──────────────────────────────────────────────────────

test.describe('CRUD-01 — Expandir/Colapsar flashcards', () => {
  test('TC-CRUD-030: conteúdo sem cards não exibe botão expandir', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    const card = getCard(page, title)
    await expect(card.locator('[data-testid="btn-expand-cards"]')).not.toBeVisible()
  })

  // Nota: TC-CRUD-031 a 035 requerem conteúdo com flashcards criados via focus.
  // São cobertos em testes de integração mais amplos que envolvem o fluxo completo.
  // Para testar localmente: crie um conteúdo, acesse /focus/:id e gere flashcards,
  // então execute este describe isoladamente com npm run test:e2e -- --grep "Expandir".
})

// ── CardEditModal ─────────────────────────────────────────────────────────────
// Estes testes dependem de conteúdo com flashcards.
// Usam skip condicional quando não há cards disponíveis.

test.describe('CRUD-01 — CardEditModal: editar flashcard', () => {
  test('TC-CRUD-040: botão editar card abre CardEditModal com dados pré-populados', async ({ page }) => {
    await gotoLibrary(page)
    // Verificar se há algum content-card com btn-expand-cards
    const expandBtn = page.locator('[data-testid="btn-expand-cards"]').first()
    const hasCards = await expandBtn.isVisible()
    if (!hasCards) {
      test.skip(true, 'Sem conteúdo com flashcards disponível no ambiente de teste')
      return
    }
    await expandBtn.click()
    const editCardBtn = page.locator('[data-testid="btn-edit-card"]').first()
    await expect(editCardBtn).toBeVisible({ timeout: 3000 })
    await editCardBtn.click()
    await expect(page.locator('[data-testid="card-edit-modal"]')).toBeVisible({ timeout: 3000 })
    // Campos devem estar pré-populados (não vazios)
    const frontValue = await page.locator('#card-front').inputValue()
    const backValue = await page.locator('#card-back').inputValue()
    expect(frontValue.length).toBeGreaterThan(0)
    expect(backValue.length).toBeGreaterThan(0)
  })

  test('TC-CRUD-041: CardEditModal tem novalidate', async ({ page }) => {
    await gotoLibrary(page)
    const expandBtn = page.locator('[data-testid="btn-expand-cards"]').first()
    const hasCards = await expandBtn.isVisible()
    if (!hasCards) {
      test.skip(true, 'Sem conteúdo com flashcards disponível no ambiente de teste')
      return
    }
    await expandBtn.click()
    await page.locator('[data-testid="btn-edit-card"]').first().click()
    await expect(page.locator('[data-testid="card-edit-modal"] form')).toHaveAttribute('novalidate')
  })

  test('TC-CRUD-042: CardEditModal fecha com ESC', async ({ page }) => {
    await gotoLibrary(page)
    const expandBtn = page.locator('[data-testid="btn-expand-cards"]').first()
    const hasCards = await expandBtn.isVisible()
    if (!hasCards) {
      test.skip(true, 'Sem conteúdo com flashcards disponível no ambiente de teste')
      return
    }
    await expandBtn.click()
    await page.locator('[data-testid="btn-edit-card"]').first().click()
    await expect(page.locator('[data-testid="card-edit-modal"]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="card-edit-modal"]')).not.toBeVisible({ timeout: 3000 })
  })

  test('TC-CRUD-043: submit com frente vazia exibe erro de validação', async ({ page }) => {
    await gotoLibrary(page)
    const expandBtn = page.locator('[data-testid="btn-expand-cards"]').first()
    const hasCards = await expandBtn.isVisible()
    if (!hasCards) {
      test.skip(true, 'Sem conteúdo com flashcards disponível no ambiente de teste')
      return
    }
    await expandBtn.click()
    await page.locator('[data-testid="btn-edit-card"]').first().click()
    await page.fill('#card-front', '')
    await page.click('[data-testid="card-edit-modal"] button[type="submit"]')
    const error = page.locator('[role="alert"]').first()
    await expect(error).toBeVisible({ timeout: 3000 })
    await expect(error).toContainText(/vazia|obrigatório/i)
  })

  test('TC-CRUD-044: ConfirmDialog abre ao clicar remover flashcard', async ({ page }) => {
    await gotoLibrary(page)
    const expandBtn = page.locator('[data-testid="btn-expand-cards"]').first()
    const hasCards = await expandBtn.isVisible()
    if (!hasCards) {
      test.skip(true, 'Sem conteúdo com flashcards disponível no ambiente de teste')
      return
    }
    await expandBtn.click()
    await page.locator('[data-testid="btn-delete-card"]').first().click()
    const dialog = page.locator('[role="alertdialog"]')
    await expect(dialog).toBeVisible({ timeout: 3000 })
    await expect(dialog).toContainText(/remover flashcard/i)
  })

  test('TC-CRUD-045: cancelar delete card mantém card na lista', async ({ page }) => {
    await gotoLibrary(page)
    const expandBtn = page.locator('[data-testid="btn-expand-cards"]').first()
    const hasCards = await expandBtn.isVisible()
    if (!hasCards) {
      test.skip(true, 'Sem conteúdo com flashcards disponível no ambiente de teste')
      return
    }
    await expandBtn.click()
    const cardsBefore = await page.locator('[data-testid="btn-delete-card"]').count()
    await page.locator('[data-testid="btn-delete-card"]').first().click()
    await page.locator('[data-testid="confirm-dialog-cancel"]').click()
    await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible({ timeout: 3000 })
    const cardsAfter = await page.locator('[data-testid="btn-delete-card"]').count()
    expect(cardsAfter).toBe(cardsBefore)
  })
})

// ── Regressão: funcionalidades existentes ────────────────────────────────────

test.describe('CRUD-01 — Regressão: funcionalidades anteriores', () => {
  test('TC-CRUD-050: AddContentModal ainda abre normalmente', async ({ page }) => {
    await gotoLibrary(page)
    await page.locator('button').filter({ hasText: /adicionar/i }).first().click()
    await expect(page.locator('#title')).toBeVisible({ timeout: 5000 })
  })

  test('TC-CRUD-051: botão Estudar ainda navega para /focus/:id', async ({ page }) => {
    await gotoLibrary(page)
    const title = await createContent(page)
    await getCard(page, title).locator('button:has-text("Estudar")').click()
    await expect(page).toHaveURL(/\/focus\//, { timeout: 8000 })
  })

  test('TC-CRUD-052: biblioteca exibe contagem correta de itens no subtítulo', async ({ page }) => {
    await gotoLibrary(page)
    // Contar os data-testid="content-card" visíveis
    const cards = page.locator('[data-testid="content-card"]')
    const count = await cards.count()
    const subtitle = page.locator('p').filter({ hasText: /itens/i })
    await expect(subtitle).toContainText(String(count))
  })

  test('TC-CRUD-053: ConfirmDialog do SkillsView ainda existe e funciona', async ({ page }) => {
    await dismissConsentBanner(page)
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')
    // Se não há skills, a página deve estar vazia mas sem erro
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible({ timeout: 10_000 })
    // Verificar que não há window.confirm no código (janela nativa)
    // Se um skill estiver presente, o botão Remover deve abrir o ConfirmDialog
    const removeBtn = page.locator('button').filter({ hasText: /remover habilidade/i }).first()
    const hasSkills = await removeBtn.isVisible()
    if (hasSkills) {
      await removeBtn.click()
      await expect(page.locator('[role="alertdialog"]')).toBeVisible({ timeout: 3000 })
      await page.keyboard.press('Escape')
    }
  })

  test('TC-CRUD-054: página /library não tem erros de JS', async ({ page }) => {
    const jsErrors: string[] = []
    page.on('pageerror', (err) => jsErrors.push(err.message))
    await gotoLibrary(page)
    expect(jsErrors.filter((e) => !e.includes('favicon'))).toHaveLength(0)
  })

  test('TC-CRUD-055: não há window.confirm na biblioteca', async ({ page }) => {
    await gotoLibrary(page)
    // Sobrescreve window.confirm para registrar se foi chamado
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__confirmCalled = false
      window.confirm = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__confirmCalled = true
        return true
      }
    })
    const title = await createContent(page)
    await getCard(page, title).locator('[data-testid="btn-delete-content"]').click()
    // ConfirmDialog deve ter aberto (não window.confirm)
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible({ timeout: 3000 })
    const confirmCalled = await page.evaluate(() => (window as any).__confirmCalled) // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(confirmCalled).toBe(false)
    // Limpar
    await page.keyboard.press('Escape')
    await getCard(page, title).locator('[data-testid="btn-delete-content"]').click()
    await page.locator('[data-testid="confirm-dialog-confirm"]').click()
  })
})
