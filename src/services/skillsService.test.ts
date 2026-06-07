import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockChain = {
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  single: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  delete: vi.fn(),
  order: vi.fn(),
}

// Cada método retorna mockChain por padrão (encadeamento fluente)
Object.keys(mockChain).forEach((key) => {
  ;(mockChain as Record<string, ReturnType<typeof vi.fn>>)[key].mockReturnValue(mockChain)
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockChain,
}))

// Helpers para configurar a chain de forma legível:
// updateUserTotalXP faz duas chamadas a .eq():
//   1ª — no SELECT chain: .from.select.eq.maybeSingle()
//   2ª — no UPDATE chain: .from.update.eq  ← terminal (awaited)
function setupXPMocks(userData: { total_xp: number | null } | null, updateError: unknown = null) {
  mockChain.maybeSingle.mockResolvedValueOnce({ data: userData, error: null })
  // 1ª chamada eq (SELECT) → retorna mockChain para .maybeSingle() funcionar
  // 2ª chamada eq (UPDATE) → retorna resultado terminal
  mockChain.eq
    .mockReturnValueOnce(mockChain)
    .mockResolvedValueOnce({ error: updateError })
}

describe('updateUserTotalXP', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(mockChain).forEach((key) => {
      ;(mockChain as Record<string, ReturnType<typeof vi.fn>>)[key].mockReturnValue(mockChain)
    })
  })

  it('retorna sem chamar Supabase quando userId é vazio', async () => {
    const { updateUserTotalXP } = await import('./skillsService')
    await updateUserTotalXP('', 50)
    expect(mockChain.from).not.toHaveBeenCalled()
  })

  it('usa maybeSingle (não single) para buscar total_xp existente', async () => {
    setupXPMocks({ total_xp: 100 })

    const { updateUserTotalXP } = await import('./skillsService')
    await updateUserTotalXP('user-123', 50)

    expect(mockChain.maybeSingle).toHaveBeenCalled()
    expect(mockChain.single).not.toHaveBeenCalled()
  })

  it('soma XP ao valor existente do usuário via update', async () => {
    setupXPMocks({ total_xp: 200 })

    const { updateUserTotalXP } = await import('./skillsService')
    await updateUserTotalXP('user-123', 50)

    expect(mockChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ total_xp: 250 })
    )
  })

  it('retorna sem atualizar quando usuário não tem linha na tabela', async () => {
    // maybeSingle retorna null → função faz early return sem chamar update
    mockChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null })
    mockChain.eq.mockReturnValueOnce(mockChain) // 1ª eq (SELECT) → mockChain para maybeSingle

    const { updateUserTotalXP } = await import('./skillsService')
    await updateUserTotalXP('user-novo', 30)

    expect(mockChain.update).not.toHaveBeenCalled()
  })

  it('lança erro quando update falha', async () => {
    setupXPMocks({ total_xp: 100 }, { message: 'RLS violation', code: '42501' })

    const { updateUserTotalXP } = await import('./skillsService')
    await expect(updateUserTotalXP('user-123', 10)).rejects.toEqual(
      expect.objectContaining({ message: 'RLS violation' })
    )
  })

  it('usa total_xp: 0 como base quando valor é null', async () => {
    setupXPMocks({ total_xp: null })

    const { updateUserTotalXP } = await import('./skillsService')
    await updateUserTotalXP('user-123', 20)

    expect(mockChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ total_xp: 20 })
    )
  })
})
