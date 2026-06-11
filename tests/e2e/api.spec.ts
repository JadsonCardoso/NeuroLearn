import { test, expect } from '@playwright/test'

// TC-API: Contratos das API Routes — não requer sessão autenticada
// Testa: health check, auth guards (401 sem sessão) e validação de input (422 body inválido)

test.describe('API Routes — Contratos de Segurança e Validação', () => {
  // ── Health ────────────────────────────────────────────────────────────────

  test('TC-API-01: GET /api/health retorna 200 com body "OK"', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    expect(await res.text()).toBe('OK')
  })

  // ── Auth guards (rotas protegidas → 401 sem sessão) ───────────────────────

  test('TC-API-02: POST /api/ai/generate-flashcards sem auth retorna 401', async ({ request }) => {
    const res = await request.post('/api/ai/generate-flashcards', {
      data: { notes: 'teste', highlights: [], title: 'Teste', count: 3 },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body).toMatchObject({ code: 'UNAUTHORIZED' })
  })

  test('TC-API-03: POST /api/ai/analyze-teaching sem auth retorna 401', async ({ request }) => {
    const res = await request.post('/api/ai/analyze-teaching', {
      data: { teachText: 'Explicação de teste', contentTitle: 'Conteúdo Teste' },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body).toHaveProperty('code', 'UNAUTHORIZED')
  })

  test('TC-API-04: POST /api/ai/generate-quiz sem auth retorna 401', async ({ request }) => {
    const res = await request.post('/api/ai/generate-quiz', {
      data: { notes: 'teste', highlights: [], title: 'Teste' },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body).toHaveProperty('code', 'UNAUTHORIZED')
  })

  test('TC-API-05: POST /api/ai/cognitive-coach sem auth retorna 401', async ({ request }) => {
    const res = await request.post('/api/ai/cognitive-coach', {
      data: { message: 'Olá', context: {} },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body).toHaveProperty('code', 'UNAUTHORIZED')
  })

  test('TC-API-06: DELETE /api/user/delete sem auth retorna 401', async ({ request }) => {
    const res = await request.delete('/api/user/delete')
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  // ── Input validation — /api/waitlist (público, sem auth) ─────────────────

  test('TC-API-07: POST /api/waitlist sem body retorna 422', async ({ request }) => {
    const res = await request.post('/api/waitlist', {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    })
    expect(res.status()).toBe(422)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  test('TC-API-08: POST /api/waitlist com email inválido retorna 422', async ({ request }) => {
    const res = await request.post('/api/waitlist', {
      data: { name: 'Teste', email: 'nao-e-um-email' },
    })
    expect(res.status()).toBe(422)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  test('TC-API-09: POST /api/waitlist sem nome retorna 422', async ({ request }) => {
    const res = await request.post('/api/waitlist', {
      data: { email: 'valido@exemplo.com' },
    })
    expect(res.status()).toBe(422)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  // ── Métodos incorretos ────────────────────────────────────────────────────

  test('TC-API-10: POST /api/health retorna 405 ou 404 (método não permitido)', async ({
    request,
  }) => {
    const res = await request.post('/api/health', { data: {} })
    expect([404, 405]).toContain(res.status())
  })
})
