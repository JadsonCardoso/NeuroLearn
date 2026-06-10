import { createClient } from '@/lib/supabase/client'
import type { Json } from '@/types/database.types'

export interface StudyGoals {
  cardsPerDay: number
  minutesPerDay: number
  daysPerWeek: number
  streakGoal: number
}

export const DEFAULT_STUDY_GOALS: StudyGoals = {
  cardsPerDay: 5,
  minutesPerDay: 25,
  daysPerWeek: 5,
  streakGoal: 30,
}

export interface UserProfile {
  name: string
  avatar_url: string
  email: string
  studyGoals: StudyGoals | null
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('name, avatar_url, study_goals')
    .eq('id', user.id)
    .single()

  return {
    name: data?.name ?? '',
    avatar_url: data?.avatar_url ?? '',
    email: user.email ?? '',
    studyGoals: (data?.study_goals as StudyGoals | null) ?? null,
  }
}

export async function updateUserProfile(updates: {
  name: string
  avatar_url: string
}): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
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

export async function updateStudyGoals(goals: StudyGoals): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .from('users')
    .update({ study_goals: goals as unknown as Json, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw error
}
