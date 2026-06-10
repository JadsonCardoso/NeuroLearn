export type MissionPeriod = 'daily' | 'weekly'

export type MissionTrackingEvent = 'focus_session_end' | 'card_reviewed' | 'cards_created'

export interface MissionDefinition {
  id: string
  title: string
  description: string
  icon: string
  periodType: MissionPeriod
  goal: number
  xpReward: number
  trackingEvents: MissionTrackingEvent[]
  grantsShield?: boolean
}

export const DAILY_MISSIONS: MissionDefinition[] = [
  {
    id: 'daily_review_10',
    title: 'Revisor do Dia',
    description: 'Revise 10 flashcards',
    icon: '🔄',
    periodType: 'daily',
    goal: 10,
    xpReward: 50,
    trackingEvents: ['card_reviewed'],
  },
  {
    id: 'daily_focus_25min',
    title: 'Foco Total',
    description: 'Complete uma sessão de Foco de 25 min',
    icon: '⏱️',
    periodType: 'daily',
    goal: 1,
    xpReward: 75,
    trackingEvents: ['focus_session_end'],
  },
  {
    id: 'daily_study_2_contents',
    title: 'Explorador',
    description: 'Estude 2 conteúdos diferentes',
    icon: '🗺️',
    periodType: 'daily',
    goal: 2,
    xpReward: 60,
    trackingEvents: ['focus_session_end'],
  },
  {
    id: 'daily_create_5_cards',
    title: 'Criador de Cards',
    description: 'Crie 5 flashcards',
    icon: '✍️',
    periodType: 'daily',
    goal: 5,
    xpReward: 40,
    trackingEvents: ['cards_created'],
  },
  {
    id: 'daily_any_session',
    title: 'Estudante do Dia',
    description: 'Complete qualquer sessão de estudo',
    icon: '📖',
    periodType: 'daily',
    goal: 1,
    xpReward: 30,
    trackingEvents: ['focus_session_end'],
  },
]

export const WEEKLY_MISSIONS: MissionDefinition[] = [
  {
    id: 'weekly_streak_5',
    title: 'Sequência Semanal',
    description: 'Alcance uma sequência de 5 dias esta semana',
    icon: '🔥',
    periodType: 'weekly',
    goal: 5,
    xpReward: 200,
    trackingEvents: ['focus_session_end'],
    grantsShield: true,
  },
  {
    id: 'weekly_review_50',
    title: 'Maratona de Revisão',
    description: 'Revise 50 flashcards esta semana',
    icon: '🏃',
    periodType: 'weekly',
    goal: 50,
    xpReward: 150,
    trackingEvents: ['card_reviewed'],
  },
  {
    id: 'weekly_focus_3',
    title: 'Semana Focada',
    description: 'Complete 3 sessões de Foco esta semana',
    icon: '🎯',
    periodType: 'weekly',
    goal: 3,
    xpReward: 180,
    trackingEvents: ['focus_session_end'],
  },
  {
    id: 'weekly_create_10',
    title: 'Construtor de Conhecimento',
    description: 'Crie 10 flashcards esta semana',
    icon: '🏗️',
    periodType: 'weekly',
    goal: 10,
    xpReward: 120,
    trackingEvents: ['cards_created'],
  },
]

export const ALL_MISSIONS: MissionDefinition[] = [...DAILY_MISSIONS, ...WEEKLY_MISSIONS]

export function getMissionById(id: string): MissionDefinition | undefined {
  return ALL_MISSIONS.find((m) => m.id === id)
}
