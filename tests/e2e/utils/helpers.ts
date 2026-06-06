import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/** Aguarda um toast do tipo indicado aparecer e verifica a mensagem */
export async function waitForToast(page: Page, text: string, timeout = 5000) {
  const toast = page.locator('[role="status"], [data-testid="toast"]').filter({ hasText: text })
  await expect(toast).toBeVisible({ timeout })
  return toast
}

/** Aguarda navegação completa para uma rota */
export async function waitForRoute(page: Page, path: string) {
  await page.waitForURL(`**${path}`, { timeout: 15_000 })
  await page.waitForLoadState('networkidle')
}

/** Verifica que não há popup nativo de validação do browser no form */
export async function assertNoNativeBrowserValidation(page: Page) {
  const form = page.locator('form').first()
  await expect(form).toHaveAttribute('novalidate')
}

/** Limpa um campo e preenche com novo valor */
export async function fillField(page: Page, selector: string, value: string) {
  await page.fill(selector, '')
  await page.fill(selector, value)
}
