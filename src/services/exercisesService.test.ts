import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { DbExercise } from '@/types/database.types'

// ── Mock do Supabase ──────────────────────────────────────────────────────────

const mockChain = {
  from: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  single: vi.fn(),
}

Object.values(mockChain).forEach((fn) => fn.mockReturnValue(mockChain))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockChain,
}))

const { listExercisesByContent, createExercise, updateExercise, deleteExercise } =
  await import('./exercisesService')

// ── Fixture ───────────────────────────────────────────────────────────────────

const dbExercise: DbExercise = {
  id: 'ex-1',
  user_id: 'user-1',
  content_id: 'content-1',
  question: 'O que é o princípio da responsabilidade única?',
  answer: 'Uma classe deve ter apenas um motivo para mudar.',
  type: 'free_response',
  notes: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  Object.values(mockChain).forEach((fn) =>
    (fn as ReturnType<typeof vi.fn>).mockReturnValue(mockChain)
  )
})

// ── listExercisesByContent ────────────────────────────────────────────────────

describe('listExercisesByContent', () => {
  it('retorna exercícios mapeados corretamente', async () => {
    mockChain.order.mockResolvedValueOnce({ data: [dbExercise], error: null })
    const result = await listExercisesByContent('user-1', 'content-1')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'ex-1',
      contentId: 'content-1',
      question: 'O que é o princípio da responsabilidade única?',
      answer: 'Uma classe deve ter apenas um motivo para mudar.',
      type: 'free_response',
      notes: null,
    })
  })

  it('retorna array vazio quando não há exercícios', async () => {
    mockChain.order.mockResolvedValueOnce({ data: [], error: null })
    const result = await listExercisesByContent('user-1', 'content-vazio')
    expect(result).toHaveLength(0)
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: new Error('db error') })
    await expect(listExercisesByContent('user-1', 'content-1')).rejects.toThrow('db error')
  })
})

// ── createExercise ────────────────────────────────────────────────────────────

describe('createExercise', () => {
  it('cria e retorna exercício mapeado', async () => {
    mockChain.single.mockResolvedValueOnce({ data: dbExercise, error: null })
    const result = await createExercise('user-1', 'content-1', {
      question: 'O que é o princípio da responsabilidade única?',
      answer: 'Uma classe deve ter apenas um motivo para mudar.',
    })
    expect(result.id).toBe('ex-1')
    expect(result.type).toBe('free_response')
  })

  it('usa type "free_response" por padrão quando não informado', async () => {
    mockChain.single.mockResolvedValueOnce({ data: dbExercise, error: null })
    await createExercise('user-1', 'content-1', {
      question: 'Pergunta',
      answer: 'Resposta',
    })
    // Verifica que insert foi chamado com type = 'free_response'
    const insertCall = mockChain.insert.mock.calls[0][0]
    expect(insertCall.type).toBe('free_response')
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: new Error('insert error') })
    await expect(
      createExercise('user-1', 'content-1', { question: 'Q', answer: 'A' })
    ).rejects.toThrow('insert error')
  })
})

// ── updateExercise ────────────────────────────────────────────────────────────
// updateExercise encadeia dois .eq() — o primeiro retorna a chain, o segundo resolve

describe('updateExercise', () => {
  it('resolve sem erro quando atualização é bem-sucedida', async () => {
    mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({ error: null })
    await expect(
      updateExercise('ex-1', 'user-1', { answer: 'Resposta atualizada' })
    ).resolves.toBeUndefined()
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.eq
      .mockReturnValueOnce(mockChain)
      .mockResolvedValueOnce({ error: new Error('update error') })
    await expect(updateExercise('ex-1', 'user-1', { answer: 'Nova resposta' })).rejects.toThrow(
      'update error'
    )
  })

  it('inclui updated_at no payload de atualização', async () => {
    mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({ error: null })
    await updateExercise('ex-1', 'user-1', { question: 'Nova pergunta' })
    const updateCall = mockChain.update.mock.calls[0][0]
    expect(updateCall).toHaveProperty('updated_at')
    expect(updateCall).toHaveProperty('question', 'Nova pergunta')
  })
})

// ── deleteExercise ────────────────────────────────────────────────────────────
// deleteExercise encadeia dois .eq() — o primeiro retorna a chain, o segundo resolve

describe('deleteExercise', () => {
  it('resolve sem erro quando deleção é bem-sucedida', async () => {
    mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({ error: null })
    await expect(deleteExercise('ex-1', 'user-1')).resolves.toBeUndefined()
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.eq
      .mockReturnValueOnce(mockChain)
      .mockResolvedValueOnce({ error: new Error('delete error') })
    await expect(deleteExercise('ex-1', 'user-1')).rejects.toThrow('delete error')
  })
})
