import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock do Supabase ──────────────────────────────────────────────────────────

const mockChain = {
  from:   vi.fn(),
  insert: vi.fn(),
}

Object.values(mockChain).forEach((fn) => fn.mockReturnValue(mockChain))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockChain,
}))

const { recordReviewCycle } = await import('./reviewService')

beforeEach(() => {
  vi.clearAllMocks()
  Object.values(mockChain).forEach((fn) => (fn as ReturnType<typeof vi.fn>).mockReturnValue(mockChain))
})

const baseInput = {
  userId: 'user-1',
  flashcardId: 'card-1',
  quality: 4,
  efBefore: 2.5,
  efAfter: 2.6,
  intervalBefore: 1,
  intervalAfter: 4,
  xpEarned: 10,
}

describe('recordReviewCycle', () => {
  it('resolve sem erro em inserção bem-sucedida', async () => {
    mockChain.insert.mockResolvedValueOnce({ error: null })
    await expect(recordReviewCycle(baseInput)).resolves.toBeUndefined()
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.insert.mockResolvedValueOnce({ error: new Error('DB error') })
    await expect(recordReviewCycle(baseInput)).rejects.toThrow('DB error')
  })

  it('insere todos os campos obrigatórios', async () => {
    mockChain.insert.mockResolvedValueOnce({ error: null })
    await recordReviewCycle(baseInput)
    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        flashcard_id: 'card-1',
        quality: 4,
        ef_before: 2.5,
        ef_after: 2.6,
        interval_before: 1,
        interval_after: 4,
        xp_earned: 10,
      })
    )
  })

  it('funciona com qualidade 0 (pior avaliação)', async () => {
    mockChain.insert.mockResolvedValueOnce({ error: null })
    await expect(recordReviewCycle({ ...baseInput, quality: 0 })).resolves.toBeUndefined()
  })

  it('funciona com qualidade 5 (melhor avaliação)', async () => {
    mockChain.insert.mockResolvedValueOnce({ error: null })
    await expect(recordReviewCycle({ ...baseInput, quality: 5 })).resolves.toBeUndefined()
  })
})
