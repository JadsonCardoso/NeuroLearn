import { createClient } from '@/lib/supabase/client'

export async function saveRetentionSnapshot(
  userId: string,
  flashcardId: string,
  retention: number
): Promise<void> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  // upsert — uma linha por card por dia
  const { error } = await supabase.from('retention_metrics').upsert(
    {
      user_id: userId,
      flashcard_id: flashcardId,
      retention: Math.max(0, Math.min(1, retention)),
      snapshot_date: today,
    },
    { onConflict: 'flashcard_id,snapshot_date' }
  )

  if (error) throw error
}
