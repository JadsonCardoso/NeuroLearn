import { createClient } from '@/lib/supabase/client'
import type { StudySession } from '@/types'

interface StudySessionInput {
  userId: string
  contentId: string
  duration: number
  cardsCreated: number
  xpEarned: number
  mode?: string
  notes?: string
  highlights?: string[]
  teachText?: string
}

export async function createStudySession(input: StudySessionInput): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('study_sessions').insert({
    user_id: input.userId,
    content_id: input.contentId,
    duration: input.duration,
    cards_created: input.cardsCreated,
    xp_earned: input.xpEarned,
    mode: input.mode ?? null,
    ended_at: new Date().toISOString(),
    notes: input.notes ?? '',
    highlights: input.highlights ?? [],
    teach_text: input.teachText ?? '',
  })

  if (error) throw error
}

export interface StudySessionUpdateInput {
  notes?: string
  highlights?: string[]
  teachText?: string
}

export async function updateStudySession(
  id: string,
  userId: string,
  input: StudySessionUpdateInput
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('study_sessions')
    .update({
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.highlights !== undefined && { highlights: input.highlights }),
      ...(input.teachText !== undefined && { teach_text: input.teachText }),
    })
    .eq('id', id)
    .eq('user_id', userId) // ADR-004 Ownership First

  if (error) throw error
}

export async function deleteStudySession(id: string, userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('study_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId) // ADR-004 Ownership First

  if (error) throw error
}

export async function listRecentSessions(userId: string, limit = 30): Promise<StudySession[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('study_sessions')
    .select('id, content_id, started_at, duration, cards_created, notes, highlights, teach_text')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[sessionsService] Erro ao listar sessões:', error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    cid: row.content_id,
    date: row.started_at ?? new Date().toISOString(),
    duration: row.duration ?? 0,
    cardsCreated: row.cards_created ?? 0,
    notes: row.notes ?? '',
    highlights: Array.isArray(row.highlights) ? (row.highlights as string[]) : [],
    teach: row.teach_text ?? '',
  }))
}
