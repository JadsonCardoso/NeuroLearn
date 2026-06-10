import { createClient } from '@/lib/supabase/client'
import type { StudySession } from '@/types'

interface StudySessionInput {
  userId: string
  contentId: string
  duration: number
  cardsCreated: number
  xpEarned: number
  mode?: string
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
  })

  if (error) throw error
}

export async function listRecentSessions(
  userId: string,
  limit = 30,
): Promise<StudySession[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('study_sessions')
    .select('id, content_id, started_at, duration, cards_created')
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
    highlights: [],
    notes: '',
    teach: '',
  }))
}
