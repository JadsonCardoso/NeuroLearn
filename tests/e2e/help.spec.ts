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
})
