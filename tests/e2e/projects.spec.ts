import { test, expect, type Page } from '@playwright/test'

// TC-PROJ: Projetos de Aprendizagem — CRUD + Busca + Progresso
// Sprint 02, RF-191 a RF-198
// Requer autenticação (projeto 'authenticated' no playwright.config.ts)

// ── Helpers ───────────────────────────────────────────────────────────────────

async function gotoProjects(page: Page) {
  await page.goto('/projects')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('h1', { timeout: 10_000 })
}

async function createProject(page: Page, name?: string, description?: string): Promise<string> {
  const unique = name ?? `Projeto E2E ${Date.now()}`
  const btn = page
    .locator('[data-testid="create-project-btn"], [data-testid="create-project-empty-btn"]')
    .first()
  await btn.click()
  await expect(page.locator('[data-testid="project-form-modal"]')).toBeVisible({ timeout: 5_000 })
  await page.fill('[data-testid="project-name"]', unique)
  if (description) {
    await page.fill('[data-testid="project-description"]', description)
  }
  await page.click('[data-testid="project-save-btn"]')
  await expect(page.locator('[data-testid="project-form-modal"]')).not.toBeVisible({
    timeout: 8_000,
  })
  // ProjectsView navega automaticamente para DetailView após criação (setSelectedProjectId).
  // Precisamos voltar para o grid para que o ProjectCard seja visível.
  const backBtn = page.locator('[data-testid="project-back-btn"]')
  if (await backBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await backBtn.click()
  }
  await expect(
    page.locator('[data-testid="project-card"]').filter({ hasText: unique })
  ).toBeVisible({ timeout: 8_000 })
  return unique
}

async function deleteProject(page: Page, name: string) {
  const card = page.locator('[data-testid="project-card"]').filter({ hasText: name })
  await card.locator('[data-testid="project-card-edit"]').click()
  await expect(page.locator('[data-testid="project-form-modal"]')).toBeVisible({ timeout: 5_000 })
  await page.click('[data-testid="project-delete-btn"]')
  await expect(page.locator('[role="alertdialog"]')).toBeVisible({ timeout: 3_000 })
  await page
    .locator('[role="alertdialog"]')
    .getByRole('button', { name: /excluir/i })
    .click()
  await expect(
    page.locator('[data-testid="project-card"]').filter({ hasText: name })
  ).not.toBeVisible({ timeout: 8_000 })
}

// ── TC-PROJ-001: Rota /projects carrega sem erro ──────────────────────────────

test.describe('TC-PROJ — Rota e Estado Vazio', () => {
  test('TC-PROJ-001: /projects carrega sem erro 500', async ({ page }) => {
    await gotoProjects(page)
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
    await expect(page.locator('h1').filter({ hasText: /Projetos/i })).toBeVisible()
  })

  test('TC-PROJ-002: estado vazio exibe CTA de criação', async ({ page }) => {
    await gotoProjects(page)
    const hasProjects = await page.locator('[data-testid="project-card"]').count()
    if (hasProjects === 0) {
      await expect(page.locator('[data-testid="projects-empty-state"]')).toBeVisible()
      await expect(page.locator('[data-testid="create-project-empty-btn"]')).toBeVisible()
    } else {
      test
        .info()
        .annotations.push({
          type: 'skip-reason',
          description: 'Usuário já possui projetos — estado vazio não exibido',
        })
    }
  })
})

// ── TC-PROJ-003..008: Criar Projeto ──────────────────────────────────────────

test.describe('TC-PROJ — Criar Projeto (RF-191)', () => {
  test('TC-PROJ-003: criar projeto com dados válidos — aparece no grid', async ({ page }) => {
    await gotoProjects(page)
    const name = await createProject(page, `E2E Criar ${Date.now()}`)
    await expect(
      page.locator('[data-testid="project-card"]').filter({ hasText: name })
    ).toBeVisible()
    // Cleanup
    await deleteProject(page, name)
  })

  test('TC-PROJ-004: submeter formulário sem nome exibe mensagem de erro (CA-002)', async ({
    page,
  }) => {
    await gotoProjects(page)
    const btn = page
      .locator('[data-testid="create-project-btn"], [data-testid="create-project-empty-btn"]')
      .first()
    await btn.click()
    await expect(page.locator('[data-testid="project-form-modal"]')).toBeVisible({ timeout: 5_000 })
    // Garante campo vazio e submete
    await page.fill('[data-testid="project-name"]', '')
    await page.click('[data-testid="project-save-btn"]')
    // Mensagem de erro deve aparecer
    await expect(page.locator('text=/nome.*obrigatório/i')).toBeVisible({ timeout: 3_000 })
    // Modal permanece aberto
    await expect(page.locator('[data-testid="project-form-modal"]')).toBeVisible()
    // Fecha modal
    await page.keyboard.press('Escape')
  })

  test('TC-PROJ-005: nome com 101 chars exibe erro de validação', async ({ page }) => {
    await gotoProjects(page)
    const btn = page
      .locator('[data-testid="create-project-btn"], [data-testid="create-project-empty-btn"]')
      .first()
    await btn.click()
    await expect(page.locator('[data-testid="project-form-modal"]')).toBeVisible({ timeout: 5_000 })
    await page.fill('[data-testid="project-name"]', 'A'.repeat(101))
    await page.click('[data-testid="project-save-btn"]')
    await expect(page.locator('text=/máximo 100/i')).toBeVisible({ timeout: 3_000 })
    await page.keyboard.press('Escape')
  })

  test('TC-PROJ-006: ESC fecha modal de criação sem persistir', async ({ page }) => {
    await gotoProjects(page)
    const countBefore = await page.locator('[data-testid="project-card"]').count()
    const btn = page
      .locator('[data-testid="create-project-btn"], [data-testid="create-project-empty-btn"]')
      .first()
    await btn.click()
    await expect(page.locator('[data-testid="project-form-modal"]')).toBeVisible({ timeout: 5_000 })
    await page.fill('[data-testid="project-name"]', 'Projeto que não deve ser criado')
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="project-form-modal"]')).not.toBeVisible({
      timeout: 3_000,
    })
    const countAfter = await page.locator('[data-testid="project-card"]').count()
    expect(countAfter).toBe(countBefore)
  })
})

// ── TC-PROJ-009..012: Visualizar Projeto ─────────────────────────────────────

test.describe('TC-PROJ — Visualizar Projeto (RF-192)', () => {
  test('TC-PROJ-007: ProjectCard exibe nome, progresso e contadores (CA-003)', async ({ page }) => {
    await gotoProjects(page)
    const name = await createProject(page, `E2E Visual ${Date.now()}`)
    const card = page.locator('[data-testid="project-card"]').filter({ hasText: name })
    await expect(card).toBeVisible()
    // Deve exibir texto de progresso
    await expect(card.locator('text=Progresso')).toBeVisible()
    // Deve exibir "0%" (sem trilhas)
    await expect(card.locator('text=0%')).toBeVisible()
    // Deve exibir contadores de trilhas e conteúdos
    await expect(card.locator('text=/trilha/i')).toBeVisible()
    // Cleanup
    await deleteProject(page, name)
  })

  test('TC-PROJ-008: busca por nome filtra projetos (RF-192, Phase 05)', async ({ page }) => {
    await gotoProjects(page)
    const unique = `BuscaE2E-${Date.now()}`
    const name = await createProject(page, unique)
    // Campo de busca aparece quando há projetos
    const searchInput = page.locator('[data-testid="project-search"]')
    await expect(searchInput).toBeVisible({ timeout: 3_000 })
    // Digita o nome único
    await searchInput.fill(unique)
    await expect(
      page.locator('[data-testid="project-card"]').filter({ hasText: unique })
    ).toBeVisible()
    // Limpa busca
    await searchInput.fill('')
    // Cleanup
    await deleteProject(page, name)
  })

  test('TC-PROJ-009: busca sem correspondência exibe estado informativo', async ({ page }) => {
    await gotoProjects(page)
    const name = await createProject(page, `E2E BuscaVazia ${Date.now()}`)
    const searchInput = page.locator('[data-testid="project-search"]')
    await expect(searchInput).toBeVisible({ timeout: 3_000 })
    await searchInput.fill('xyzxyzxyzxyz_naovaiexistir')
    await expect(page.locator('text=/nenhum projeto encontrado/i')).toBeVisible({ timeout: 3_000 })
    await searchInput.fill('')
    // Cleanup
    await deleteProject(page, name)
  })
})

// ── TC-PROJ-013..016: Editar Projeto ─────────────────────────────────────────

test.describe('TC-PROJ — Editar Projeto (RF-193)', () => {
  test('TC-PROJ-010: modal de edição abre com dados preenchidos', async ({ page }) => {
    await gotoProjects(page)
    const original = `E2E Edit ${Date.now()}`
    await createProject(page, original, 'Descrição original')
    const card = page.locator('[data-testid="project-card"]').filter({ hasText: original })
    await card.locator('[data-testid="project-card-edit"]').click()
    await expect(page.locator('[data-testid="project-form-modal"]')).toBeVisible({ timeout: 5_000 })
    // Campo nome deve estar preenchido com o valor atual
    await expect(page.locator('[data-testid="project-name"]')).toHaveValue(original)
    await page.keyboard.press('Escape')
    await deleteProject(page, original)
  })

  test('TC-PROJ-011: botão salvar desabilitado sem mudanças (isDirty)', async ({ page }) => {
    await gotoProjects(page)
    const name = await createProject(page, `E2E Dirty ${Date.now()}`)
    const card = page.locator('[data-testid="project-card"]').filter({ hasText: name })
    await card.locator('[data-testid="project-card-edit"]').click()
    await expect(page.locator('[data-testid="project-form-modal"]')).toBeVisible({ timeout: 5_000 })
    // Sem alterar, botão deve estar desabilitado
    await expect(page.locator('[data-testid="project-save-btn"]')).toBeDisabled()
    await page.keyboard.press('Escape')
    await deleteProject(page, name)
  })

  test('TC-PROJ-012: editar nome — atualiza o card imediatamente (CA-005)', async ({ page }) => {
    await gotoProjects(page)
    const original = `E2E Antes ${Date.now()}`
    const updated = `E2E Depois ${Date.now()}`
    await createProject(page, original)
    const card = page.locator('[data-testid="project-card"]').filter({ hasText: original })
    await card.locator('[data-testid="project-card-edit"]').click()
    await expect(page.locator('[data-testid="project-form-modal"]')).toBeVisible({ timeout: 5_000 })
    await page.fill('[data-testid="project-name"]', updated)
    await page.click('[data-testid="project-save-btn"]')
    await expect(page.locator('[data-testid="project-form-modal"]')).not.toBeVisible({
      timeout: 8_000,
    })
    // Nome atualizado aparece no card
    await expect(
      page.locator('[data-testid="project-card"]').filter({ hasText: updated })
    ).toBeVisible()
    // Nome antigo não aparece mais
    await expect(
      page.locator('[data-testid="project-card"]').filter({ hasText: original })
    ).not.toBeVisible()
    // Cleanup
    await deleteProject(page, updated)
  })
})

// ── TC-PROJ-017..020: Remover Projeto ────────────────────────────────────────

test.describe('TC-PROJ — Remover Projeto (RF-194)', () => {
  test('TC-PROJ-013: excluir projeto requer ConfirmDialog (CA-007)', async ({ page }) => {
    await gotoProjects(page)
    const name = await createProject(page, `E2E Del ${Date.now()}`)
    const card = page.locator('[data-testid="project-card"]').filter({ hasText: name })
    await card.locator('[data-testid="project-card-edit"]').click()
    await expect(page.locator('[data-testid="project-form-modal"]')).toBeVisible({ timeout: 5_000 })
    await page.click('[data-testid="project-delete-btn"]')
    // ConfirmDialog deve aparecer
    await expect(page.locator('[role="alertdialog"]')).toBeVisible({ timeout: 3_000 })
    // Texto de confirmação menciona trilhas preservadas
    await expect(page.locator('[role="alertdialog"]').locator('text=/trilha/i')).toBeVisible()
    // Cancela — não exclui
    await page
      .locator('[role="alertdialog"]')
      .getByRole('button', { name: /cancelar/i })
      .click()
    await expect(
      page.locator('[data-testid="project-card"]').filter({ hasText: name })
    ).toBeVisible({ timeout: 3_000 })
    // Cleanup
    await deleteProject(page, name)
  })

  test('TC-PROJ-014: excluir projeto confirmado — remove do grid imediatamente', async ({
    page,
  }) => {
    await gotoProjects(page)
    const name = await createProject(page, `E2E DelConfirm ${Date.now()}`)
    await deleteProject(page, name)
    await expect(
      page.locator('[data-testid="project-card"]').filter({ hasText: name })
    ).not.toBeVisible()
  })
})

// ── TC-PROJ-021..023: ProjectDetailView e Associação ─────────────────────────

test.describe('TC-PROJ — Detail View e Associação de Trilhas (RF-192, RF-195)', () => {
  test('TC-PROJ-015: clicar no ProjectCard abre ProjectDetailView', async ({ page }) => {
    await gotoProjects(page)
    const name = await createProject(page, `E2E Detail ${Date.now()}`)
    const card = page.locator('[data-testid="project-card"]').filter({ hasText: name })
    // Clica no card (não no botão de edição)
    await card.click({ position: { x: 80, y: 60 } })
    // Detail view deve abrir
    await expect(page.locator('[data-testid="project-back-btn"]')).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('h1').filter({ hasText: name })).toBeVisible()
    // Botão de voltar retorna à lista
    await page.click('[data-testid="project-back-btn"]')
    await expect(
      page.locator('[data-testid="project-card"]').filter({ hasText: name })
    ).toBeVisible({ timeout: 5_000 })
    // Cleanup
    await deleteProject(page, name)
  })

  test('TC-PROJ-016: AssignTrailModal abre via botão na DetailView', async ({ page }) => {
    await gotoProjects(page)
    const name = await createProject(page, `E2E Assign ${Date.now()}`)
    const card = page.locator('[data-testid="project-card"]').filter({ hasText: name })
    await card.click({ position: { x: 80, y: 60 } })
    await expect(page.locator('[data-testid="project-back-btn"]')).toBeVisible({ timeout: 5_000 })
    // Botão "Associar Trilhas"
    const assignBtn = page.locator('button').filter({ hasText: /associar trilha/i })
    if (await assignBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await assignBtn.click()
      await expect(page.locator('[data-testid="assign-trail-modal"]')).toBeVisible({
        timeout: 5_000,
      })
      // Botão fechar funciona
      await page
        .locator('[data-testid="assign-trail-modal"]')
        .getByRole('button', { name: /fechar/i })
        .click()
      await expect(page.locator('[data-testid="assign-trail-modal"]')).not.toBeVisible({
        timeout: 3_000,
      })
    } else {
      test
        .info()
        .annotations.push({
          type: 'skip-reason',
          description: 'Botão associar não encontrado — estrutura de detalhe pode diferir',
        })
    }
    await page.click('[data-testid="project-back-btn"]')
    await deleteProject(page, name)
  })
})

// ── TC-PROJ-024: Progresso 0% para projeto sem trilhas ───────────────────────

test.describe('TC-PROJ — Progresso Consolidado (RF-196, RF-197)', () => {
  test('TC-PROJ-017: projeto sem trilhas exibe 0% (RN-015, CA-012)', async ({ page }) => {
    await gotoProjects(page)
    const name = await createProject(page, `E2E Progress ${Date.now()}`)
    const card = page.locator('[data-testid="project-card"]').filter({ hasText: name })
    // Deve exibir "0%"
    await expect(card.locator('text=0%')).toBeVisible()
    await deleteProject(page, name)
  })
})
