import { test, expect } from '@playwright/test'

// TC-DND: Drag-and-drop de conteúdo para trilhas
// Testes sem autenticação verificam redirecionamento e ausência de erros 500.
// O DnD real (@dnd-kit) requer sessão autenticada com dados pré-populados.

test.describe('Library DnD — Redirecionamento e Estrutura', () => {
  test('TC-DND-001: /app/library sem sessão redireciona para login', async ({ page }) => {
    await page.goto('/app/library')
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
  })

  test('TC-DND-002: /app/library não emite erro 500', async ({ page }) => {
    await page.goto('/app/library')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()
  })

  test('TC-DND-003: data-testid content-card não aparece sem autenticação', async ({ page }) => {
    await page.goto('/app/library')
    await page.waitForLoadState('domcontentloaded')
    // Sem sessão, redireciona antes de renderizar cards arrastáveis
    await expect(page.locator('[data-testid="content-card"]')).not.toBeVisible()
  })
})
