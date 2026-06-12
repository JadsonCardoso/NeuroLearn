import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { DbProject } from '@/types/database.types'

// ── Mock do Supabase ──────────────────────────────────────────────────────────

const mockChain = {
  from: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  in: vi.fn(),
  order: vi.fn(),
  single: vi.fn(),
}

Object.values(mockChain).forEach((fn) => fn.mockReturnValue(mockChain))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockChain,
}))

const {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  assignTrailToProject,
  removeTrailFromProject,
  calculateProjectProgress,
} = await import('./projectsService')

// ── Fixtures ──────────────────────────────────────────────────────────────────

const dbProject: DbProject = {
  id: 'proj-1',
  user_id: 'user-1',
  name: 'NeuroLearn v2',
  description: 'Projeto de aprendizado',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  Object.values(mockChain).forEach((fn) =>
    (fn as ReturnType<typeof vi.fn>).mockReturnValue(mockChain)
  )
})

// ── listProjects ──────────────────────────────────────────────────────────────

describe('listProjects', () => {
  it('retorna projetos mapeados corretamente', async () => {
    mockChain.order.mockResolvedValueOnce({ data: [dbProject], error: null })
    const result = await listProjects('user-1')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'proj-1',
      name: 'NeuroLearn v2',
      description: 'Projeto de aprendizado',
      createdAt: '2026-01-01T00:00:00.000Z',
    })
  })

  it('retorna array vazio quando não há projetos', async () => {
    mockChain.order.mockResolvedValueOnce({ data: [], error: null })
    const result = await listProjects('user-1')
    expect(result).toHaveLength(0)
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: new Error('db error') })
    await expect(listProjects('user-1')).rejects.toThrow('db error')
  })
})

// ── createProject ─────────────────────────────────────────────────────────────

describe('createProject', () => {
  it('cria e retorna projeto mapeado', async () => {
    mockChain.single.mockResolvedValueOnce({ data: dbProject, error: null })
    const result = await createProject('user-1', {
      name: 'NeuroLearn v2',
      description: 'Projeto de aprendizado',
    })
    expect(result.id).toBe('proj-1')
    expect(result.name).toBe('NeuroLearn v2')
  })

  it('define description como null quando não informado', async () => {
    mockChain.single.mockResolvedValueOnce({
      data: { ...dbProject, description: null },
      error: null,
    })
    await createProject('user-1', { name: 'Projeto sem desc' })
    const insertCall = mockChain.insert.mock.calls[0][0]
    expect(insertCall.description).toBeNull()
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: new Error('insert error') })
    await expect(createProject('user-1', { name: 'X' })).rejects.toThrow('insert error')
  })
})

// ── updateProject ─────────────────────────────────────────────────────────────
// updateProject encadeia dois .eq() — o primeiro retorna a chain, o segundo resolve

describe('updateProject', () => {
  it('resolve sem erro quando atualização é bem-sucedida', async () => {
    mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({ error: null })
    await expect(updateProject('proj-1', 'user-1', { name: 'Novo nome' })).resolves.toBeUndefined()
  })

  it('inclui updated_at no payload', async () => {
    mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({ error: null })
    await updateProject('proj-1', 'user-1', { name: 'Atualizado' })
    const updateCall = mockChain.update.mock.calls[0][0]
    expect(updateCall).toHaveProperty('updated_at')
    expect(updateCall).toHaveProperty('name', 'Atualizado')
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.eq
      .mockReturnValueOnce(mockChain)
      .mockResolvedValueOnce({ error: new Error('update error') })
    await expect(updateProject('proj-1', 'user-1', { name: 'X' })).rejects.toThrow('update error')
  })
})

// ── deleteProject ─────────────────────────────────────────────────────────────
// deleteProject encadeia dois .eq() — o primeiro retorna a chain, o segundo resolve

describe('deleteProject', () => {
  it('resolve sem erro quando deleção é bem-sucedida', async () => {
    mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({ error: null })
    await expect(deleteProject('proj-1', 'user-1')).resolves.toBeUndefined()
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.eq
      .mockReturnValueOnce(mockChain)
      .mockResolvedValueOnce({ error: new Error('delete error') })
    await expect(deleteProject('proj-1', 'user-1')).rejects.toThrow('delete error')
  })
})

// ── removeTrailFromProject ────────────────────────────────────────────────────
// Encadeia dois .eq() — o primeiro retorna a chain, o segundo resolve

describe('removeTrailFromProject', () => {
  it('resolve sem erro e define project_id como null', async () => {
    mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({ error: null })
    await expect(removeTrailFromProject('trail-1', 'user-1')).resolves.toBeUndefined()
    const updateCall = mockChain.update.mock.calls[0][0]
    expect(updateCall.project_id).toBeNull()
  })

  it('lança erro quando Supabase retorna error', async () => {
    mockChain.eq
      .mockReturnValueOnce(mockChain)
      .mockResolvedValueOnce({ error: new Error('remove error') })
    await expect(removeTrailFromProject('trail-1', 'user-1')).rejects.toThrow('remove error')
  })
})

// ── assignTrailToProject ──────────────────────────────────────────────────────
// Fluxo: valida projeto (single) → valida trilha (single) → update (eq resolve)

describe('assignTrailToProject', () => {
  function setupSuccess(trailProjectId: string | null = null) {
    // Q1: verifica projeto — resolve no .single()
    // Q2: verifica trilha — resolve no .single()
    // Q3: update — os 4 primeiros .eq() defaultam para mockChain, o 5º retorna chain, o 6º resolve
    mockChain.single
      .mockResolvedValueOnce({ data: { id: 'proj-1' }, error: null }) // Q1
      .mockResolvedValueOnce({ data: { id: 'trail-1', project_id: trailProjectId }, error: null }) // Q2
    mockChain.eq
      .mockReturnValueOnce(mockChain) // Q1: .eq('id', projectId)
      .mockReturnValueOnce(mockChain) // Q1: .eq('user_id', userId)
      .mockReturnValueOnce(mockChain) // Q2: .eq('id', trailId)
      .mockReturnValueOnce(mockChain) // Q2: .eq('user_id', userId)
      .mockReturnValueOnce(mockChain) // Q3: .eq('id', trailId)
      .mockResolvedValueOnce({ error: null }) // Q3: .eq('user_id', userId)
  }

  it('resolve quando projeto e trilha pertencem ao usuário', async () => {
    setupSuccess()
    await expect(assignTrailToProject('trail-1', 'proj-1', 'user-1')).resolves.toBeUndefined()
  })

  it('permite reassociar trilha ao mesmo projeto (idempotente)', async () => {
    setupSuccess('proj-1') // trilha já está nesse projeto
    await expect(assignTrailToProject('trail-1', 'proj-1', 'user-1')).resolves.toBeUndefined()
  })

  it('lança erro quando projeto não é encontrado (RN-009)', async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: new Error('not found') })
    await expect(assignTrailToProject('trail-1', 'proj-x', 'user-1')).rejects.toThrow(
      'Projeto não encontrado ou sem permissão.'
    )
  })

  it('lança erro quando trilha pertence a outro projeto (RN-004)', async () => {
    mockChain.single
      .mockResolvedValueOnce({ data: { id: 'proj-1' }, error: null }) // projeto ok
      .mockResolvedValueOnce({ data: { id: 'trail-1', project_id: 'outro-projeto' }, error: null }) // trilha em outro projeto
    await expect(assignTrailToProject('trail-1', 'proj-1', 'user-1')).rejects.toThrow(
      'Trilha já está associada a outro Projeto.'
    )
  })

  it('lança erro quando trilha não pertence ao usuário (RN-013)', async () => {
    mockChain.single
      .mockResolvedValueOnce({ data: { id: 'proj-1' }, error: null })
      .mockResolvedValueOnce({ data: null, error: new Error('not found') }) // trilha de outro user
    await expect(assignTrailToProject('trail-1', 'proj-1', 'user-1')).rejects.toThrow(
      'Trilha não encontrada ou sem permissão.'
    )
  })
})

// ── calculateProjectProgress ──────────────────────────────────────────────────
// Progresso = média simples das Trilhas; cada Trilha = média de seus Conteúdos
// RN-014 / RN-015 / D-01

describe('calculateProjectProgress', () => {
  it('retorna 0 quando não há Trilhas associadas (RN-015)', async () => {
    // Q1: trailing eq → resolve com array vazio
    mockChain.eq
      .mockReturnValueOnce(mockChain) // .eq('project_id', ...)
      .mockResolvedValueOnce({ data: [], error: null }) // .eq('user_id', ...) → sem trilhas
    const result = await calculateProjectProgress('proj-1', 'user-1')
    expect(result).toBe(0)
  })

  it('calcula média simples de Trilhas com Conteúdos (D-01)', async () => {
    // Q1: duas trilhas
    // Q2: trail-1 com conteúdo 60%, trail-2 com conteúdo 100%
    // Esperado: trail-1 = 60, trail-2 = 100, média = 80
    mockChain.eq
      .mockReturnValueOnce(mockChain) // Q1: .eq('project_id', ...)
      .mockResolvedValueOnce({ data: [{ id: 'trail-1' }, { id: 'trail-2' }], error: null }) // Q1 resolve
      .mockResolvedValueOnce({
        data: [
          { trail_id: 'trail-1', progress: 60 },
          { trail_id: 'trail-2', progress: 100 },
        ],
        error: null,
      }) // Q2 resolve
    const result = await calculateProjectProgress('proj-1', 'user-1')
    expect(result).toBe(80)
  })

  it('conta Trilhas sem Conteúdos como 0% (RN-014)', async () => {
    // trail-1 sem conteúdos = 0%; trail-2 com 100% → média = 50%
    mockChain.eq
      .mockReturnValueOnce(mockChain) // Q1: .eq('project_id', ...)
      .mockResolvedValueOnce({ data: [{ id: 'trail-1' }, { id: 'trail-2' }], error: null })
      .mockResolvedValueOnce({
        data: [{ trail_id: 'trail-2', progress: 100 }],
        error: null,
      })
    const result = await calculateProjectProgress('proj-1', 'user-1')
    expect(result).toBe(50)
  })

  it('retorna 100 quando todas as Trilhas estão concluídas (RN-016)', async () => {
    mockChain.eq
      .mockReturnValueOnce(mockChain)
      .mockResolvedValueOnce({ data: [{ id: 'trail-1' }], error: null })
      .mockResolvedValueOnce({ data: [{ trail_id: 'trail-1', progress: 100 }], error: null })
    const result = await calculateProjectProgress('proj-1', 'user-1')
    expect(result).toBe(100)
  })

  it('lança erro quando query de Trilhas falha', async () => {
    mockChain.eq
      .mockReturnValueOnce(mockChain)
      .mockResolvedValueOnce({ data: null, error: new Error('db trails error') })
    await expect(calculateProjectProgress('proj-1', 'user-1')).rejects.toThrow('db trails error')
  })

  it('lança erro quando query de Conteúdos falha', async () => {
    mockChain.eq
      .mockReturnValueOnce(mockChain)
      .mockResolvedValueOnce({ data: [{ id: 'trail-1' }], error: null })
      .mockResolvedValueOnce({ data: null, error: new Error('db contents error') })
    await expect(calculateProjectProgress('proj-1', 'user-1')).rejects.toThrow('db contents error')
  })
})
