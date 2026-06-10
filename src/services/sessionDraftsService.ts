import { createClient } from '@/lib/supabase/client'

export interface DraftData {
  notes: string
  highlights: string[]
  teachText: string
  updatedAt: string
}

export async function upsertDraft(
  userId: string,
  contentId: string,
  data: Omit<DraftData, 'updatedAt'>
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('session_drafts').upsert(
    {
      user_id: userId,
      content_id: contentId,
      notes: data.notes,
      highlights: data.highlights,
      teach_text: data.teachText,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,content_id' }
  )

  if (error) {
    console.error('[sessionDraftsService] upsertDraft failed:', error)
    throw error
  }
}

export async function getDraft(userId: string, contentId: string): Promise<DraftData | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('session_drafts')
    .select('notes, highlights, teach_text, updated_at')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .single()

  if (error || !data) return null

  return {
    notes: data.notes ?? '',
    highlights: Array.isArray(data.highlights) ? (data.highlights as string[]) : [],
    teachText: data.teach_text ?? '',
    updatedAt: data.updated_at ?? '',
  }
}

export async function deleteDraft(userId: string, contentId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('session_drafts')
    .delete()
    .eq('user_id', userId)
    .eq('content_id', contentId)

  if (error) {
    console.error('[sessionDraftsService] deleteDraft failed:', error)
  }
}
