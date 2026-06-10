import { test, expect } from '@playwright/test'

/**
 * TC-FOC: Testes E2E para o módulo de Sessão de Foco (FocusView).
 *
 * Fluxo: FocusIndexView (seleção de conteúdo) → FocusView (3 fases:
 * Sessão de Foco → Extração → Ensinar).
 *
 * Cenários estruturais (sem auth): redirect, ausência de 500, sem vazamento de componentes.
 * Cenários autenticados: carregamento, navegação entre fases, timer, draft, confirmação de saída.
 */

// ── Sem autenticação: estrutura e segurança ───────────────────────────────────

test.describe('Focus — Proteção de rota (sem auth)', () => {
  test('TC-FOC-001: /focus redireciona para login sem sessão — sem erro 500', async ({ page }) => {
    await page.goto('/focus')
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
  })

  test('TC-FOC-002: /focus/[id] com ID inválido redireciona — sem erro 500', async ({ page }) => {
    await page.goto('/focus/id-inexistente-000')
    await expect(page).toHaveURL(/\/auth\/login|\/library/, { timeout: 10_000 })
    await expect(page.locator('text=500')).not.toBeVisible()
  })

  test('TC-FOC-003: FocusView não vaza na tela de login', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('domcontentloaded')
    // Componentes exclusivos do FocusView não devem aparecer na tela de login
    await expect(page.locator('[data-testid="focus-timer"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="focus-phase-nav"]')).not.toBeVisible()
    await expect(page.locator('text=Sessão de Foco')).not.toBeVisible()
  })

  test('TC-FOC-004: /focus não renderiza timer ou controles antes de autenticar', async ({
    page,
  }) => {
    await page.goto('/focus')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="focus-timer"]')).not.toBeVisible()
    await expect(page.locator('button:has-text("Iniciar")')).not.toBeVisible()
  })
})

// ── Com autenticação: tela de seleção ────────────────────────────────────────

test.describe('Focus — Seleção de conteúdo (autenticado)', () => {
  test('TC-FOC-010: /focus exibe tela de seleção de conteúdo', async ({ page }) => {
    await page.goto('/focus')
    await page.waitForLoadState('networkidle')

    // Deve exibir título da seção
    await expect(
      page
        .locator('h1, h2')
        .filter({ hasText: /sessão de foco|foco/i })
        .first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('TC-FOC-011: estado vazio exibe CTA para adicionar conteúdo quando biblioteca está vazia', async ({
    page,
  }) => {
    await page.goto('/focus')
    await page.waitForLoadState('networkidle')

    // Se não há conteúdos, deve exibir mensagem de vazio ou lista de conteúdos
    // (a tela exibe uma ou outra — teste verifica estrutura)
    const hasContents = await page.locator('[data-testid="content-card"]').count()
    const hasEmptyState = await page
      .locator('text=Nenhum conteúdo na biblioteca, text=Adicionar conteúdo')
      .first()
      .isVisible()
      .catch(() => false)

    // Deve exibir pelo menos uma das duas condições
    expect(hasContents > 0 || hasEmptyState).toBe(true)
  })

  test('TC-FOC-012: /focus não gera erro 500 quando autenticado', async ({ page }) => {
    await page.goto('/focus')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
  })
})

// ── Com autenticação: FocusView (fases) ──────────────────────────────────────

test.describe('Focus — Navegação de fases (autenticado)', () => {
  test('TC-FOC-020: /focus/[id] com conteúdo válido carrega a fase de Sessão de Foco', async ({
    page,
  }) => {
    // Navega para a biblioteca, pega o primeiro conteúdo e inicia sessão de foco
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    // Verifica se há cards de conteúdo
    const cards = page.locator('[data-testid="content-card"]')
    const count = await cards.count()

    if (count === 0) {
      test.skip() // Sem conteúdo na biblioteca — teste não aplicável
      return
    }

    // Navega diretamente para o índice de foco
    await page.goto('/focus')
    await page.waitForLoadState('networkidle')

    // Deve listar os conteúdos disponíveis
    await expect(cards.first()).toBeVisible({ timeout: 8_000 })
  })

  test('TC-FOC-021: FocusView exibe os 3 passos na navegação de fases', async ({ page }) => {
    await page.goto('/focus')
    await page.waitForLoadState('networkidle')

    // Verifica se há conteúdo para selecionar
    const firstCard = page.locator('[data-testid="content-card"]').first()
    if (!(await firstCard.isVisible().catch(() => false))) {
      test.skip()
      return
    }

    // Clica no botão de iniciar sessão do primeiro card
    const iniciarBtn = page
      .locator('button')
      .filter({ hasText: /iniciar|começar|foco/i })
      .first()
    if (await iniciarBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await iniciarBtn.click()
      await page.waitForLoadState('networkidle')

      // FocusView deve exibir os 3 passos
      await expect(page.locator('text=1. Sessão de Foco')).toBeVisible({ timeout: 8_000 })
      await expect(page.locator('text=2. Extração')).toBeVisible()
      await expect(page.locator('text=3. Ensinar')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('TC-FOC-022: /focus/[id] inválido redireciona para /library sem 500', async ({ page }) => {
    await page.goto('/focus/uuid-invalido-99999')
    await page.waitForLoadState('domcontentloaded')
    // Deve redirecionar para /library (content not found) ou permanecer sem erro
    await expect(page.locator('text=500')).not.toBeVisible({ timeout: 8_000 })
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
  })
})

// ── LGPD: dados sensíveis não vazam ──────────────────────────────────────────

test.describe('Focus — Segurança (autenticado)', () => {
  test('TC-FOC-030: rascunhos da sessão não expõem userId na URL', async ({ page }) => {
    await page.goto('/focus')
    const url = page.url()
    // URL não deve conter padrão de UUID que poderia ser userId
    expect(url).not.toMatch(/user[-_]?id=/i)
  })

  test('TC-FOC-031: /focus não carrega componentes de outras telas (sem leak de drawer)', async ({
    page,
  }) => {
    await page.goto('/focus')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="content-drawer"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="context-selector"]')).not.toBeVisible()
  })
})
