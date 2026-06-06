import { createClient } from '@/lib/supabase/client'

interface ReviewCycleInput {
  userId: string
  flashcardId: string
  quality: number
  efBefore: number
  efAfter: number
  intervalBefore: number
  intervalAfter: number
  xpEarned: number
}

export async function recordReviewCycle(input: ReviewCycleInput): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('review_cycles').insert({
    user_id: input.userId,
    flashcard_id: input.flashcardId,
    quality: input.quality,
    ef_before: input.efBefore,
    ef_after: input.efAfter,
    interval_before: input.intervalBefore,
    interval_after: input.intervalAfter,
    xp_earned: input.xpEarned,
  })

  if (error) throw error
}
