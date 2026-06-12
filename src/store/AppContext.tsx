'use client'

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import type { AppState, AppAction, Project } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useToastContext } from '@/store/ToastContext'
import {
  listContents,
  createContent,
  updateContent,
  updateContentProgress,
  removeContent,
} from '@/services/contentsService'
import {
  listAllFlashcards,
  createFlashcards,
  updateFlashcardSM2,
  deleteFlashcard,
  updateFlashcard,
} from '@/services/flashcardsService'
import { recordReviewCycle } from '@/services/reviewService'
import {
  createStudySession,
  listRecentSessions,
  updateStudySession,
  deleteStudySession,
} from '@/services/sessionsService'
import { deleteDraft } from '@/services/sessionDraftsService'
import {
  listUserSkills,
  addUserSkill,
  gainSkillXP,
  updateUserTotalXP,
  updateUserStreak,
  removeUserSkill,
} from '@/services/skillsService'
import { saveRetentionSnapshot } from '@/services/retentionService'
import { logCognitiveEvent } from '@/services/cognitiveEventsService'
import { loadState, saveState } from '@/services/localStorageService'
import {
  trackEvent as trackMissionEvent,
  consumeStreakShield,
  getStreakShields,
} from '@/services/missionsService'
import { calcRetention } from '@/engine/retention/retentionModel'
import { calculateStreak } from '@/store/reducers/streakReducer'
import { calculateLevelUp } from '@/engine/mastery/levelUp'
import {
  listTrails,
  createTrail,
  updateTrail,
  deleteTrail,
  assignContentToTrail,
  createDefaultTrail,
} from '@/services/trailsService'
import type { TrailInput } from '@/services/trailsService'
import { listProjects } from '@/services/projectsService'

// ── Estado inicial vazio (antes de carregar do backend) ─────────────────────
export const EMPTY_STATE: AppState = {
  contents: [],
  cards: [],
  skills: [],
  sessions: [],
  trails: [],
  projects: [],
  streak: 0,
  lastStudyDate: '',
  totalXp: 0,
  streakShields: 0,
}

// ── Reducer (mantido igual à Fase 1) ────────────────────────────────────────
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload

    case 'ADD_CONTENT':
      return { ...state, contents: [...state.contents, action.payload] }

    case 'DELETE_CONTENT':
      return {
        ...state,
        contents: state.contents.filter((c) => c.id !== action.payload),
        cards: state.cards.filter((c) => c.cid !== action.payload),
      }

    case 'UPDATE_CONTENT': {
      const { id, ...updates } = action.payload
      return {
        ...state,
        contents: state.contents.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      }
    }

    case 'UPDATE_CONTENT_PROGRESS': {
      const { id, progress } = action.payload
      return {
        ...state,
        contents: state.contents.map((c) => (c.id === id ? { ...c, progress } : c)),
      }
    }

    case 'ADD_CARDS':
      return { ...state, cards: [...state.cards, ...action.payload] }

    case 'DELETE_CARD':
      return { ...state, cards: state.cards.filter((c) => c.id !== action.payload) }

    case 'UPDATE_CARD': {
      const { id, front, back } = action.payload
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === id ? { ...c, front, back } : c)),
      }
    }

    case 'RATE_CARD': {
      const { cardId, ef, interval, repetitions, nextReview, lastReview, mastery, xpEarned } =
        action.payload
      return {
        ...state,
        totalXp: (state.totalXp ?? 0) + xpEarned,
        cards: state.cards.map((c) =>
          c.id === cardId
            ? { ...c, ef, interval, reps: repetitions, nextReview, lastReview, mastery }
            : c
        ),
      }
    }

    case 'ADD_SKILL':
      return { ...state, skills: [...state.skills, action.payload] }

    case 'DELETE_SKILL':
      return { ...state, skills: state.skills.filter((s) => s.id !== action.payload) }

    case 'GAIN_XP': {
      const { skillId, amount } = action.payload
      return {
        ...state,
        totalXp: (state.totalXp ?? 0) + amount,
        skills: state.skills.map((s) => {
          if (s.id !== skillId) return s
          return calculateLevelUp({ ...s, xp: s.xp + amount })
        }),
      }
    }

    case 'FINISH_SESSION': {
      const { session, cards, contentId } = action.payload
      const currentProgress = state.contents.find((c) => c.id === contentId)?.progress ?? 0
      const newProgress = Math.min(100, currentProgress + 10)
      const { streak: newStreak, lastStudyDate: newLastStudyDate } = calculateStreak(
        state.lastStudyDate || null,
        state.streak
      )
      return {
        ...state,
        totalXp: (state.totalXp ?? 0) + 10,
        sessions: [...state.sessions, session],
        cards: [...state.cards, ...cards],
        contents: state.contents.map((c) =>
          c.id === contentId ? { ...c, progress: newProgress } : c
        ),
        streak: newStreak,
        lastStudyDate: newLastStudyDate,
      }
    }

    case 'EARN_XP':
      return { ...state, totalXp: (state.totalXp ?? 0) + action.payload.amount }

    case 'UPDATE_STREAK': {
      const { streak, lastStudyDate } = calculateStreak(state.lastStudyDate || null, state.streak)
      if (streak === state.streak && lastStudyDate === state.lastStudyDate) return state
      return { ...state, streak, lastStudyDate }
    }

    case 'ADD_TRAIL':
      return { ...state, trails: [...(state.trails ?? []), action.payload] }

    case 'UPDATE_TRAIL': {
      const { id, ...updates } = action.payload
      return {
        ...state,
        trails: (state.trails ?? []).map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }
    }

    case 'DELETE_TRAIL':
      return {
        ...state,
        trails: (state.trails ?? []).filter((t) => t.id !== action.payload),
        contents: state.contents.map((c) =>
          c.trailId === action.payload ? { ...c, trailId: null } : c
        ),
      }

    case 'ASSIGN_CONTENT_TRAIL': {
      const { contentId, trailId } = action.payload
      return {
        ...state,
        contents: state.contents.map((c) => (c.id === contentId ? { ...c, trailId } : c)),
      }
    }

    case 'ASSIGN_TRAIL_PROJECT': {
      const { trailId, projectId } = action.payload
      return {
        ...state,
        trails: (state.trails ?? []).map((t) => (t.id === trailId ? { ...t, projectId } : t)),
      }
    }

    case 'LOAD_SHIELDS':
      return { ...state, streakShields: action.payload }

    case 'USE_SHIELD':
      return { ...state, streakShields: Math.max(0, (state.streakShields ?? 1) - 1) }

    case 'UPDATE_SESSION': {
      const { id, ...updates } = action.payload
      return {
        ...state,
        sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }
    }

    case 'DELETE_SESSION':
      return { ...state, sessions: state.sessions.filter((s) => s.id !== action.payload) }

    case 'LOAD_PROJECTS':
      return { ...state, projects: action.payload }

    case 'ADD_PROJECT':
      return { ...state, projects: [...(state.projects ?? []), action.payload] }

    case 'UPDATE_PROJECT': {
      const { id, ...updates } = action.payload
      return {
        ...state,
        projects: (state.projects ?? []).map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }
    }

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: (state.projects ?? []).filter((p) => p.id !== action.payload),
        trails: (state.trails ?? []).map((t) =>
          t.projectId === action.payload ? { ...t, projectId: null } : t
        ),
      }

    default:
      return state
  }
}

// ── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  userId: string | null
  loading: boolean
  streakRecoverable: boolean
  setStreakRecoverable: (v: boolean) => void
  useShield: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, EMPTY_STATE)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [streakRecoverable, setStreakRecoverable] = useState(false)
  const { addToast } = useToastContext()

  // Carrega estado do Supabase ao inicializar
  useEffect(() => {
    async function loadFromSupabase() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Sem usuário — carrega localStorage como fallback (modo offline/dev)
        const localState = loadState()
        dispatch({ type: 'LOAD_STATE', payload: localState })
        setLoading(false)
        return
      }

      setUserId(user.id)

      try {
        // Todas as queries em paralelo para minimizar latência.
        // listProjects tem .catch() isolado: falha não derruba o estado principal (CC-04).
        const [contents, cards, skills, userResult, sessions, trails, projects] = await Promise.all(
          [
            listContents(user.id),
            listAllFlashcards(user.id),
            listUserSkills(user.id),
            supabase
              .from('users')
              .select('total_xp, streak, last_study_date, streak_shields')
              .eq('id', user.id)
              .single(),
            listRecentSessions(user.id),
            listTrails(user.id),
            listProjects(user.id).catch((err: unknown) => {
              console.error('[AppContext] Falha ao carregar projetos:', err)
              addToast('error', 'Não foi possível carregar os projetos. Tente recarregar a página.')
              return [] as Project[]
            }),
          ]
        )

        const userData = userResult.data

        // Auto-cria trilha padrão para usuários com conteúdos mas sem trilhas
        let finalTrails = trails
        if (trails.length === 0 && contents.length > 0) {
          const orphanIds = contents.map((c) => c.id)
          const defaultTrail = await createDefaultTrail(user.id, orphanIds)
          finalTrails = [defaultTrail]
          // Reflete a atribuição no array de contents
          contents.forEach((c) => {
            c.trailId = defaultTrail.id
          })
        }

        const currentStreak = userData?.streak ?? 0
        const lastStudyDate = userData?.last_study_date ?? ''
        const shields = userData?.streak_shields ?? 1

        dispatch({
          type: 'LOAD_STATE',
          payload: {
            contents,
            cards,
            skills,
            sessions,
            trails: finalTrails,
            projects,
            streak: currentStreak,
            lastStudyDate,
            totalXp: userData?.total_xp ?? 0,
            streakShields: shields,
          },
        })

        // Detecta streak quebrado: último estudo < ontem, streak > 1, shields > 0
        if (currentStreak > 1 && shields > 0 && lastStudyDate) {
          const today = new Date().toISOString().split('T')[0]
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
          if (lastStudyDate < yesterday && lastStudyDate !== today) {
            setStreakRecoverable(true)
          }
        }
      } catch (err) {
        console.error('[AppContext] Erro ao carregar estado do Supabase:', err)
        // Fallback para localStorage se Supabase falhar
        const localState = loadState()
        dispatch({ type: 'LOAD_STATE', payload: localState })
      } finally {
        setLoading(false)
      }
    }

    loadFromSupabase()
  }, [addToast])

  // Sincroniza ações com Supabase (side effects assíncronos)
  const originalDispatch: React.Dispatch<AppAction> = async (action) => {
    dispatch(action)

    if (!userId) {
      // Sem auth — persiste apenas no localStorage
      saveState(appReducer(state, action))
      return
    }

    try {
      switch (action.type) {
        case 'ADD_CONTENT': {
          const c = action.payload
          await createContent(userId, {
            id: c.id,
            title: c.title,
            type: c.type,
            author: c.author,
            desc: c.desc,
            color: c.color,
          })
          addToast('success', 'Conteúdo adicionado com sucesso.')
          break
        }

        case 'DELETE_CONTENT': {
          await removeContent(action.payload)
          // Feedback já foi dado pelo undo toast na LibraryView
          break
        }

        case 'UPDATE_CONTENT': {
          const { id, ...fields } = action.payload
          await updateContent(id, fields)
          addToast('success', 'Conteúdo atualizado com sucesso.')
          break
        }

        case 'DELETE_CARD': {
          await deleteFlashcard(action.payload)
          addToast('success', 'Flashcard removido.')
          break
        }

        case 'UPDATE_CARD': {
          await updateFlashcard(action.payload.id, {
            front: action.payload.front,
            back: action.payload.back,
          })
          addToast('success', 'Flashcard atualizado.')
          break
        }

        case 'UPDATE_CONTENT_PROGRESS': {
          await updateContentProgress(action.payload.id, action.payload.progress)
          break
        }

        case 'ADD_CARDS': {
          const contentId = action.payload[0]?.cid
          if (contentId) {
            await createFlashcards(userId, contentId, action.payload)
            await logCognitiveEvent(userId, 'card_created', {
              count: action.payload.length,
              content_id: contentId,
            })
          }
          // Rastreia progresso de missões de criação de cards — fire-and-forget
          if (contentId && action.payload.length > 0) {
            trackMissionEvent(userId, 'cards_created', { cardCount: action.payload.length })
              .then((completions) => {
                completions.forEach((c) => {
                  dispatch({ type: 'EARN_XP', payload: { amount: c.xpReward } })
                  addToast('success', `✅ Missão concluída! +${c.xpReward} XP`)
                })
              })
              .catch(() => {})
          }
          addToast('success', `Flashcards criados! (${action.payload.length} cards)`)
          break
        }

        case 'RATE_CARD': {
          const { cardId, ef, interval, repetitions, nextReview, lastReview, mastery, xpEarned } =
            action.payload
          const card = state.cards.find((c) => c.id === cardId)
          if (card) {
            await Promise.all([
              updateFlashcardSM2(cardId, {
                ef,
                interval,
                reps: repetitions,
                nextReview,
                lastReview,
                mastery,
              }),
              recordReviewCycle({
                userId,
                flashcardId: cardId,
                quality: action.payload.quality ?? 3,
                efBefore: card.ef,
                efAfter: ef,
                intervalBefore: card.interval,
                intervalAfter: interval,
                xpEarned,
              }),
              saveRetentionSnapshot(
                userId,
                cardId,
                calcRetention({
                  ...card,
                  ef,
                  interval,
                  reps: repetitions,
                  nextReview,
                  lastReview,
                  mastery,
                })
              ),
              updateUserTotalXP(userId, xpEarned),
              logCognitiveEvent(userId, 'card_reviewed', {
                card_id: cardId,
                quality: action.payload.quality ?? 3,
                xp_earned: xpEarned,
              }),
            ])
          }
          break
        }

        case 'FINISH_SESSION': {
          const { session, cards, contentId } = action.payload
          const today = new Date().toISOString().split('T')[0]
          const isNewDay = state.lastStudyDate !== today
          const { streak: newStreak } = calculateStreak(state.lastStudyDate || null, state.streak)
          await Promise.all([
            createStudySession({
              userId,
              contentId,
              duration: session.duration ?? 0,
              cardsCreated: cards.length,
              xpEarned: 10,
              notes: session.notes,
              highlights: session.highlights,
              teachText: session.teach,
            }),
            cards.length > 0 ? createFlashcards(userId, contentId, cards) : Promise.resolve(),
            updateContentProgress(
              contentId,
              Math.min(100, (state.contents.find((c) => c.id === contentId)?.progress ?? 0) + 10)
            ),
            updateUserTotalXP(userId, 10),
            isNewDay
              ? updateUserStreak(userId, newStreak, new Date().toISOString().split('T')[0])
              : Promise.resolve(),
            logCognitiveEvent(userId, 'session_end', {
              content_id: contentId,
              cards_created: cards.length,
            }),
          ])
          await deleteDraft(userId, contentId).catch(() => {})
          // Rastreia progresso de missões — fire-and-forget
          trackMissionEvent(userId, 'focus_session_end', {
            duration: session.duration ?? 0,
            contentId,
            currentStreak: isNewDay ? newStreak : state.streak,
          })
            .then((completions) => {
              completions.forEach((c) => {
                dispatch({ type: 'EARN_XP', payload: { amount: c.xpReward } })
                addToast('success', `✅ Missão concluída! +${c.xpReward} XP`)
                if (c.grantsShield)
                  dispatch({ type: 'LOAD_SHIELDS', payload: state.streakShields + 1 })
              })
            })
            .catch(() => {})
          addToast('success', 'Sessão concluída! +10 XP')
          break
        }

        case 'ADD_SKILL': {
          const skill = action.payload
          const supabase = createClient()
          // Verifica se existe skill global com esse nome
          const { data: globalSkill } = await supabase
            .from('skills')
            .select('id')
            .eq('name', skill.name)
            .single()

          let skillId = globalSkill?.id
          if (!skillId) {
            // Cria na tabela global
            const { data: newSkill } = await supabase
              .from('skills')
              .insert({ name: skill.name, category: skill.cat, color: skill.color })
              .select('id')
              .single()
            skillId = newSkill?.id
          }

          if (skillId) {
            await addUserSkill(userId, skillId)
            await logCognitiveEvent(userId, 'skill_gained', { skill_name: skill.name })
          }
          addToast('success', 'Habilidade adicionada.')
          break
        }

        case 'DELETE_SKILL': {
          await removeUserSkill(action.payload)
          addToast('success', 'Habilidade removida.')
          break
        }

        case 'GAIN_XP': {
          const { skillId, amount } = action.payload
          const skill = state.skills.find((s) => s.id === skillId)
          if (skill) {
            await Promise.all([
              gainSkillXP(skillId, amount, skill.xp, skill.level, skill.maxXp),
              updateUserTotalXP(userId, amount),
              logCognitiveEvent(userId, 'xp_earned', { skill_id: skillId, amount }),
            ])
          }
          break
        }

        case 'EARN_XP': {
          await Promise.all([
            updateUserTotalXP(userId, action.payload.amount),
            logCognitiveEvent(userId, 'xp_earned', { amount: action.payload.amount }),
          ])
          break
        }

        case 'UPDATE_STREAK': {
          const today = new Date().toISOString().split('T')[0]
          if (state.lastStudyDate === today) break
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
          const newStreak = state.lastStudyDate === yesterday ? state.streak + 1 : 1
          await updateUserStreak(userId, newStreak, today)
          break
        }

        case 'ADD_TRAIL': {
          const t = action.payload
          await createTrail(userId, {
            title: t.title,
            type: t.type,
            description: t.description,
            color: t.color,
            iconEmoji: t.iconEmoji,
            goal: t.goal,
            skillId: t.skillId,
          } as TrailInput)
          addToast('success', 'Trilha criada com sucesso.')
          break
        }

        case 'UPDATE_TRAIL': {
          const { id, ...fields } = action.payload
          await updateTrail(id, userId, fields as Partial<TrailInput>)
          addToast('success', 'Trilha atualizada.')
          break
        }

        case 'DELETE_TRAIL': {
          await deleteTrail(action.payload, userId)
          addToast('success', 'Trilha removida.')
          break
        }

        case 'ASSIGN_CONTENT_TRAIL': {
          const prevContent = state.contents.find((c) => c.id === action.payload.contentId)
          const prevTrailId = prevContent?.trailId ?? null
          try {
            await assignContentToTrail(action.payload.contentId, action.payload.trailId)
          } catch {
            // Reverte o optimistic update se a persistência falhar
            dispatch({
              type: 'ASSIGN_CONTENT_TRAIL',
              payload: { contentId: action.payload.contentId, trailId: prevTrailId },
            })
            addToast('error', 'Não foi possível mover o conteúdo. Tente novamente.')
          }
          break
        }

        case 'UPDATE_SESSION': {
          const { id, notes, highlights, teach } = action.payload
          try {
            await updateStudySession(id, userId, {
              ...(notes !== undefined && { notes }),
              ...(highlights !== undefined && { highlights }),
              ...(teach !== undefined && { teachText: teach }),
            })
            addToast('success', 'Sessão atualizada.')
          } catch {
            addToast(
              'error',
              'Não foi possível atualizar a sessão. Recarregue a página para sincronizar.'
            )
          }
          break
        }

        case 'DELETE_SESSION': {
          await deleteStudySession(action.payload, userId)
          addToast('success', 'Sessão removida.')
          break
        }
      }
    } catch (err) {
      console.error('[AppContext] Erro ao sincronizar com Supabase:', err)
      addToast('error', 'Não foi possível concluir a operação. Tente novamente.')
    }
  }

  async function handleUseShield() {
    if (!userId || state.streakShields <= 0) return
    try {
      const remaining = await consumeStreakShield(userId, state.streak)
      dispatch({ type: 'USE_SHIELD' })
      setStreakRecoverable(false)
      addToast('success', `🛡️ Streak Shield usado! Sequência de ${state.streak} dias preservada.`)
      // Recarrega shields do banco para garantir consistência
      const fresh = await getStreakShields(userId)
      dispatch({ type: 'LOAD_SHIELDS', payload: remaining ?? fresh })
    } catch (err) {
      console.error('[AppContext] Erro ao usar shield:', err)
      addToast('error', 'Não foi possível usar o Streak Shield.')
    }
  }

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch: originalDispatch,
        userId,
        loading,
        streakRecoverable,
        setStreakRecoverable,
        useShield: handleUseShield,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext deve ser usado dentro de AppProvider')
  return ctx
}

export function useAppState(): AppState {
  return useAppContext().state
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  return useAppContext().dispatch
}
