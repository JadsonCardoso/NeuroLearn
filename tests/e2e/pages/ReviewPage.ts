import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/** Page Object para a página /review */
export class ReviewPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/review')
    await this.page.waitForLoadState('networkidle')
  }

  async hasEmptyState(): Promise<boolean> {
    const text = await this.page.textContent('body')
    return (text ?? '').toLowerCase().includes('sem revisão') ||
           (text ?? '').toLowerCase().includes('nenhuma revisão') ||
           (text ?? '').toLowerCase().includes('tudo em dia') ||
           (text ?? '').toLowerCase().includes('não há')
  }

  async hasCardVisible(): Promise<boolean> {
    // Cartão de revisão geralmente tem front/back
    const card = this.page.locator('[data-testid="review-card"], .review-card, .card').first()
    return card.isVisible()
  }

  async rateCard(quality: 1 | 2 | 3 | 4) {
    const btn = this.page.locator(`button[data-quality="${quality}"], button:has-text("${quality}")`).first()
    if (await btn.isVisible()) {
      await btn.click()
    }
  }

  async getQueueCount(): Promise<number> {
    // Tenta ler o contador de revisões pendentes
    const counter = this.page.locator('[data-testid="review-count"], .review-count').first()
    try {
      const text = await counter.textContent({ timeout: 3000 })
      const match = text?.match(/\d+/)
      return match ? parseInt(match[0], 10) : 0
    } catch {
      return 0
    }
  }

  async waitForPageLoad() {
    await expect(this.page.locator('h1, h2, [data-testid="review-page"]').first())
      .toBeVisible({ timeout: 10_000 })
  }
}
