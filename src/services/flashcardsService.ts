import { createClient } from '@/lib/supabase/client'
import type { DbFlashcard } from '@/types/database.types'
import type { FlashCard, CardMastery } from '@/types'

function toFlashCard(row: DbFlashcard): FlashCard {
  return {
    id: row.id,
    cid: row.content_id,
    front: row.front,
    back: row.back,
    ef: row.ef,
    interval: row.interval,
    reps: row.repetitions,
    nextReview: row.next_review,
    lastReview: row.last_review,
    mastery: row.mastery as CardMastery,
  }
}

export async function listFlashcardsByContent(
  userId: string,
  contentId: string
): Promise<FlashCard[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(toFlashCard)
}

export async function listDueFlashcards(userId: string): Promise<FlashCard[]> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId)
    .lte('next_review', today)
    .order('next_review', { ascending: true })

  if (error) throw error
  return (data ?? []).map(toFlashCard)
}

export async function listAllFlashcards(userId: string): Promise<FlashCard[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map(toFlashCard)
}

export async function createFlashcards(
  userId: string,
  contentId: string,
  cards: Pick<FlashCard, 'front' | 'back'>[]
): Promise<FlashCard[]> {
  const supabase = createClient()
  const rows = cards.map((c) => ({
    user_id: userId,
    content_id: contentId,
    front: c.front,
    back: c.back,
  }))

  const { data, error } = await supabase.from('flashcards').insert(rows).select()

  if (error) throw error
  return (data ?? []).map(toFlashCard)
}

export async function deleteFlashcard(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('flashcards').delete().eq('id', id)
  if (error) throw error
}

export async function updateFlashcard(
  id: string,
  update: { front: string; back: string }
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('flashcards')
    .update({ front: update.front, back: update.back, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function updateFlashcardSM2(
  id: string,
  update: Pick<FlashCard, 'ef' | 'interval' | 'reps' | 'nextReview' | 'lastReview' | 'mastery'>
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('flashcards')
    .update({
      ef: update.ef,
      interval: update.interval,
      repetitions: update.reps,
      next_review: update.nextReview ?? undefined,
      last_review: update.lastReview ?? null,
      mastery: update.mastery,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error
}
