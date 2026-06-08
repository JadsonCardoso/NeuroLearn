import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock do Supabase ──────────────────────────────────────────────────────────
// Padrão builder pattern: cada método retorna a própria chain por padrão.
// Métodos terminais recebem mockResolvedValueOnce nos testes para simular await.
//
// IMPORTANTE: limit() aparece em duas queries:
//   Query 1: ...order().limit(1).maybeSingle()  → limit deve retornar chain (não Promise)
//   Query 2: ...order().limit(10)               → limit é terminal (retorna Promise)
// Por isso usamos mockReturnValueOnce(chain) + mockResolvedValueOnce(data) em ordem FIFO.

const mockChain = {
  from:        vi.fn(),
  select:      vi.fn(),
  eq:          vi.fn(),
  lt:          vi.fn(),
  order:       vi.fn(),
  limit:       vi.fn(),
  maybeSingle: vi.fn(),
  in:          vi.fn(),
}

Object.values(mockChain).forEach((fn) => fn.mockReturnValue(mockChain))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockChain,
}))

const { getAtRiskCards } = await import('./analyticsService')

const SNAPSHOT_DATE = '2026-06-01'
const USER_ID = 'user-uuid-1'

beforeEach(() => {
  vi.clearAllMocks()
  Object.values(mockChain).forEach((fn) => (fn as ReturnType<typeof vi.fn>).mockReturnValue(mockChain))
})

// ── Helpers para configurar as 3 queries ─────────────────────────────────────

function mockQuery1(snapshotData: { snapshot_date: string } | null) {
  // Query 1 chain: .from().select().eq().order().limit(1).maybeSingle()
  // limit(1) → retorna chain (1ª call, via mockReturnValueOnce → fallback ao default)
  mockChain.maybeSingle.mockResolvedValueOnce({ data: snapshotData })
}

function mockQuery2(data: object[] | null, error: object | null = null) {
  // Query 2 chain: .from().select().eq().eq().lt().order().limit(10) ← terminal
  // Primeira call de limit (query 1) usa o default mockReturnValue(mockChain)
  // Segunda call de limit (query 2) precisa ser terminal:
  mockChain.limit.mockReturnValueOnce(mockChain)                    // query 1: limit → chain
  mockChain.limit.mockResolvedValueOnce({ data, error })            // query 2: limit → Promise
}

function mockQuery3(data: object[] | null) {
  // Query 3 chain: .from().select().in() ← terminal
  mockChain.in.mockResolvedValueOnce({ data })
}

// ── getAtRiskCards ────────────────────────────────────────────────────────────

describe('getAtRiskCards', () => {
  it('retorna [] quando não há snapshot para o usuário', async () => {
    mockQuery1(null)
    const result = await getAtRiskCards(USER_ID)
    expect(result).toEqual([])
  })

  it('retorna [] quando não há cards com retenção < 50% no snapshot', async () => {
    mockQuery1({ snapshot_date: SNAPSHOT_DATE })
    mockQuery2([])
    const result = await getAtRiskCards(USER_ID)
    expect(result).toEqual([])
  })

  it('retorna [] quando a query de métricas retorna error', async () => {
    mockQuery1({ snapshot_date: SNAPSHOT_DATE })
    mockQuery2(null, { message: 'DB error' })
    const result = await getAtRiskCards(USER_ID)
    expect(result).toEqual([])
  })

  it('retorna [] quando a query de métricas retorna data null sem error', async () => {
    mockQuery1({ snapshot_date: SNAPSHOT_DATE })
    mockQuery2(null, null)
    const result = await getAtRiskCards(USER_ID)
    expect(result).toEqual([])
  })

  it('mapeia corretamente cards em risco com detalhes do flashcard', async () => {
    mockQuery1({ snapshot_date: SNAPSHOT_DATE })
    mockQuery2([
      { flashcard_id: 'card-1', retention: 0.30, snapshot_date: SNAPSHOT_DATE },
      { flashcard_id: 'card-2', retention: 0.45, snapshot_date: SNAPSHOT_DATE },
    ])
    mockQuery3([
      { id: 'card-1', front: 'O que é TCP/IP?', content_id: 'content-1' },
      { id: 'card-2', front: 'O que é HTTP?',   content_id: 'content-1' },
    ])

    const result = await getAtRiskCards(USER_ID)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      flashcardId: 'card-1',
      front: 'O que é TCP/IP?',
      contentId: 'content-1',
      retention: 30,
      snapshotDate: SNAPSHOT_DATE,
    })
    expect(result[1]).toEqual({
      flashcardId: 'card-2',
      front: 'O que é HTTP?',
      contentId: 'content-1',
      retention: 45,
      snapshotDate: SNAPSHOT_DATE,
    })
  })

  it('retorna front e contentId vazios para referência órfã (card deletado)', async () => {
    mockQuery1({ snapshot_date: SNAPSHOT_DATE })
    mockQuery2([{ flashcard_id: 'orphan', retention: 0.20, snapshot_date: SNAPSHOT_DATE }])
    mockQuery3([]) // flashcard não existe mais no banco

    const result = await getAtRiskCards(USER_ID)

    expect(result).toHaveLength(1)
    expect(result[0].flashcardId).toBe('orphan')
    expect(result[0].front).toBe('')
    expect(result[0].contentId).toBe('')
    expect(result[0].retention).toBe(20)
  })

  it('converte retenção de decimal para inteiro via Math.round', async () => {
    mockQuery1({ snapshot_date: SNAPSHOT_DATE })
    mockQuery2([{ flashcard_id: 'card-x', retention: 0.355, snapshot_date: SNAPSHOT_DATE }])
    mockQuery3([{ id: 'card-x', front: 'Pergunta X', content_id: 'c-1' }])

    const result = await getAtRiskCards(USER_ID)
    expect(result[0].retention).toBe(36) // Math.round(0.355 * 100) = 36
  })

  it('trata data null da query de flashcards como array vazio', async () => {
    mockQuery1({ snapshot_date: SNAPSHOT_DATE })
    mockQuery2([{ flashcard_id: 'card-1', retention: 0.25, snapshot_date: SNAPSHOT_DATE }])
    mockQuery3(null) // data null = sem flashcards encontrados

    const result = await getAtRiskCards(USER_ID)
    expect(result[0].front).toBe('')
    expect(result[0].contentId).toBe('')
  })

  it('preserva a ordem de retenção crescente retornada pelo Supabase', async () => {
    mockQuery1({ snapshot_date: SNAPSHOT_DATE })
    mockQuery2([
      { flashcard_id: 'low',  retention: 0.10, snapshot_date: SNAPSHOT_DATE },
      { flashcard_id: 'mid',  retention: 0.30, snapshot_date: SNAPSHOT_DATE },
      { flashcard_id: 'high', retention: 0.48, snapshot_date: SNAPSHOT_DATE },
    ])
    mockQuery3([
      { id: 'low',  front: 'Low',  content_id: 'c' },
      { id: 'mid',  front: 'Mid',  content_id: 'c' },
      { id: 'high', front: 'High', content_id: 'c' },
    ])

    const result = await getAtRiskCards(USER_ID)
    expect(result[0].retention).toBe(10)
    expect(result[1].retention).toBe(30)
    expect(result[2].retention).toBe(48)
  })
})
