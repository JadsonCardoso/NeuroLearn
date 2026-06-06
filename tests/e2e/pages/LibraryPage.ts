import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'

/** Page Object para a página /library */
export class LibraryPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/library')
    await this.page.waitForLoadState('networkidle')
  }

  // ── Modal de adição ────────────────────────────────────────────────────────

  async openAddModal() {
    // Botão de adicionar conteúdo (texto ou ícone +)
    const btn = this.page.locator('button').filter({ hasText: /adicionar|novo conteúdo|\+/i }).first()
    await btn.click()
    await this.page.waitForSelector('#title', { timeout: 5000 })
  }

  async fillTitle(value: string) {
    await this.page.fill('#title', value)
  }

  async selectType(value: 'book' | 'course' | 'video' | 'article' | 'note') {
    await this.page.selectOption('#type', value)
  }

  async fillAuthor(value: string) {
    await this.page.fill('#author', value)
  }

  async submitModal() {
    await this.page.click('button[type="submit"]:has-text("Adicionar")')
  }

  async cancelModal() {
    await this.page.click('button:has-text("Cancelar")')
  }

  // ── Conteúdos na lista ─────────────────────────────────────────────────────

  getContentCard(title: string): Locator {
    return this.page.locator('[data-testid="content-card"], .card').filter({ hasText: title })
  }

  async waitForContentCard(title: string) {
    await expect(this.getContentCard(title)).toBeVisible({ timeout: 8000 })
  }

  async getValidationError(fieldId: string): Promise<string | null> {
    const errorId = `${fieldId}-error`
    const el = this.page.locator(`#${errorId}`)
    try {
      await expect(el).toBeVisible({ timeout: 3000 })
      return await el.textContent()
    } catch {
      return null
    }
  }

  // ── Modal estado ──────────────────────────────────────────────────────────

  async isModalOpen(): Promise<boolean> {
    return this.page.locator('#title').isVisible()
  }
}
