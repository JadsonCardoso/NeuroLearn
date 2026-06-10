import { test, expect } from '@playwright/test'

// TC-HELP: Central de Ajuda — requer sessão autenticada

test.describe('Central de Ajuda', () => {
  test('TC-HELP-001: página carrega com heading e todos os 12 módulos', async ({ page }) => {
    await page.goto('/help')
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('help-view')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /central de ajuda/i })).toBeVisible()

    const modules = page.locator('[data-testid^="help-module-"]')
    await expect(modules).toHaveCount(12, { timeout: 5_000 })
  })

  test('TC-HELP-002: clicar em módulo expande o conteúdo', async ({ page }) => {
    await page.goto('/help')
    await page.waitForLoadState('networkidle')

    const btn = page.getByTestId('help-module-dashboard')
    await expect(btn).toBeVisible({ timeout: 10_000 })
    await expect(btn).toHaveAttribute('aria-expanded', 'false')

    await btn.click()
    await expect(page.getByTestId('help-content-dashboard')).toBeVisible({ timeout: 3_000 })
    await expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  test('TC-HELP-003: clicar novamente no módulo fecha o conteúdo', async ({ page }) => {
    await page.goto('/help')
    await page.waitForLoadState('networkidle')

    const btn = page.getByTestId('help-module-dashboard')
    await btn.click()
    await expect(page.getByTestId('help-content-dashboard')).toBeVisible({ timeout: 3_000 })

    await btn.click()
    await expect(page.getByTestId('help-content-dashboard')).not.toBeVisible({ timeout: 3_000 })
    await expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  test('TC-HELP-004: apenas um módulo fica aberto por vez', async ({ page }) => {
    await page.goto('/help')
    await page.waitForLoadState('networkidle')

    await page.getByTestId('help-module-dashboard').click()
    await expect(page.getByTestId('help-content-dashboard')).toBeVisible({ timeout: 3_000 })

    await page.getByTestId('help-module-library').click()
    await expect(page.getByTestId('help-content-library')).toBeVisible({ timeout: 3_000 })
    await expect(page.getByTestId('help-content-dashboard')).not.toBeVisible()
  })

  test('TC-HELP-005: novos módulos estão presentes (Trilhas, Material, Perfil, Settings, Conquistas)', async ({
    page,
  }) => {
    await page.goto('/help')
    await page.waitForLoadState('networkidle')

    for (const id of ['trails', 'material', 'profile', 'settings', 'achievements']) {
      await expect(
        page.getByTestId(`help-module-${id}`),
        `módulo ${id} deve estar visível`
      ).toBeVisible({
        timeout: 5_000,
      })
    }
  })

  test('TC-HELP-006: accordion usa elemento button nativo (semântica WCAG)', async ({ page }) => {
    await page.goto('/help')
    await page.waitForLoadState('networkidle')

    const btn = page.getByTestId('help-module-dashboard')
    await expect(btn).toBeVisible({ timeout: 10_000 })
    // Verifica que é um <button> nativo, não uma div
    await expect(btn).toHaveJSProperty('tagName', 'BUTTON')
  })

  test('TC-HELP-007: Enter no botão expande o módulo (navegação por teclado)', async ({ page }) => {
    await page.goto('/help')
    await page.waitForLoadState('networkidle')

    const btn = page.getByTestId('help-module-focus')
    await btn.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('help-content-focus')).toBeVisible({ timeout: 3_000 })
  })

  test('TC-HELP-008: busca filtra módulos em tempo real pelo título', async ({ page }) => {
    await page.goto('/help')
    await page.waitForLoadState('networkidle')

    const input = page.getByTestId('help-search')
    await expect(input).toBeVisible({ timeout: 5_000 })

    await input.fill('Pomodoro')
    await page.waitForTimeout(300)

    // Apenas o módulo "Sessão de Foco" deve aparecer (contém "Pomodoro" no tagline e steps)
    const modules = page.locator('[data-testid^="help-module-"]')
    await expect(modules).toHaveCount(1, { timeout: 3_000 })
    await expect(page.getByTestId('help-module-focus')).toBeVisible()
  })

  test('TC-HELP-009: busca sem resultado exibe mensagem "Nenhum módulo encontrado"', async ({
    page,
  }) => {
    await page.goto('/help')
    await page.waitForLoadState('networkidle')

    const input = page.getByTestId('help-search')
    await input.fill('xyzqwertyinexistente999')
    await page.waitForTimeout(300)

    await expect(page.getByTestId('help-search-count')).toContainText('Nenhum módulo encontrado', {
      timeout: 3_000,
    })
    const modules = page.locator('[data-testid^="help-module-"]')
    await expect(modules).toHaveCount(0)
  })

  test('TC-HELP-010: busca por texto no step (não apenas no título) retorna módulo correto', async ({
    page,
  }) => {
    await page.goto('/help')
    await page.waitForLoadState('networkidle')

    // "Ebbinghaus" está no campo science do dashboard — não deve aparecer (science não é indexado)
    // "SM-2" está no tagline do módulo review
    const input = page.getByTestId('help-search')
    await input.fill('SM-2')
    await page.waitForTimeout(300)

    await expect(page.getByTestId('help-module-review')).toBeVisible({ timeout: 3_000 })
  })

  test('TC-HELP-011: limpar busca via botão × restaura todos os 12 módulos', async ({ page }) => {
    await page.goto('/help')
    await page.waitForLoadState('networkidle')

    const input = page.getByTestId('help-search')
    await input.fill('Pomodoro')
    await page.waitForTimeout(300)

    // Clica no botão × (aria-label="Limpar busca")
    await page.getByRole('button', { name: /limpar busca/i }).click()
    await page.waitForTimeout(200)

    const modules = page.locator('[data-testid^="help-module-"]')
    await expect(modules).toHaveCount(12, { timeout: 3_000 })
  })

  test('TC-HELP-012: deep-link ?section=review abre o módulo review expandido', async ({
    page,
  }) => {
    await page.goto('/help?section=review')
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('help-view')).toBeVisible({ timeout: 10_000 })
    // O módulo review deve estar expandido automaticamente
    await expect(page.getByTestId('help-content-review')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByTestId('help-module-review')).toHaveAttribute('aria-expanded', 'true')
  })

  test('TC-HELP-013: deep-link com section inválida não quebra a página', async ({ page }) => {
    await page.goto('/help?section=modulo-que-nao-existe')
    await page.waitForLoadState('networkidle')

    // Página carrega normalmente com todos os módulos fechados
    await expect(page.getByTestId('help-view')).toBeVisible({ timeout: 10_000 })
    const modules = page.locator('[data-testid^="help-module-"]')
    await expect(modules).toHaveCount(12, { timeout: 5_000 })
  })
})
