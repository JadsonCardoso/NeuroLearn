import { createClient } from '@/lib/supabase/client'
import type { Json } from '@/types/database.types'

export type CognitiveEventType =
  | 'session_start'
  | 'session_end'
  | 'card_reviewed'
  | 'card_created'
  | 'skill_gained'
  | 'xp_earned'
  | 'streak_updated'

export async function logCognitiveEvent(
  userId: string,
  eventType: CognitiveEventType,
  payload: Record<string, Json> = {}
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('cognitive_events').insert({
    user_id: userId,
    event_type: eventType,
    payload,
  })

  // Eventos de log nunca devem quebrar o fluxo principal
  if (error) console.warn('[cognitiveEvents] Falha ao registrar evento:', error.message)
}
