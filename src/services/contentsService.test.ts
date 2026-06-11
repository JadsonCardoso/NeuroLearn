import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { DbContent } from '@/types/database.types'

// ── Mock do Supabase ──────────────────────────────────────────────────────────

const mockAuth = {
  getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
}

const mockChain = {
  from: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  single: vi.fn(),
  auth: mockAuth,
}

// Cada chamada retorna a própria chain (builder pattern) — exceto auth
Object.entries(mockChain).forEach(([key, fn]) => {
  if (key !== 'auth') (fn as ReturnType<typeof vi.fn>).mockReturnValue(mockChain)
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockChain,
}))

// Importar DEPOIS do mock
const { listContents, createContent, updateContentProgress, removeContent } =
  await import('./contentsService')

// ── Fixture ───────────────────────────────────────────────────────────────────

const dbRow: DbContent = {
  id: 'uuid-1',
  user_id: 'user-1',
  title: 'Clean Code',
  type: 'book',
  author: 'Robert C. Martin',
  description: 'Boas práticas de código',
  progress: 0,
  color: '#7c3aed',
  added_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  trail_id: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  Object.entries(mockChain).forEach(([key, fn]) => {
    if (key !== 'auth') (fn as ReturnType<typeof vi.fn>).mockReturnValue(mockChain)
  })
  mockAuth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
})

// ── listContents ──────────────────────────────────────────────────────────────

describe('listContents', () => {
  it('retorna array de Content mapeado corretamente', async () => {
    mockChain.order.mockResolvedValueOnce({ data: [dbRow], error: null })
    const result = await listContents('user-1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('uuid-1')
    expect(result[0].title).toBe('Clean Code')
    expect(result[0].desc).toBe('Boas práticas de código') // description → desc
  })

  it('retorna array vazio quando data é null', async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: null })
    const result = await listContents('user-1')
    expect(result).toEqual([])
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: new Error('DB error') })
    await expect(listContents('user-1')).rejects.toThrow('DB error')
  })

  it('converte author null para string vazia', async () => {
    mockChain.order.mockResolvedValueOnce({
      data: [{ ...dbRow, author: null }],
      error: null,
    })
    const result = await listContents('user-1')
    expect(result[0].author).toBe('')
  })

  it('converte description null para string vazia', async () => {
    mockChain.order.mockResolvedValueOnce({
      data: [{ ...dbRow, description: null }],
      error: null,
    })
    const result = await listContents('user-1')
    expect(result[0].desc).toBe('')
  })
})

// ── createContent ─────────────────────────────────────────────────────────────

describe('createContent', () => {
  it('retorna Content após inserção bem-sucedida', async () => {
    mockChain.single.mockResolvedValueOnce({ data: dbRow, error: null })
    const result = await createContent('user-1', {
      title: 'Clean Code',
      type: 'book',
      author: 'Robert C. Martin',
      desc: 'Boas práticas',
      color: '#7c3aed',
    })
    expect(result.id).toBe('uuid-1')
    expect(result.title).toBe('Clean Code')
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: new Error('Insert failed') })
    await expect(
      createContent('user-1', { title: 'x', type: 'note', author: '', desc: '', color: '#fff' })
    ).rejects.toThrow('Insert failed')
  })
})

// ── updateContentProgress ─────────────────────────────────────────────────────

describe('updateContentProgress', () => {
  it('resolve sem erro em atualização bem-sucedida', async () => {
    mockChain.eq.mockResolvedValueOnce({ error: null })
    await expect(updateContentProgress('uuid-1', 75)).resolves.toBeUndefined()
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.eq.mockResolvedValueOnce({ error: new Error('Update failed') })
    await expect(updateContentProgress('uuid-1', 75)).rejects.toThrow('Update failed')
  })
})

// ── removeContent ─────────────────────────────────────────────────────────────

describe('removeContent', () => {
  it('resolve sem erro em deleção bem-sucedida', async () => {
    // removeContent encadeia .eq('id').eq('user_id') — primeiro retorna chain, segundo resolve
    mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({ error: null })
    await expect(removeContent('uuid-1')).resolves.toBeUndefined()
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.eq
      .mockReturnValueOnce(mockChain)
      .mockResolvedValueOnce({ error: new Error('Delete failed') })
    await expect(removeContent('uuid-1')).rejects.toThrow('Delete failed')
  })
})
