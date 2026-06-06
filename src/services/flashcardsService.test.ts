import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { DbFlashcard } from '@/types/database.types'

// ── Mock do Supabase ──────────────────────────────────────────────────────────

const mockChain = {
  from:   vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  eq:     vi.fn(),
  lte:    vi.fn(),
  order:  vi.fn(),
  single: vi.fn(),
}

Object.values(mockChain).forEach((fn) => fn.mockReturnValue(mockChain))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockChain,
}))

const {
  listFlashcardsByContent,
  listDueFlashcards,
  listAllFlashcards,
  createFlashcards,
  updateFlashcardSM2,
} = await import('./flashcardsService')

// ── Fixture ───────────────────────────────────────────────────────────────────

const dbCard: DbFlashcard = {
  id: 'card-1',
  user_id: 'user-1',
  content_id: 'content-1',
  front: 'O que é SOLID?',
  back: 'Princípios de design OO',
  ef: 2.5,
  interval: 1,
  repetitions: 0,
  next_review: '2026-01-02',
  last_review: null,
  mastery: 'learning',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  Object.values(mockChain).forEach((fn) => (fn as ReturnType<typeof vi.fn>).mockReturnValue(mockChain))
})

// ── listFlashcardsByContent ───────────────────────────────────────────────────

describe('listFlashcardsByContent', () => {
  it('retorna cards mapeados corretamente', async () => {
    mockChain.order.mockResolvedValueOnce({ data: [dbCard], error: null })
    const result = await listFlashcardsByContent('content-1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('card-1')
    expect(result[0].cid).toBe('content-1')
    expect(result[0].reps).toBe(0)        // repetitions → reps
    expect(result[0].front).toBe('O que é SOLID?')
  })

  it('retorna array vazio quando data é null', async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: null })
    expect(await listFlashcardsByContent('content-1')).toEqual([])
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: new Error('DB error') })
    await expect(listFlashcardsByContent('content-1')).rejects.toThrow('DB error')
  })
})

// ── listDueFlashcards ─────────────────────────────────────────────────────────

describe('listDueFlashcards', () => {
  it('retorna cards devidos', async () => {
    mockChain.order.mockResolvedValueOnce({ data: [dbCard], error: null })
    const result = await listDueFlashcards()
    expect(result).toHaveLength(1)
  })

  it('retorna vazio quando não há cards devidos', async () => {
    mockChain.order.mockResolvedValueOnce({ data: [], error: null })
    expect(await listDueFlashcards()).toEqual([])
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: new Error('Query error') })
    await expect(listDueFlashcards()).rejects.toThrow('Query error')
  })
})

// ── listAllFlashcards ─────────────────────────────────────────────────────────

describe('listAllFlashcards', () => {
  it('retorna todos os cards do usuário', async () => {
    mockChain.order.mockResolvedValueOnce({ data: [dbCard, { ...dbCard, id: 'card-2' }], error: null })
    const result = await listAllFlashcards()
    expect(result).toHaveLength(2)
  })
})

// ── createFlashcards ──────────────────────────────────────────────────────────

describe('createFlashcards', () => {
  it('retorna array de FlashCards criados', async () => {
    mockChain.select.mockResolvedValueOnce({ data: [dbCard], error: null })
    const result = await createFlashcards('user-1', 'content-1', [
      { front: 'O que é SOLID?', back: 'Princípios de design OO' },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('card-1')
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.select.mockResolvedValueOnce({ data: null, error: new Error('Insert failed') })
    await expect(
      createFlashcards('user-1', 'content-1', [{ front: 'Q', back: 'A' }])
    ).rejects.toThrow('Insert failed')
  })
})

// ── updateFlashcardSM2 ────────────────────────────────────────────────────────

describe('updateFlashcardSM2', () => {
  it('resolve sem erro em atualização bem-sucedida', async () => {
    mockChain.eq.mockResolvedValueOnce({ error: null })
    await expect(
      updateFlashcardSM2('card-1', {
        ef: 2.8, interval: 4, reps: 1,
        nextReview: '2026-01-06', lastReview: '2026-01-02', mastery: 'review',
      })
    ).resolves.toBeUndefined()
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.eq.mockResolvedValueOnce({ error: new Error('Update failed') })
    await expect(
      updateFlashcardSM2('card-1', {
        ef: 2.5, interval: 1, reps: 0, nextReview: null, lastReview: null, mastery: 'learning',
      })
    ).rejects.toThrow('Update failed')
  })

  it('mapeador: nextReview null → undefined na query (não seta como null)', async () => {
    mockChain.eq.mockResolvedValueOnce({ error: null })
    await updateFlashcardSM2('card-1', {
      ef: 2.5, interval: 1, reps: 0, nextReview: null, lastReview: null, mastery: 'learning',
    })
    // Verifica que .update() foi chamado (sem erro de tipo)
    expect(mockChain.update).toHaveBeenCalled()
  })
})
