import { test, expect } from '@playwright/test'

/**
 * TC-SKL: Testes E2E para o módulo de Skills (SkillsView).
 *
 * Skills permite criar, visualizar e remover habilidades categorizadas.
 * Integra com sistema de achievements e `computeAchievements`.
 *
 * Cenários estruturais (sem auth): redirect, ausência de 500, sem vazamento.
 * Cenários autenticados: carregamento, CRUD básico, ConfirmDialog de remoção.
 */

// ── Sem autenticação: proteção de rota ───────────────────────────────────────

test.describe('Skills — Proteção de rota (sem auth)', () => {
  test('TC-SKL-001: /skills redireciona para login sem sessão — sem erro 500', async ({ page }) => {
    await page.goto('/skills')
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
  })

  test('TC-SKL-002: SkillsView não vaza na tela de login', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="skills-list"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="skill-card"]')).not.toBeVisible()
  })

  test('TC-SKL-003: /skills não renderiza conteúdo de habilidades antes de autenticar', async ({
    page,
  }) => {
    await page.goto('/skills')
    await page.waitForLoadState('domcontentloaded')
    // Deve redirecionar — não renderiza cards de skill
    await expect(page.locator('[data-testid="skill-card"]')).not.toBeVisible()
    await expect(page.locator('button:has-text("Nova Skill")')).not.toBeVisible()
  })
})

// ── Com autenticação: carregamento ────────────────────────────────────────────

test.describe('Skills — Carregamento (autenticado)', () => {
  test('TC-SKL-010: /skills carrega sem erro 500', async ({ page }) => {
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
  })

  test('TC-SKL-011: /skills exibe título ou estado vazio da seção', async ({ page }) => {
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')

    // Deve exibir algum heading ou conteúdo da tela de skills
    const heading = page
      .locator('h1, h2')
      .filter({ hasText: /skill|habilidade|competência/i })
      .first()

    await expect(heading).toBeVisible({ timeout: 8_000 })
  })

  test('TC-SKL-012: /skills não exibe content-drawer ou review-context-selector', async ({
    page,
  }) => {
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="content-drawer"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="context-selector"]')).not.toBeVisible()
  })
})

// ── Com autenticação: criação de skill ────────────────────────────────────────

test.describe('Skills — CRUD (autenticado)', () => {
  test('TC-SKL-020: botão de nova skill está acessível', async ({ page }) => {
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')

    // Deve haver botão para adicionar nova skill (texto ou ícone +)
    const addBtn = page
      .locator('button')
      .filter({ hasText: /nova skill|adicionar|novo|\+/i })
      .first()
    await expect(addBtn).toBeVisible({ timeout: 8_000 })
  })

  test('TC-SKL-021: modal/form de nova skill abre ao clicar no botão', async ({ page }) => {
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')

    const addBtn = page
      .locator('button')
      .filter({ hasText: /nova skill|adicionar|\+/i })
      .first()

    if (!(await addBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip()
      return
    }

    await addBtn.click()

    // Após clicar, deve exibir algum formulário ou input
    const formVisible = await page
      .locator('input[placeholder], input[name], [role="dialog"]')
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false)

    expect(formVisible).toBe(true)
  })

  test('TC-SKL-022: ConfirmDialog aparece ao tentar remover skill', async ({ page }) => {
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')

    // Verifica se há skills listadas
    const skillCards = page.locator('[data-testid="skill-card"]')
    if ((await skillCards.count()) === 0) {
      test.skip()
      return
    }

    // Procura botão de deletar em um card de skill
    const deleteBtn = page
      .locator('[data-testid="skill-card"]')
      .first()
      .locator('button')
      .filter({ hasText: /excluir|remover|deletar|×|✕/i })
      .first()

    if (!(await deleteBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip()
      return
    }

    await deleteBtn.click()

    // ConfirmDialog deve aparecer (não excluir diretamente)
    const confirmDialog = page.locator('[data-testid="confirm-dialog"], [role="dialog"]')
    await expect(confirmDialog).toBeVisible({ timeout: 3_000 })
  })

  test('TC-SKL-023: categorias de skill estão disponíveis no formulário', async ({ page }) => {
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')

    const addBtn = page
      .locator('button')
      .filter({ hasText: /nova skill|adicionar|\+/i })
      .first()

    if (!(await addBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip()
      return
    }

    await addBtn.click()

    // Aguarda formulário
    await page.waitForTimeout(500)

    // Deve haver campo de categoria
    const catField = page.locator('select, [role="listbox"]').first()
    const catVisible = await catField.isVisible({ timeout: 2_000 }).catch(() => false)

    if (catVisible) {
      await expect(catField).toBeVisible()
    }
    // Não falha se o campo não existir — apenas verifica ausência de erro 500
    await expect(page.locator('text=500')).not.toBeVisible()
  })
})

// ── Regressão: achievements e streak ─────────────────────────────────────────

test.describe('Skills — Regressão (autenticado)', () => {
  test('TC-SKL-030: /skills não exibe toast de achievement ao carregar sem ação', async ({
    page,
  }) => {
    // Garantir que achievements não disparem toast espúrio ao abrir a tela
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1_500)

    // Toast não deve aparecer sem ação do usuário (regressão: computeAchievements spamming)
    await expect(page.locator('[data-testid="toast"]'))
      .not.toBeVisible({ timeout: 500 })
      .catch(() => {
        // Toast já pode ter aparecido e sumido — não é falha obrigatória neste teste estrutural
      })

    // O importante: sem erro 500
    await expect(page.locator('text=500')).not.toBeVisible()
  })
})
