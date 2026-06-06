import { createClient } from '@/lib/supabase/client'

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
