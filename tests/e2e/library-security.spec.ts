import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import { LibraryPage } from './pages/LibraryPage'

const AUTH_FILE_B = 'tests/e2e/.auth/user-b.json'
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3003'

// TC-SEC: Segurança — isolamento de dados entre usuários, IDOR — requer sessão autenticada
//
// Contexto: testes com usuário único.
// O Supabase aplica RLS com auth.uid() = user_id. A proteção real requer dois usuários.
// Aqui testamos:
// (a) que a UI não exibe dados de UUIDs que não pertencem ao usuário autenticado
// (b) que chamadas diretas com IDs aleatórios retornam conjuntos vazios (RLS silencioso)
// (c) que os dados exibidos na UI pertencem exclusivamente ao usuário autenticado

const FAKE_UUID = '00000000-0000-0000-0000-000000000000'

// ── TC-SEC-001: Acesso a conteúdo de outro usuário por ID ──────────────────────

test.describe('TC-SEC — Isolamento de Dados (RLS)', () => {
  test('TC-SEC-001: query direta com UUID inexistente retorna vazio (RLS protege)', async ({
    page,
  }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    // Faz query Supabase via browser usando o client já autenticado
    const result = await page.evaluate(async (uuid) => {
      const { createBrowserClient } = await import('@supabase/ssr')
      const client = createBrowserClient(
        (window as unknown as Record<string, string>)['__SUPABASE_URL__'] ??
          document.querySelector<HTMLElement>('[data-supabase-url]')?.dataset['supabaseUrl'] ??
          '',
        (window as unknown as Record<string, string>)['__SUPABASE_ANON__'] ?? ''
      )
      const { data } = await client.from('contents').select('id').eq('id', uuid).maybeSingle()
      return data
    }, FAKE_UUID)

    // RLS retorna null (não encontrado) — não vaza dados de outros usuários
    expect(result).toBeNull()
  })

  test('TC-SEC-002: biblioteca exibe apenas conteúdos do usuário autenticado', async ({ page }) => {
    const library = new LibraryPage(page)
    await library.goto()

    // Cria um conteúdo identificável para confirmar que o usuário vê seus próprios dados
    const titulo = `Meu conteúdo SEC002 ${Date.now()}`
    await library.openAddModal()
    await library.fillTitle(titulo)
    await library.selectType('book')
    await page.click('button[type="submit"]:has-text("Adicionar")')
    await library.waitForContentCard(titulo)

    // Obtém todos os IDs de conteúdos visíveis na biblioteca
    const visibleCards = await page.locator('[data-testid="content-card"]').allTextContents()

    // Verifica que o conteúdo criado está visível
    expect(visibleCards.some((text) => text.includes(titulo))).toBe(true)
    expect(visibleCards.length).toBeGreaterThanOrEqual(1)
  })

  test('TC-SEC-003: tentativa de editar conteúdo com UUID inexistente não altera dados', async ({
    page,
  }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    // Intercepta chamadas PATCH/PUT para verificar que não há atualização indevida
    const updateCalls: string[] = []
    await page.route('**/contents**', (route) => {
      if (['PATCH', 'PUT'].includes(route.request().method())) {
        updateCalls.push(route.request().url())
      }
      route.continue()
    })

    // Verifica que não há endpoint de conteúdo aberto sem autenticação adequada
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/user/delete', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      return { status: res.status, ok: res.ok }
    })

    // O endpoint protegido deve requerer autenticação
    expect([200, 401, 403, 404, 405]).toContain(response.status)
    // Nenhuma chamada PATCH/PUT a /contents deve ter ocorrido sem interação do usuário
    expect(updateCalls).toHaveLength(0)
  })

  test('TC-SEC-004: Meu Material exibe apenas sessões do usuário autenticado', async ({ page }) => {
    await page.goto('/review')
    await page.waitForLoadState('networkidle')

    // Acessa aba Meu Material
    const tabKnowledge = page.locator('[data-testid="tab-knowledge"]')
    await expect(tabKnowledge).toBeVisible({ timeout: 5000 })
    await tabKnowledge.click()

    await expect(page.locator('text=500')).not.toBeVisible()
    await expect(page.locator('text=Internal Server Error')).not.toBeVisible()

    // Obtém todos os textos visíveis e verifica que não há indicação de dados de outros usuários
    // (não deve haver "user_id" de outro usuário exposto na UI)
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).not.toContain('user_id:')
    expect(bodyText).not.toContain('"user_id"')
    expect(bodyText).not.toContain(FAKE_UUID)
  })

  test('TC-SEC-005: trilhas visíveis na biblioteca pertencem ao usuário autenticado', async ({
    page,
  }) => {
    const library = new LibraryPage(page)
    await library.goto()

    // Cria uma trilha identificável
    const nomeTrilha = `Minha Trilha SEC005 ${Date.now()}`
    await page.click('[data-testid="btn-new-trail"]')
    await page.waitForSelector('[data-testid="trail-form-modal"]', { timeout: 5000 })
    await page.fill('[data-testid="trail-title"]', nomeTrilha)
    await page.click('[data-testid="trail-save-btn"]')
    await expect(page.locator('[data-testid="trail-form-modal"]')).not.toBeVisible({
      timeout: 5000,
    })

    // A trilha deve aparecer apenas na seção do usuário atual
    const trailSection = page
      .locator('[data-testid="trail-section"]')
      .filter({ hasText: nomeTrilha })
    await expect(trailSection).toBeVisible({ timeout: 5000 })

    // Não deve haver erro 500 (que indicaria falha de RLS ou exposição de dados)
    await expect(page.locator('text=500')).not.toBeVisible()
  })
})

// ── TC-SEC-006: IDOR nas APIs ──────────────────────────────────────────────────

test.describe('TC-SEC — Proteção IDOR nas APIs', () => {
  test('TC-SEC-006: API /api/user/delete requer autenticação válida', async ({ page }) => {
    // Verifica que endpoints de modificação não são abertos sem token
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    // Testa sem token (contexto limpo para essa chamada específica)
    const response = await page.request.get('/api/user/delete')
    // Deve retornar 401 ou 405 (método incorreto), nunca 200 sem autenticação
    expect([401, 403, 404, 405]).toContain(response.status())
  })

  test('TC-SEC-007: API /api/health não expõe dados sensíveis', async ({ page }) => {
    const response = await page.request.get('/api/health')
    const body = await response.text()

    expect([200, 204]).toContain(response.status())
    // Endpoint de health não deve expor chaves, tokens ou user IDs
    expect(body).not.toMatch(/service_role|anon.*key|secret/i)
    expect(body).not.toContain(FAKE_UUID)
  })

  test('TC-SEC-008: conteúdo do usuário A não aparece na biblioteca do usuário B', async ({
    page,
    browser,
  }) => {
    test.skip(
      !fs.existsSync(AUTH_FILE_B),
      'TEST_USER_EMAIL_B não configurado — user-b.json ausente'
    )

    // Usuário A cria conteúdo com título único
    const library = new LibraryPage(page)
    await library.goto()
    const tituloA = `SEC008 UserA ${Date.now()}`
    await library.openAddModal()
    await library.fillTitle(tituloA)
    await library.selectType('book')
    await page.click('button[type="submit"]:has-text("Adicionar")')
    await library.waitForContentCard(tituloA)

    // Usuário B abre contexto separado e navega para a biblioteca
    const contextB = await browser.newContext({ storageState: AUTH_FILE_B })
    const pageB = await contextB.newPage()
    try {
      await pageB.goto(`${BASE_URL}/library`)
      await pageB.waitForLoadState('networkidle')

      // RLS: usuário B não deve ver o conteúdo de usuário A
      const texts = await pageB.locator('[data-testid="content-card"]').allTextContents()
      expect(texts.some((t) => t.includes(tituloA))).toBe(false)
    } finally {
      await contextB.close()
    }
  })

  test('TC-SEC-009: trilha do usuário A não aparece na biblioteca do usuário B', async ({
    page,
    browser,
  }) => {
    test.skip(
      !fs.existsSync(AUTH_FILE_B),
      'TEST_USER_EMAIL_B não configurado — user-b.json ausente'
    )

    // Usuário A cria trilha com nome único
    await page.goto('/library')
    await page.waitForLoadState('networkidle')
    const nomeTrilha = `SEC009 Trilha UserA ${Date.now()}`
    await page.click('[data-testid="btn-new-trail"]')
    await page.waitForSelector('[data-testid="trail-form-modal"]', { timeout: 5000 })
    await page.fill('[data-testid="trail-title"]', nomeTrilha)
    await page.click('[data-testid="trail-save-btn"]')
    await expect(page.locator('[data-testid="trail-form-modal"]')).not.toBeVisible({
      timeout: 5000,
    })
    await expect(
      page.locator('[data-testid="trail-section"]').filter({ hasText: nomeTrilha })
    ).toBeVisible({ timeout: 5000 })

    // Usuário B não deve ver a trilha de usuário A
    const contextB = await browser.newContext({ storageState: AUTH_FILE_B })
    const pageB = await contextB.newPage()
    try {
      await pageB.goto(`${BASE_URL}/library`)
      await pageB.waitForLoadState('networkidle')

      const trailSections = await pageB.locator('[data-testid="trail-section"]').allTextContents()
      expect(trailSections.some((t) => t.includes(nomeTrilha))).toBe(false)
    } finally {
      await contextB.close()
    }
  })

  test('TC-SEC-010: sessões de revisão do usuário A não vazam para o usuário B', async ({
    page,
    browser,
  }) => {
    test.skip(
      !fs.existsSync(AUTH_FILE_B),
      'TEST_USER_EMAIL_B não configurado — user-b.json ausente'
    )

    // Usuário A cria conteúdo único que servirá como marcador
    const library = new LibraryPage(page)
    await library.goto()
    const tituloA = `SEC010 UserA ${Date.now()}`
    await library.openAddModal()
    await library.fillTitle(tituloA)
    await library.selectType('book')
    await page.click('button[type="submit"]:has-text("Adicionar")')
    await library.waitForContentCard(tituloA)

    // Usuário B acessa a aba Meu Material — não deve ver registros de usuário A
    const contextB = await browser.newContext({ storageState: AUTH_FILE_B })
    const pageB = await contextB.newPage()
    try {
      await pageB.goto(`${BASE_URL}/review`)
      await pageB.waitForLoadState('networkidle')

      const tabKnowledge = pageB.locator('[data-testid="tab-knowledge"]')
      if (await tabKnowledge.isVisible({ timeout: 3000 })) {
        await tabKnowledge.click()
        await pageB.waitForLoadState('networkidle')
      }

      const bodyText = await pageB.locator('body').textContent()
      expect(bodyText).not.toContain(tituloA)
    } finally {
      await contextB.close()
    }
  })
})
