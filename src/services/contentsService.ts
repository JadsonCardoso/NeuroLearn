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
  input: Pick<Content, 'title' | 'type' | 'author' | 'desc' | 'color'> & { id?: string }
): Promise<Content> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contents')
    .insert({
      ...(input.id ? { id: input.id } : {}),
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

export async function updateContent(
  id: string,
  input: Partial<Pick<Content, 'title' | 'type' | 'author' | 'desc' | 'color'>>
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('contents')
    .update({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.author !== undefined && { author: input.author || null }),
      ...(input.desc !== undefined && { description: input.desc || null }),
      ...(input.color !== undefined && { color: input.color }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function removeContent(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('contents').delete().eq('id', id)
  if (error) throw error
}
