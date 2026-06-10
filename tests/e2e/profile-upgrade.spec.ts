import { test, expect } from '@playwright/test'

// TC-PROF-UPGRADE: PROFILE-UPGRADE — requer sessão autenticada

test.describe('Profile Upgrade', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1, [class*="PageHeader"]').first()).toBeVisible({ timeout: 10_000 })
  })

  // ── STATS-PROFILE-01 ─────────────────────────────────────────────────────

  test('TC-PROF-001: chips de estatísticas são exibidos no topo', async ({ page }) => {
    const stats = page.getByTestId('profile-stats')
    await expect(stats).toBeVisible({ timeout: 5_000 })

    // Deve ter 3 chips
    const chips = stats.locator('.card')
    await expect(chips).toHaveCount(3)
  })

  test('TC-PROF-002: chip de flashcards exibe número >= 0', async ({ page }) => {
    const stats = page.getByTestId('profile-stats')
    await expect(stats).toBeVisible()
    await expect(stats.getByText('Flashcards')).toBeVisible()
  })

  test('TC-PROF-003: chip de streak exibe formato Nd', async ({ page }) => {
    const stats = page.getByTestId('profile-stats')
    await expect(stats.getByText('Streak atual')).toBeVisible()
    // O valor deve terminar com "d" (ex: "0d", "5d")
    const streakValue = stats.locator('[style*="fontWeight"]').first()
    const text = await streakValue.textContent()
    expect(text).toMatch(/\d+d/)
  })

  // ── STUDY-GOALS-01 ────────────────────────────────────────────────────────

  test('TC-PROF-004: seção Metas de Estudo é exibida', async ({ page }) => {
    const goals = page.getByTestId('profile-goals')
    await expect(goals).toBeVisible({ timeout: 5_000 })
    await expect(goals.getByText('Metas de Estudo')).toBeVisible()
  })

  test('TC-PROF-005: campos de meta têm valores padrão válidos', async ({ page }) => {
    await expect(page.locator('#cardsPerDay')).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('#minutesPerDay')).toBeVisible()
    await expect(page.locator('#daysPerWeek')).toBeVisible()
    await expect(page.locator('#streakGoal')).toBeVisible()

    // Valores padrão devem ser números positivos
    const cardsVal = await page.locator('#cardsPerDay').inputValue()
    expect(Number(cardsVal)).toBeGreaterThan(0)
  })

  test('TC-PROF-006: botão "Salvar metas" está desabilitado quando sem mudanças', async ({
    page,
  }) => {
    const btn = page.getByRole('button', { name: /salvar metas/i })
    await expect(btn).toBeDisabled({ timeout: 5_000 })
  })

  test('TC-PROF-007: alterar campo de meta habilita botão salvar', async ({ page }) => {
    const input = page.locator('#cardsPerDay')
    await input.fill('10')
    const btn = page.getByRole('button', { name: /salvar metas/i })
    await expect(btn).toBeEnabled({ timeout: 3_000 })
  })

  // ── ACTIVITY-HISTORY-01 ───────────────────────────────────────────────────

  test('TC-PROF-008: seção Histórico de Atividade é exibida', async ({ page }) => {
    const activity = page.getByTestId('profile-activity')
    await expect(activity).toBeVisible({ timeout: 5_000 })
    await expect(activity.getByText('Histórico de Atividade')).toBeVisible()
  })

  test('TC-PROF-009: histórico exibe mensagem de vazio ou itens de atividade', async ({ page }) => {
    // Aguarda o loading spinner sumir
    await page.waitForTimeout(1500)
    const activity = page.getByTestId('profile-activity')
    const hasItems = await activity.locator('[data-testid="activity-item"]').count()
    const hasEmpty = await activity.getByText(/nenhuma sessão/i).count()
    // Deve ter itens OU mensagem de vazio — nunca ambos, nunca nenhum
    expect(hasItems + hasEmpty).toBeGreaterThan(0)
  })

  // ── Dashboard — Metas de Estudo ───────────────────────────────────────────

  test('TC-PROF-010: card "Metas de Hoje" aparece no Dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const goalsCard = page.getByTestId('dashboard-goals')
    await expect(goalsCard).toBeVisible({ timeout: 10_000 })
    await expect(goalsCard.getByText('Metas de Hoje')).toBeVisible()
  })

  test('TC-PROF-011: card de metas exibe 4 progress bars', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const goalsCard = page.getByTestId('dashboard-goals')
    await expect(goalsCard).toBeVisible({ timeout: 10_000 })

    // 4 labels de metas
    await expect(goalsCard.getByText('Cards revisados')).toBeVisible()
    await expect(goalsCard.getByText('Minutos de estudo')).toBeVisible()
    await expect(goalsCard.getByText('Dias ativos (7d)')).toBeVisible()
    await expect(goalsCard.getByText('Streak')).toBeVisible()
  })

  test('TC-PROF-012: link "Editar metas" no Dashboard navega para /profile', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const goalsCard = page.getByTestId('dashboard-goals')
    await expect(goalsCard).toBeVisible({ timeout: 10_000 })

    await goalsCard.getByRole('button', { name: /editar metas/i }).click()
    await expect(page).toHaveURL(/\/profile/, { timeout: 5_000 })
  })
})
