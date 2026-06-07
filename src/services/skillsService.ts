import { createClient } from '@/lib/supabase/client'
import type { DbSkill, DbUserSkill } from '@/types/database.types'
import type { Skill, SkillCategory } from '@/types'

function toSkill(row: DbUserSkill & { skill: DbSkill }): Skill {
  return {
    id: row.id,
    name: row.skill.name,
    level: row.level,
    xp: row.xp,
    maxXp: row.max_xp,
    cat: row.skill.category as SkillCategory,
    color: row.skill.color,
  }
}

export async function listGlobalSkills(): Promise<DbSkill[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('skills').select('*').order('name')
  if (error) throw error
  return data ?? []
}

export async function listUserSkills(userId: string): Promise<Skill[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_skills')
    .select('*, skill:skills(*)')
    .eq('user_id', userId)
    .order('acquired_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => toSkill(row as DbUserSkill & { skill: DbSkill }))
}

export async function addUserSkill(userId: string, skillId: string): Promise<Skill> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_skills')
    .insert({ user_id: userId, skill_id: skillId })
    .select('*, skill:skills(*)')
    .single()

  if (error) throw error
  return toSkill(data as DbUserSkill & { skill: DbSkill })
}

export async function gainSkillXP(
  userSkillId: string,
  amount: number,
  currentXp: number,
  currentLevel: number,
  currentMaxXp: number
): Promise<void> {
  const supabase = createClient()
  let xp = currentXp + amount
  let level = currentLevel
  let maxXp = currentMaxXp

  if (xp >= maxXp && level < 5) {
    xp -= maxXp
    level++
    maxXp += 100
  }

  const { error } = await supabase
    .from('user_skills')
    .update({ xp, level, max_xp: maxXp })
    .eq('id', userSkillId)

  if (error) throw error
}

export async function findOrCreateGlobalSkill(
  name: string,
  category: string,
  color: string
): Promise<string> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from('skills')
    .select('id')
    .eq('name', name)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('skills')
    .insert({ name, category, color })
    .select('id')
    .single()

  if (error) throw error
  return created.id
}

export async function removeUserSkill(userSkillId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('user_skills').delete().eq('id', userSkillId)
  if (error) throw error
}

export async function updateUserStreak(
  userId: string,
  streak: number,
  lastStudyDate: string
): Promise<void> {
  if (!userId) return
  const supabase = createClient()
  const { error } = await supabase
    .from('users')
    .update({ streak, last_study_date: lastStudyDate })
    .eq('id', userId)
  if (error) throw error
}

export async function updateUserTotalXP(userId: string, amount: number): Promise<void> {
  if (!userId) return

  const supabase = createClient()

  const { data: user } = await supabase
    .from('users')
    .select('total_xp')
    .eq('id', userId)
    .maybeSingle()

  // Se a linha não existe ainda, o XP será atualizado quando o perfil for criado
  if (!user) return

  const { error } = await supabase
    .from('users')
    .update({ total_xp: (user.total_xp ?? 0) + amount })
    .eq('id', userId)

  if (error) throw error
}
