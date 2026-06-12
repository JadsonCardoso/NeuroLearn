import { createClient } from '@/lib/supabase/client'
import type { DbProject } from '@/types/database.types'
import type { Project } from '@/types'

export interface ProjectInput {
  name: string
  description?: string | null
}

function toProject(row: DbProject): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ── RF-192 ─────────────────────────────────────────────────────────────────────
export async function listProjects(userId: string): Promise<Project[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(toProject)
}

// ── RF-191 ─────────────────────────────────────────────────────────────────────
export async function createProject(userId: string, input: ProjectInput): Promise<Project> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return toProject(data)
}

// ── RF-193 ─────────────────────────────────────────────────────────────────────
export async function updateProject(
  id: string,
  userId: string,
  input: Partial<ProjectInput>
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('projects')
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description ?? null }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId) // ADR-004 Ownership First

  if (error) throw error
}

// ── RF-194 ─────────────────────────────────────────────────────────────────────
// FK ON DELETE SET NULL em learning_trails.project_id garante desassociação (RN-005)
// sem remover Trilhas, Conteúdos, Sessões ou Revisões (RN-006, RN-007, RN-008)
export async function deleteProject(id: string, userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', userId) // ADR-004 Ownership First

  if (error) throw error
}

// ── RF-195 ─────────────────────────────────────────────────────────────────────
// RN-009: Projeto pertence ao userId
// RN-013: Trilha pertence ao userId (sem acesso a trilhas de terceiros)
// RN-004: Trilha não pode estar em múltiplos Projetos simultaneamente
export async function assignTrailToProject(
  trailId: string,
  projectId: string,
  userId: string
): Promise<void> {
  const supabase = createClient()

  // Valida ownership do Projeto (RN-009, ADR-004)
  const { data: project, error: projError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (projError || !project) throw new Error('Projeto não encontrado ou sem permissão.')

  // Valida ownership da Trilha e verifica associação existente (RN-013, RN-004)
  const { data: trail, error: trailError } = await supabase
    .from('learning_trails')
    .select('id, project_id')
    .eq('id', trailId)
    .eq('user_id', userId)
    .single()

  if (trailError || !trail) throw new Error('Trilha não encontrada ou sem permissão.')

  if (trail.project_id !== null && trail.project_id !== projectId) {
    throw new Error('Trilha já está associada a outro Projeto.')
  }

  const { error } = await supabase
    .from('learning_trails')
    .update({ project_id: projectId, updated_at: new Date().toISOString() })
    .eq('id', trailId)
    .eq('user_id', userId)

  if (error) throw error
}

// ── RF-195 (desassociação) ─────────────────────────────────────────────────────
export async function removeTrailFromProject(trailId: string, userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('learning_trails')
    .update({ project_id: null, updated_at: new Date().toISOString() })
    .eq('id', trailId)
    .eq('user_id', userId)

  if (error) throw error
}

// ── RF-196 ─────────────────────────────────────────────────────────────────────
// Progresso do Projeto = média simples do progresso das Trilhas associadas
// RN-014: calculado com base nas Trilhas associadas
// RN-015: Projeto sem Trilhas = 0%
// RN-016: Projeto concluído = 100%
// RN-017: atualização automática (chamada após cada mutação relevante)
export async function calculateProjectProgress(projectId: string, userId: string): Promise<number> {
  const supabase = createClient()

  // Busca IDs das Trilhas associadas ao Projeto
  const { data: trails, error: trailsError } = await supabase
    .from('learning_trails')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (trailsError) throw trailsError
  if (!trails || trails.length === 0) return 0 // RN-015

  const trailIds = trails.map((t) => t.id)

  // Busca progresso dos Conteúdos agrupados por Trilha
  const { data: contents, error: contentsError } = await supabase
    .from('contents')
    .select('trail_id, progress')
    .in('trail_id', trailIds)
    .eq('user_id', userId)

  if (contentsError) throw contentsError

  // Agrupa progresso dos conteúdos por trilha
  const progressByTrail = new Map<string, number[]>()
  for (const trailId of trailIds) {
    progressByTrail.set(trailId, [])
  }
  for (const content of contents ?? []) {
    if (content.trail_id) {
      const arr = progressByTrail.get(content.trail_id) ?? []
      arr.push(content.progress)
      progressByTrail.set(content.trail_id, arr)
    }
  }

  // Progresso por Trilha: média dos Conteúdos (0 se sem conteúdos)
  const trailProgresses = trailIds.map((trailId) => {
    const values = progressByTrail.get(trailId) ?? []
    if (values.length === 0) return 0
    return values.reduce((sum, p) => sum + p, 0) / values.length
  })

  // Progresso do Projeto: média simples das Trilhas (D-01)
  const total = trailProgresses.reduce((sum, p) => sum + p, 0)
  return Math.round(total / trailProgresses.length)
}
