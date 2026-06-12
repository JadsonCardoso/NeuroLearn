import { test, expect } from '@playwright/test'

// TC-PROJ-API: Testes de API para rotas do sistema
// Substitui os testes Cypress solicitados (Cypress NÃO instalado — apenas @playwright/test).
// Usa o fixture `request` do Playwright para chamadas HTTP diretas.
//
// Sprint 02 / Phase 07 — Automação
// Requer: servidor rodando em localhost:3003
//
// Os testes de ownership via API requerem sessão autenticada (cookie/storage).
// Aqui os testes sem auth verificam que as rotas protegidas retornam 401.

// ── TC-PROJ-API-001..003: Health e rotas públicas ─────────────────────────────

test.describe('TC-PROJ-API — Rotas públicas e healthcheck', () => {
  test('TC-PROJ-API-001: GET /api/health retorna 200 (BUG-GLOBAL-003)', async ({ request }) => {
    const resp = await request.get('/api/health')
    expect(resp.status()).toBe(200)
  })

  test('TC-PROJ-API-002: GET /api/health não expõe service_role ou JWT longo', async ({
    request,
  }) => {
    const resp = await request.get('/api/health')
    const body = await resp.text()
    expect(body).not.toMatch(/service_role/i)
    expect(body).not.toMatch(/eyJ[A-Za-z0-9_-]{50,}/i)
  })
})

// ── TC-PROJ-API-003..006: Proteção de APIs sem autenticação ──────────────────

test.describe('TC-PROJ-API — Proteção de rotas sem auth', () => {
  test('TC-PROJ-API-003: POST /api/ai/generate-flashcards sem auth retorna 401', async ({
    request,
  }) => {
    const resp = await request.post('/api/ai/generate-flashcards', {
      data: { notes: 'test', highlights: [], title: 'test', count: 3 },
    })
    expect(resp.status()).toBe(401)
    const body = await resp.json()
    expect(body).toHaveProperty('code', 'UNAUTHORIZED')
  })

  test('TC-PROJ-API-004: DELETE /api/user/delete sem auth retorna 401 e não vaza userId', async ({
    request,
  }) => {
    const resp = await request.delete('/api/user/delete')
    expect(resp.status()).toBe(401)
    const body = await resp.json()
    expect(body).not.toHaveProperty('userId')
    expect(body).not.toHaveProperty('user')
    expect(JSON.stringify(body)).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/i)
  })

  test('TC-PROJ-API-005: GET /api/cron/retention-snapshot sem Authorization retorna 401', async ({
    request,
  }) => {
    const resp = await request.get('/api/cron/retention-snapshot')
    expect(resp.status()).toBe(401)
  })

  test('TC-PROJ-API-006: GET /api/cron/retention-snapshot com secret incorreto retorna 401', async ({
    request,
  }) => {
    const resp = await request.get('/api/cron/retention-snapshot', {
      headers: { Authorization: 'Bearer wrongsecret' },
    })
    expect(resp.status()).toBe(401)
  })
})

// ── TC-PROJ-API-007..009: AI endpoints — validação de input ──────────────────

test.describe('TC-PROJ-API — AI endpoints — validação de input', () => {
  test('TC-PROJ-API-007: POST /api/ai/generate-quiz sem auth retorna 401 (não 500)', async ({
    request,
  }) => {
    const resp = await request.post('/api/ai/generate-quiz', {
      data: { front: 'q', back: 'a' },
    })
    expect([401, 422]).toContain(resp.status())
    // Nunca deve retornar 500
    expect(resp.status()).not.toBe(500)
  })

  test('TC-PROJ-API-008: POST /api/ai/analyze-teaching sem auth retorna 401 (não 500)', async ({
    request,
  }) => {
    const resp = await request.post('/api/ai/analyze-teaching', {
      data: { text: 'explicação de teste', contentTitle: 'Título' },
    })
    expect([401, 422]).toContain(resp.status())
    expect(resp.status()).not.toBe(500)
  })

  test('TC-PROJ-API-009: POST /api/ai/generate-flashcards com body inválido retorna 401 ou 422 (não 500)', async ({
    request,
  }) => {
    const resp = await request.post('/api/ai/generate-flashcards', {
      data: { malformed: true },
    })
    expect([401, 422]).toContain(resp.status())
    expect(resp.status()).not.toBe(500)
  })
})

// ── TC-PROJ-API-010..012: Push e waitlist ────────────────────────────────────

test.describe('TC-PROJ-API — Push notify e waitlist', () => {
  test('TC-PROJ-API-010: POST /api/push/notify sem auth retorna 401', async ({ request }) => {
    const resp = await request.post('/api/push/notify', {
      data: {},
    })
    expect(resp.status()).toBe(401)
  })

  test('TC-PROJ-API-011: POST /api/waitlist com email inválido retorna 422 ou 429 (não 500)', async ({
    request,
  }) => {
    const resp = await request.post('/api/waitlist', {
      data: { email: 'nao-e-email', name: '' },
    })
    expect([422, 429]).toContain(resp.status())
    expect(resp.status()).not.toBe(500)
  })
})

// ── TC-PROJ-API-012: Projetos — rota frontend protegida ──────────────────────

test.describe('TC-PROJ-API — Rota /projects protegida por middleware', () => {
  test('TC-PROJ-API-012: GET /projects sem sessão redireciona para /auth/login', async ({
    page,
  }) => {
    // Usa contexto sem storageState (request fixture é puro)
    await page.goto('/projects')
    // Middleware deve redirecionar
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 })
    await expect(page.locator('text=500')).not.toBeVisible()
  })
})
