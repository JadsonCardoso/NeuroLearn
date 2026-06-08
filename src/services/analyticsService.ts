// Serviço de analytics cognitivo — lê dados históricos do Supabase para o Dashboard.
// Usa duas queries separadas para evitar tipagem complexa de joins gerados.
import { createClient } from '@/lib/supabase/client'

export interface AtRiskCard {
  flashcardId: string
  front: string
  contentId: string
  retention: number
  snapshotDate: string
}

export async function getAtRiskCards(userId: string): Promise<AtRiskCard[]> {
  const supabase = createClient()

  // 1) Snapshot mais recente deste usuário
  const { data: latest } = await supabase
    .from('retention_metrics')
    .select('snapshot_date')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!latest) return []

  // 2) Cards com retenção < 50% nesse snapshot
  const { data: metrics, error } = await supabase
    .from('retention_metrics')
    .select('flashcard_id, retention, snapshot_date')
    .eq('user_id', userId)
    .eq('snapshot_date', latest.snapshot_date)
    .lt('retention', 0.5)
    .order('retention', { ascending: true })
    .limit(10)

  if (error || !metrics || metrics.length === 0) return []

  // 3) Busca detalhes dos flashcards correspondentes
  const ids = metrics.map((m) => m.flashcard_id)
  const { data: cards } = await supabase
    .from('flashcards')
    .select('id, front, content_id')
    .in('id', ids)

  const cardMap = new Map((cards ?? []).map((c) => [c.id, c]))

  return metrics.map((m) => {
    const card = cardMap.get(m.flashcard_id)
    return {
      flashcardId: m.flashcard_id,
      front: card?.front ?? '',
      contentId: card?.content_id ?? '',
      retention: Math.round(m.retention * 100),
      snapshotDate: m.snapshot_date,
    }
  })
}
