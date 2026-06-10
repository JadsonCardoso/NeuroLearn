'use client'

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'
import type { AppState, AppAction } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useToastContext } from '@/store/ToastContext'
import { listContents, createContent, updateContent, updateContentProgress, removeContent } from '@/services/contentsService'
import { listAllFlashcards, createFlashcards, updateFlashcardSM2, deleteFlashcard, updateFlashcard } from '@/services/flashcardsService'
import { recordReviewCycle } from '@/services/reviewService'
import { createStudySession, listRecentSessions } from '@/services/sessionsService'
import { listUserSkills, addUserSkill, gainSkillXP, updateUserTotalXP, updateUserStreak, removeUserSkill } from '@/services/skillsService'
import { saveRetentionSnapshot } from '@/services/retentionService'
import { logCognitiveEvent } from '@/services/cognitiveEventsService'
import { loadState, saveState } from '@/services/localStorageService'
import { calcRetention } from '@/engine/retention/retentionModel'
import { calculateStreak } from '@/store/reducers/streakReducer'
import { calculateLevelUp } from '@/engine/mastery/levelUp'

// ── Estado inicial vazio (antes de carregar do backend) ─────────────────────
export const EMPTY_STATE: AppState = {
  contents: [],
  cards: [],
  skills: [],
  sessions: [],
  streak: 0,
  lastStudyDate: '',
  totalXp: 0,
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
        state.streak,
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
}

const AppContext = createContext<AppContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, EMPTY_STATE)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToastContext()

  // Carrega estado do Supabase ao inicializar
  useEffect(() => {
    async function loadFromSupabase() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Sem usuário — carrega localStorage como fallback (modo offline/dev)
        const localState = loadState()
        dispatch({ type: 'LOAD_STATE', payload: localState })
        setLoading(false)
        return
      }

      setUserId(user.id)

      try {
        // Todas as queries em paralelo para minimizar latência
        const [contents, cards, skills, userResult, sessions] = await Promise.all([
          listContents(),
          listAllFlashcards(),
          listUserSkills(user.id),
          supabase.from('users').select('total_xp, streak, last_study_date').eq('id', user.id).single(),
          listRecentSessions(user.id),
        ])

        const userData = userResult.data

        dispatch({
          type: 'LOAD_STATE',
          payload: {
            contents,
            cards,
            skills,
            sessions,
            streak: userData?.streak ?? 0,
            lastStudyDate: userData?.last_study_date ?? '',
            totalXp: userData?.total_xp ?? 0,
          },
        })
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
  }, [])

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
          addToast('success', 'Conteúdo removido.')
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
          await updateFlashcard(action.payload.id, { front: action.payload.front, back: action.payload.back })
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
          addToast('success', `Flashcards criados! (${action.payload.length} cards)`)
          break
        }

        case 'RATE_CARD': {
          const { cardId, ef, interval, repetitions, nextReview, lastReview, mastery, xpEarned } =
            action.payload
          const card = state.cards.find((c) => c.id === cardId)
          if (card) {
            await Promise.all([
              updateFlashcardSM2(cardId, { ef, interval, reps: repetitions, nextReview, lastReview, mastery }),
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
              saveRetentionSnapshot(userId, cardId, calcRetention({ ...card, ef, interval, reps: repetitions, nextReview, lastReview, mastery })),
              updateUserTotalXP(userId, xpEarned),
              logCognitiveEvent(userId, 'card_reviewed', { card_id: cardId, quality: action.payload.quality ?? 3, xp_earned: xpEarned }),
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
            }),
            cards.length > 0
              ? createFlashcards(userId, contentId, cards)
              : Promise.resolve(),
            updateContentProgress(contentId, Math.min(100, (state.contents.find(c => c.id === contentId)?.progress ?? 0) + 10)),
            updateUserTotalXP(userId, 10),
            isNewDay
              ? updateUserStreak(userId, newStreak, new Date().toISOString().split('T')[0])
              : Promise.resolve(),
            logCognitiveEvent(userId, 'session_end', { content_id: contentId, cards_created: cards.length }),
          ])
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
      }
    } catch (err) {
      console.error('[AppContext] Erro ao sincronizar com Supabase:', err)
      addToast('error', 'Não foi possível concluir a operação. Tente novamente.')
    }
  }

  return (
    <AppContext.Provider value={{ state, dispatch: originalDispatch, userId, loading }}>
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
