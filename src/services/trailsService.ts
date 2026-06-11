import { createClient } from '@/lib/supabase/client'
import type { DbTrail } from '@/types/database.types'
import type { LearningTrail, TrailType } from '@/types'

export interface TrailInput {
  title: string
  type: TrailType
  description?: string
  color: string
  iconEmoji: string
  goal?: string
  skillId?: string | null
}

function toTrail(row: DbTrail): LearningTrail {
  return {
    id: row.id,
    title: row.title,
    type: row.type as TrailType,
    description: row.description ?? '',
    color: row.color,
    iconEmoji: row.icon_emoji,
    goal: row.goal ?? '',
    skillId: row.skill_id,
    createdAt: row.created_at ?? '',
  }
}

export async function listTrails(userId: string): Promise<LearningTrail[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('learning_trails')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(toTrail)
}

export async function createTrail(userId: string, input: TrailInput): Promise<LearningTrail> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('learning_trails')
    .insert({
      user_id: userId,
      title: input.title,
      type: input.type,
      description: input.description || null,
      color: input.color,
      icon_emoji: input.iconEmoji,
      goal: input.goal || null,
      skill_id: input.skillId || null,
    })
    .select()
    .single()

  if (error) throw error
  return toTrail(data)
}

export async function updateTrail(
  id: string,
  userId: string,
  input: Partial<TrailInput>
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('learning_trails')
    .update({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.description !== undefined && { description: input.description || null }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.iconEmoji !== undefined && { icon_emoji: input.iconEmoji }),
      ...(input.goal !== undefined && { goal: input.goal || null }),
      ...(input.skillId !== undefined && { skill_id: input.skillId || null }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}

export async function deleteTrail(id: string, userId: string): Promise<void> {
  const supabase = createClient()
  // ON DELETE SET NULL no FK garante que contents.trail_id → null automaticamente (ADR-008)
  const { error } = await supabase
    .from('learning_trails')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}

export async function assignContentToTrail(
  contentId: string,
  trailId: string | null
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('contents')
    .update({ trail_id: trailId, updated_at: new Date().toISOString() })
    .eq('id', contentId)

  if (error) throw error
}

export async function createDefaultTrail(
  userId: string,
  contentIds: string[]
): Promise<LearningTrail> {
  const trail = await createTrail(userId, {
    title: 'Meus Estudos',
    type: 'free',
    description: 'Trilha padrão criada automaticamente com seus conteúdos existentes.',
    color: '#7c3aed',
    iconEmoji: '📚',
  })

  if (contentIds.length > 0) {
    const supabase = createClient()
    const { error } = await supabase
      .from('contents')
      .update({ trail_id: trail.id, updated_at: new Date().toISOString() })
      .in('id', contentIds)

    if (error) throw error
  }

  return trail
}
