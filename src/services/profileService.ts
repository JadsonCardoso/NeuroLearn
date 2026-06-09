import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  name: string
  avatar_url: string
  email: string
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('name, avatar_url')
    .eq('id', user.id)
    .single()

  return {
    name: data?.name ?? '',
    avatar_url: data?.avatar_url ?? '',
    email: user.email ?? '',
  }
}

export async function updateUserProfile(updates: {
  name: string
  avatar_url: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .from('users')
    .update({
      name: updates.name.trim() || null,
      avatar_url: updates.avatar_url.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) throw error
}
