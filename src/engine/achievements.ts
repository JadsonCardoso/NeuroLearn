// Engine de conquistas — computa badges a partir do AppState (client-side, sem persistência extra).
// Adicionar novos badges: incluir em DEFINITIONS + case em isUnlocked().
import type { AppState } from '@/types'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  color: string
  unlocked: boolean
}

const DEFINITIONS: Omit<Achievement, 'unlocked'>[] = [
  { id: 'first_card',   name: 'Primeiro Passo',        icon: '🌱', color: '#10b981', description: 'Criou o primeiro flashcard' },
  { id: 'first_review', name: 'Primeira Revisão',       icon: '🔄', color: '#06b6d4', description: 'Completou a primeira sessão de revisão' },
  { id: 'streak_3',     name: 'Sequência Iniciante',    icon: '🔥', color: '#f59e0b', description: 'Manteve sequência de 3 dias consecutivos' },
  { id: 'streak_7',     name: 'Semana Perfeita',        icon: '⚡', color: '#f97316', description: 'Manteve sequência de 7 dias consecutivos' },
  { id: 'streak_30',    name: 'Mestre da Consistência', icon: '👑', color: '#7c3aed', description: 'Manteve sequência de 30 dias consecutivos' },
  { id: 'cards_10',     name: 'Colecionador',           icon: '📚', color: '#06b6d4', description: 'Criou 10 flashcards' },
  { id: 'cards_50',     name: 'Bibliotecário',          icon: '🏛️', color: '#8b5cf6', description: 'Criou 50 flashcards' },
  { id: 'cards_100',    name: 'Arquivista',             icon: '🗄️', color: '#7c3aed', description: 'Criou 100 flashcards' },
  { id: 'reviews_10',   name: 'Revisor',                icon: '🎯', color: '#ec4899', description: 'Completou 10 sessões de revisão' },
  { id: 'reviews_50',   name: 'Estudioso',              icon: '🦉', color: '#7c3aed', description: 'Completou 50 sessões de revisão' },
  { id: 'xp_100',       name: 'Iniciante XP',           icon: '⭐', color: '#f59e0b', description: 'Acumulou 100 XP' },
  { id: 'xp_1000',      name: 'Expert XP',              icon: '🌟', color: '#f59e0b', description: 'Acumulou 1.000 XP' },
]

function isUnlocked(id: string, state: AppState): boolean {
  switch (id) {
    case 'first_card':   return state.cards.length >= 1
    case 'first_review': return state.sessions.length >= 1
    case 'streak_3':     return state.streak >= 3
    case 'streak_7':     return state.streak >= 7
    case 'streak_30':    return state.streak >= 30
    case 'cards_10':     return state.cards.length >= 10
    case 'cards_50':     return state.cards.length >= 50
    case 'cards_100':    return state.cards.length >= 100
    case 'reviews_10':   return state.sessions.length >= 10
    case 'reviews_50':   return state.sessions.length >= 50
    case 'xp_100':       return (state.totalXp ?? 0) >= 100
    case 'xp_1000':      return (state.totalXp ?? 0) >= 1000
    default:             return false
  }
}

export function computeAchievements(state: AppState): Achievement[] {
  return DEFINITIONS.map((def) => ({ ...def, unlocked: isUnlocked(def.id, state) }))
}

export const ACHIEVEMENT_COUNT = DEFINITIONS.length
