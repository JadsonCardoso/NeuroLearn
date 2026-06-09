import { test, expect } from '@playwright/test'
import { LibraryPage } from './pages/LibraryPage'
import { assertNoNativeBrowserValidation } from './utils/helpers'

// TC-LIB: Fluxo completo de biblioteca — requer sessão autenticada

test.describe('Library — Adicionar conteúdo', () => {
  test('TC-LIB-001: página carrega e exibe biblioteca', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await expect(page.locator('h1, h2').filter({ hasText: /biblioteca|library|conteúdo/i }).first())
      .toBeVisible({ timeout: 10_000 })
  })

  test('TC-LIB-002: modal de adição abre ao clicar no botão', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await library.openAddModal()
    await expect(page.locator('#title')).toBeVisible()
  })

  test('TC-LIB-003: modal tem novalidate (sem popup nativo do browser)', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await library.openAddModal()
    await assertNoNativeBrowserValidation(page)
  })

  test('TC-LIB-004: submit com título vazio exibe erro de validação', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await library.openAddModal()
    await library.submitModal()
    const error = page.locator('[role="alert"]').first()
    await expect(error).toBeVisible({ timeout: 3000 })
    await expect(error).toContainText(/título|obrigatório/i)
  })

  test('TC-LIB-005: modal permanece aberto após erro de validação', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await library.openAddModal()
    await library.submitModal()
    await page.waitForSelector('[role="alert"]', { timeout: 3000 })
    expect(await library.isModalOpen()).toBe(true)
  })

  test('TC-LIB-006: Escape fecha o modal', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await library.openAddModal()
    await expect(page.locator('#title')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#title')).not.toBeVisible({ timeout: 3000 })
  })

  test('TC-LIB-007: adicionar conteúdo válido fecha modal e exibe na lista', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await library.openAddModal()
    const title = `Teste E2E ${Date.now()}`
    await library.fillTitle(title)
    await library.selectType('book')
    await library.submitModal()
    // Modal fecha
    await expect(page.locator('#title')).not.toBeVisible({ timeout: 5000 })
    // Conteúdo aparece na lista
    await library.waitForContentCard(title)
  })

  test('TC-LIB-008: cancelar com dados exibe diálogo de confirmação', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await library.openAddModal()
    await library.fillTitle('Conteúdo que não deve ser salvo')
    await library.cancelModal()
    // Diálogo de confirmação deve aparecer — modal ainda visível
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('#title')).toBeVisible()
  })

  test('TC-LIB-009: confirmar descarte fecha o modal e descarta os dados', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await library.openAddModal()
    await library.fillTitle('Dados que serão descartados')
    await library.cancelModal()
    // Clica em "Descartar" no diálogo de confirmação
    await page.click('[data-testid="confirm-dialog-confirm"]')
    await expect(page.locator('#title')).not.toBeVisible({ timeout: 3000 })
  })

  test('TC-LIB-010: continuar editando mantém modal aberto com dados preservados', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await library.openAddModal()
    await library.fillTitle('Dados preservados')
    await library.cancelModal()
    // Clica em "Continuar editando" no diálogo
    await page.click('[data-testid="confirm-dialog-cancel"]')
    // Modal permanece aberto
    await expect(page.locator('#title')).toBeVisible()
    // Dados preservados
    await expect(page.locator('#title')).toHaveValue('Dados preservados')
  })

  test('TC-LIB-011: modal sem dados fecha diretamente ao cancelar (sem diálogo)', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await library.openAddModal()
    // Não preenche nada — formulário não está sujo
    await library.cancelModal()
    await expect(page.locator('#title')).not.toBeVisible({ timeout: 3000 })
    await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible()
  })

  test('TC-LIB-012: Escape com dados exibe diálogo de confirmação', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await library.openAddModal()
    await library.fillTitle('Dados via ESC')
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible({ timeout: 3000 })
    // Confirma descarte — modal fecha
    await page.click('[data-testid="confirm-dialog-confirm"]')
    await expect(page.locator('#title')).not.toBeVisible({ timeout: 3000 })
  })
})

test.describe('Library — Validação de campos', () => {
  test('TC-LIB-013: título com apenas espaços é rejeitado (trim)', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await library.openAddModal()
    await library.fillTitle('   ')
    await library.submitModal()
    const error = page.locator('[role="alert"]').first()
    await expect(error).toBeVisible({ timeout: 3000 })
  })

  test('TC-LIB-014: aria-invalid=true no campo título após erro', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()
    await library.openAddModal()
    await library.submitModal()
    await page.waitForSelector('[role="alert"]', { timeout: 3000 })
    await expect(page.locator('#title')).toHaveAttribute('aria-invalid', 'true')
  })
})
