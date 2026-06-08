import { createClient } from '@/lib/supabase/client'
import { updateUserStreak } from '@/services/skillsService'

export interface BackupRestoreInput {
  contents: {
    id: string; title: string; type: string; author: string; desc: string
    progress: number; color: string; addedAt: string
  }[]
  cards: {
    id: string; cid: string; front: string; back: string; ef: number; interval: number
    reps: number; nextReview: string | null; lastReview: string | null; mastery: string
  }[]
  streak: number
  lastStudyDate: string
  totalXp: number
}

/**
 * Restaura conteúdos e flashcards no Supabase via upsert (onConflict: 'id').
 * Skills e sessões NÃO são sincronizadas: skills usam join table complexo;
 * sessions têm risco de duplicatas sem chave natural única.
 */
export async function restoreToSupabase(userId: string, data: BackupRestoreInput): Promise<void> {
  const supabase = createClient()

  if (data.contents.length > 0) {
    const { error } = await supabase.from('contents').upsert(
      data.contents.map((c) => ({
        id: c.id,
        user_id: userId,
        title: c.title,
        type: c.type,
        author: c.author || null,
        description: c.desc || null,
        color: c.color,
        progress: c.progress,
        added_at: c.addedAt,
      })),
      { onConflict: 'id' }
    )
    if (error) throw new Error(`Erro ao restaurar conteúdos: ${error.message}`)
  }

  if (data.cards.length > 0) {
    const { error } = await supabase.from('flashcards').upsert(
      data.cards.map((c) => ({
        id: c.id,
        user_id: userId,
        content_id: c.cid,
        front: c.front,
        back: c.back,
        ef: c.ef,
        interval: c.interval,
        repetitions: c.reps,
        next_review: c.nextReview ?? undefined,
        last_review: c.lastReview ?? undefined,
        mastery: c.mastery,
      })),
      { onConflict: 'id' }
    )
    if (error) throw new Error(`Erro ao restaurar flashcards: ${error.message}`)
  }

  await updateUserStreak(userId, data.streak, data.lastStudyDate)

  const { error: xpError } = await supabase
    .from('users')
    .update({ total_xp: data.totalXp })
    .eq('id', userId)
  if (xpError) throw new Error(`Erro ao restaurar XP: ${xpError.message}`)
}
