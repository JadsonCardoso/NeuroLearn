import { createClient } from '@/lib/supabase/client'
import {
  DAILY_MISSIONS,
  WEEKLY_MISSIONS,
  getMissionById,
  type MissionTrackingEvent,
} from '@/engine/missions/missionDefinitions'
import {
  selectMissionsForPeriod,
  getTodayISO,
  getMondayOfWeek,
} from '@/engine/missions/missionSelector'
import type { Database, DbUserMission } from '@/types/database.types'

type UserMissionInsert = Database['public']['Tables']['user_missions']['Insert']

export interface UserMission {
  id: string
  missionId: string
  periodType: 'daily' | 'weekly'
  periodStart: string
  progress: number
  goal: number
  xpReward: number
  completed: boolean
  completedAt: string | null
  title: string
  description: string
  icon: string
}

export interface MissionCompletionResult {
  missionId: string
  xpReward: number
  grantsShield: boolean
}

function toUserMission(row: DbUserMission): UserMission {
  const def = getMissionById(row.mission_id)
  return {
    id: row.id,
    missionId: row.mission_id,
    periodType: row.period_type as 'daily' | 'weekly',
    periodStart: row.period_start,
    progress: row.progress,
    goal: row.goal,
    xpReward: row.xp_reward,
    completed: row.completed,
    completedAt: row.completed_at ?? null,
    title: def?.title ?? row.mission_id,
    description: def?.description ?? '',
    icon: def?.icon ?? '🎯',
  }
}

function emitMissionsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nl:missions_updated'))
  }
}

// Garante que o usuário tem missões para o período atual (gera se não existir).
export async function ensureMissionsForPeriod(userId: string): Promise<UserMission[]> {
  const supabase = createClient()
  const today = getTodayISO()
  const monday = getMondayOfWeek(today)

  // Busca missões existentes para o período atual
  const { data: existing, error } = await supabase
    .from('user_missions')
    .select('*')
    .eq('user_id', userId)
    .or(`period_start.eq.${today},period_start.eq.${monday}`)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[missionsService] Erro ao buscar missões:', error)
    return []
  }

  const existingDaily = (existing ?? []).filter((m) => m.period_type === 'daily')
  const existingWeekly = (existing ?? []).filter((m) => m.period_type === 'weekly')

  const toInsert: UserMissionInsert[] = []

  // Gera diárias se não existirem
  if (existingDaily.length === 0) {
    const selected = selectMissionsForPeriod(userId, today, DAILY_MISSIONS, 3)
    for (const def of selected) {
      toInsert.push({
        user_id: userId,
        mission_id: def.id,
        period_type: 'daily',
        period_start: today,
        progress: 0,
        goal: def.goal,
        xp_reward: def.xpReward,
        completed: false,
      })
    }
  }

  // Gera semanais se não existirem
  if (existingWeekly.length === 0) {
    const weekKey = `${monday}-week`
    const selected = selectMissionsForPeriod(userId, weekKey, WEEKLY_MISSIONS, 2)
    for (const def of selected) {
      toInsert.push({
        user_id: userId,
        mission_id: def.id,
        period_type: 'weekly',
        period_start: monday,
        progress: 0,
        goal: def.goal,
        xp_reward: def.xpReward,
        completed: false,
      })
    }
  }

  if (toInsert.length > 0) {
    const { data: inserted, error: insertError } = await supabase
      .from('user_missions')
      .insert(toInsert)
      .select('*')

    if (insertError) {
      console.error('[missionsService] Erro ao gerar missões:', insertError)
      return (existing ?? []).map(toUserMission)
    }

    return [...(existing ?? []), ...(inserted ?? [])].map(toUserMission)
  }

  return (existing ?? []).map(toUserMission)
}

// Processa um evento e atualiza o progresso das missões relevantes.
// Retorna lista de missões que foram concluídas neste evento.
export async function trackEvent(
  userId: string,
  event: MissionTrackingEvent,
  data: { duration?: number; contentId?: string; cardCount?: number; currentStreak?: number }
): Promise<MissionCompletionResult[]> {
  const supabase = createClient()
  const today = getTodayISO()
  const monday = getMondayOfWeek(today)

  // Busca missões ativas (não concluídas) do período atual
  const { data: missions, error } = await supabase
    .from('user_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .or(`period_start.eq.${today},period_start.eq.${monday}`)

  if (error || !missions?.length) return []

  const completions: MissionCompletionResult[] = []

  for (const mission of missions) {
    const def = getMissionById(mission.mission_id)
    if (!def || !def.trackingEvents.includes(event)) continue

    let increment = 0

    switch (mission.mission_id) {
      case 'daily_review_10':
      case 'weekly_review_50':
        // card_reviewed: incrementa 1 por card
        increment = data.cardCount ?? 1
        break

      case 'daily_focus_25min':
        // focus_session_end: conta apenas sessões ≥ 25 min (1500 seg)
        increment = (data.duration ?? 0) >= 1500 ? 1 : 0
        break

      case 'daily_study_2_contents':
        // focus_session_end: incrementa apenas se contentId ainda não foi contado hoje
        // Simplificado: incrementa 1 e a UI mostra progress/goal (controle é no service)
        increment = data.contentId ? 1 : 0
        break

      case 'daily_create_5_cards':
      case 'weekly_create_10':
        // cards_created: incrementa pelo número de cards criados
        increment = data.cardCount ?? 1
        break

      case 'daily_any_session':
      case 'weekly_focus_3':
        // focus_session_end: qualquer sessão conta como 1
        increment = 1
        break

      case 'weekly_streak_5':
        // focus_session_end: progresso = streak atual (não incrementa, define)
        if (data.currentStreak !== undefined) {
          const newProgress = Math.min(data.currentStreak, mission.goal)
          if (newProgress > mission.progress) {
            await supabase
              .from('user_missions')
              .update({ progress: newProgress })
              .eq('id', mission.id)
            if (newProgress >= mission.goal) {
              const result = await completeMission(userId, mission.mission_id, mission.id)
              if (result) completions.push(result)
            }
          }
        }
        continue
    }

    if (increment <= 0) continue

    const newProgress = Math.min(mission.progress + increment, mission.goal)

    await supabase.from('user_missions').update({ progress: newProgress }).eq('id', mission.id)

    if (newProgress >= mission.goal) {
      const result = await completeMission(userId, mission.mission_id, mission.id)
      if (result) completions.push(result)
    }
  }

  if (completions.length > 0 || missions.length > 0) {
    emitMissionsUpdated()
  }

  return completions
}

// Marca uma missão como concluída e retorna o resultado da conclusão.
export async function completeMission(
  userId: string,
  missionId: string,
  userMissionId: string
): Promise<MissionCompletionResult | null> {
  const supabase = createClient()
  const def = getMissionById(missionId)
  if (!def) return null

  const { error } = await supabase
    .from('user_missions')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', userMissionId)
    .eq('completed', false)

  if (error) {
    console.error('[missionsService] Erro ao concluir missão:', error)
    return null
  }

  if (def.grantsShield) {
    await grantStreakShield(userId)
  }

  return {
    missionId: def.id,
    xpReward: def.xpReward,
    grantsShield: def.grantsShield ?? false,
  }
}

// Usa um streak shield: decrementa shields e preserva last_study_date como ontem.
// Retorna o número de shields restantes.
export async function consumeStreakShield(userId: string, currentStreak: number): Promise<number> {
  const supabase = createClient()
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Lê shields atuais
  const { data: user, error: readError } = await supabase
    .from('users')
    .select('streak_shields')
    .eq('id', userId)
    .single()

  if (readError || !user) {
    console.error('[missionsService] Erro ao ler shields:', readError)
    return 0
  }

  const newShields = Math.max(0, user.streak_shields - 1)

  // Decrementa shields e restaura last_study_date para ontem
  const { error: updateError } = await supabase
    .from('users')
    .update({ streak_shields: newShields, last_study_date: yesterday })
    .eq('id', userId)

  if (updateError) {
    console.error('[missionsService] Erro ao usar shield:', updateError)
    return user.streak_shields
  }

  // Registra o uso
  await supabase.from('streak_shield_uses').insert({
    user_id: userId,
    used_at: getTodayISO(),
    streak_preserved: currentStreak,
  })

  emitMissionsUpdated()
  return newShields
}

// Concede +1 streak shield ao usuário.
export async function grantStreakShield(userId: string): Promise<void> {
  const supabase = createClient()
  const { data: user } = await supabase
    .from('users')
    .select('streak_shields')
    .eq('id', userId)
    .single()

  const current = user?.streak_shields ?? 0
  await supabase
    .from('users')
    .update({ streak_shields: current + 1 })
    .eq('id', userId)
}

// Busca a contagem atual de shields do usuário.
export async function getStreakShields(userId: string): Promise<number> {
  const supabase = createClient()
  const { data } = await supabase.from('users').select('streak_shields').eq('id', userId).single()
  return data?.streak_shields ?? 0
}
