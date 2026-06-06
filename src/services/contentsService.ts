import { createClient } from '@/lib/supabase/client'
import type { DbContent } from '@/types/database.types'
import type { Content, ContentType } from '@/types'

// Mapeia row do banco para tipo de domínio
function toContent(row: DbContent): Content {
  return {
    id: row.id,
    title: row.title,
    type: row.type as ContentType,
    author: row.author ?? '',
    desc: row.description ?? '',
    progress: row.progress,
    color: row.color,
    addedAt: row.added_at,
  }
}

export async function listContents(): Promise<Content[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contents')
    .select('*')
    .order('added_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(toContent)
}

export async function createContent(
  userId: string,
  input: Pick<Content, 'title' | 'type' | 'author' | 'desc' | 'color'>
): Promise<Content> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contents')
    .insert({
      user_id: userId,
      title: input.title,
      type: input.type,
      author: input.author || null,
      description: input.desc || null,
      color: input.color,
    })
    .select()
    .single()

  if (error) throw error
  return toContent(data)
}

export async function updateContentProgress(id: string, progress: number): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('contents')
    .update({ progress, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function removeContent(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('contents').delete().eq('id', id)
  if (error) throw error
}
