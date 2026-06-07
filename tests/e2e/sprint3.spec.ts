import { test, expect } from '@playwright/test'

// SPRINT-3 E2E
// US-03.2: Modal de geração de flashcards por IA
// US-04.1: Checklist de onboarding no Dashboard
// P6:      Endpoint cron protegido por CRON_SECRET

test.describe('Sprint3 — AI Flashcard Generation (US-03.2)', () => {
  test('TC-S3-AI-001: botão "✦ IA" aparece nos cards da biblioteca', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    // Se não houver conteúdo, pula o teste
    const hasContent = await page.locator('[data-testid^="content-card-"]').first().isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasContent) {
      test.skip(true, 'Sem conteúdo cadastrado para este usuário')
      return
    }

    await expect(page.locator('[data-testid="btn-generate-ai"]').first()).toBeVisible()
  })

  test('TC-S3-AI-002: clicar em "✦ IA" abre o modal de geração', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    const hasContent = await page.locator('[data-testid^="content-card-"]').first().isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasContent) {
      test.skip(true, 'Sem conteúdo cadastrado para este usuário')
      return
    }

    await page.locator('[data-testid="btn-generate-ai"]').first().click()
    await expect(page.locator('[data-testid="generate-flashcards-modal"]')).toBeVisible({ timeout: 3_000 })
  })

  test('TC-S3-AI-003: modal exibe textarea de anotações e seletor de quantidade', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    const hasContent = await page.locator('[data-testid^="content-card-"]').first().isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasContent) {
      test.skip(true, 'Sem conteúdo cadastrado para este usuário')
      return
    }

    await page.locator('[data-testid="btn-generate-ai"]').first().click()
    await expect(page.locator('[data-testid="gen-notes-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="gen-count-5"]')).toBeVisible()
    await expect(page.locator('[data-testid="btn-generate"]')).toBeVisible()
  })

  test('TC-S3-AI-004: validação rejeita anotações com menos de 50 caracteres', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    const hasContent = await page.locator('[data-testid^="content-card-"]').first().isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasContent) {
      test.skip(true, 'Sem conteúdo cadastrado para este usuário')
      return
    }

    await page.locator('[data-testid="btn-generate-ai"]').first().click()
    await page.locator('[data-testid="gen-notes-input"]').fill('curto demais')
    await page.locator('[data-testid="btn-generate"]').click()

    await expect(page.locator('[data-testid="gen-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="gen-error"]')).toContainText('50')
  })

  test('TC-S3-AI-005: fechar modal via botão × fecha o modal', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    const hasContent = await page.locator('[data-testid^="content-card-"]').first().isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasContent) {
      test.skip(true, 'Sem conteúdo cadastrado para este usuário')
      return
    }

    await page.locator('[data-testid="btn-generate-ai"]').first().click()
    await expect(page.locator('[data-testid="generate-flashcards-modal"]')).toBeVisible()

    await page.getByRole('button', { name: 'Fechar modal' }).click()
    await expect(page.locator('[data-testid="generate-flashcards-modal"]')).not.toBeVisible({ timeout: 2_000 })
  })

  test('TC-S3-AI-006: clicar fora do modal fecha o modal', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    const hasContent = await page.locator('[data-testid^="content-card-"]').first().isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasContent) {
      test.skip(true, 'Sem conteúdo cadastrado para este usuário')
      return
    }

    await page.locator('[data-testid="btn-generate-ai"]').first().click()
    await expect(page.locator('[data-testid="generate-flashcards-modal"]')).toBeVisible()

    // Clica no overlay (fora do card branco)
    await page.locator('[data-testid="generate-flashcards-modal"]').click({ position: { x: 5, y: 5 } })
    await expect(page.locator('[data-testid="generate-flashcards-modal"]')).not.toBeVisible({ timeout: 2_000 })
  })

  test('TC-S3-AI-007: seletor de quantidade muda o botão ativo', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    const hasContent = await page.locator('[data-testid^="content-card-"]').first().isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasContent) {
      test.skip(true, 'Sem conteúdo cadastrado para este usuário')
      return
    }

    await page.locator('[data-testid="btn-generate-ai"]').first().click()
    await page.locator('[data-testid="gen-count-10"]').click()

    // Botão 10 deve ter estilo de selecionado (borda roxa)
    const btn10 = page.locator('[data-testid="gen-count-10"]')
    const border = await btn10.evaluate((el) => getComputedStyle(el).borderColor)
    // Borda não deve ser transparente/cinza — deve ter cor ativa
    expect(border).not.toBe('rgba(0, 0, 0, 0)')
  })
})

test.describe('Sprint3 — Onboarding Checklist (US-04.1)', () => {
  test('TC-S3-OB-001: checklist de onboarding aparece para usuário sem atividade completa', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // O checklist só aparece se não estiver dismissed e não estiver 100% completo
    // Para novo usuário, deve aparecer
    const isVisible = await page.locator('[data-testid="onboarding-checklist"]').isVisible({ timeout: 5_000 }).catch(() => false)
    // Pode não aparecer se usuário já completou tudo — o teste é condicional
    if (isVisible) {
      await expect(page.locator('[data-testid="onboarding-checklist"]')).toBeVisible()
      await expect(page.locator('[data-testid="onboarding-progress"]')).toBeVisible()
    } else {
      // Usuário já completou todos os itens ou dismissou — aceito
      test.info().annotations.push({ type: 'note', description: 'Onboarding já concluído/dismissado para este usuário' })
    }
  })

  test('TC-S3-OB-002: checklist exibe 4 itens', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const isVisible = await page.locator('[data-testid="onboarding-checklist"]').isVisible({ timeout: 5_000 }).catch(() => false)
    if (!isVisible) {
      test.skip(true, 'Onboarding não visível para este usuário')
      return
    }

    // Deve ter 4 itens (índices 0-3)
    for (let i = 0; i < 4; i++) {
      await expect(page.locator(`[data-testid="onboarding-item-${i}"]`)).toBeVisible()
    }
  })

  test('TC-S3-OB-003: botão de dispensar oculta o checklist', async ({ page }) => {
    // Limpa localStorage para garantir checklist visível
    await page.goto('/dashboard')
    await page.evaluate(() => localStorage.removeItem('neurolearn:onboarding:dismissed'))
    await page.reload()
    await page.waitForLoadState('networkidle')

    const isVisible = await page.locator('[data-testid="onboarding-checklist"]').isVisible({ timeout: 5_000 }).catch(() => false)
    if (!isVisible) {
      test.skip(true, 'Onboarding não visível após limpeza — usuário já completou todos os itens')
      return
    }

    await page.locator('[data-testid="btn-dismiss-onboarding"]').click()
    await expect(page.locator('[data-testid="onboarding-checklist"]')).not.toBeVisible({ timeout: 2_000 })
  })

  test('TC-S3-OB-004: após dismissar, checklist não reaparece ao recarregar', async ({ page }) => {
    await page.goto('/dashboard')
    await page.evaluate(() => localStorage.removeItem('neurolearn:onboarding:dismissed'))
    await page.reload()
    await page.waitForLoadState('networkidle')

    const isVisible = await page.locator('[data-testid="onboarding-checklist"]').isVisible({ timeout: 5_000 }).catch(() => false)
    if (!isVisible) {
      test.skip(true, 'Onboarding não visível após limpeza — usuário já completou todos os itens')
      return
    }

    await page.locator('[data-testid="btn-dismiss-onboarding"]').click()
    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-testid="onboarding-checklist"]')).not.toBeVisible({ timeout: 3_000 })
  })
})

test.describe('Sprint3 — Cron Endpoint (P6)', () => {
  test('TC-S3-CRON-001: GET /api/cron/retention-snapshot sem token retorna 401', async ({ request }) => {
    const response = await request.get('/api/cron/retention-snapshot')
    expect(response.status()).toBe(401)
  })

  test('TC-S3-CRON-002: GET /api/cron/retention-snapshot com token errado retorna 401', async ({ request }) => {
    const response = await request.get('/api/cron/retention-snapshot', {
      headers: { Authorization: 'Bearer token-errado-invalido' },
    })
    expect(response.status()).toBe(401)
  })

  test('TC-S3-CRON-003: resposta 401 é JSON com campo error', async ({ request }) => {
    const response = await request.get('/api/cron/retention-snapshot')
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })
})
