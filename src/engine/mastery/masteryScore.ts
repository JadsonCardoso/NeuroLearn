import type { FlashCard, CardMastery } from '@/types'
import { calcRetention } from '../retention/retentionModel'

const BASE_SCORE: Record<CardMastery, number> = {
  new: 0,
  learning: 25,
  review: 50,
  strong: 75,
}

// Score 0–100 de domínio de um card (mastery × retenção atual)
export function calcCardMasteryScore(card: FlashCard): number {
  const base = BASE_SCORE[card.mastery]
  const retention = calcRetention(card)
  const stabilityMultiplier = Math.min(1.0, retention / 100)
  return Math.round(base * stabilityMultiplier)
}

// Score médio de domínio de um conteúdo com base nos seus cards
export function calcContentMastery(cards: FlashCard[]): number {
  if (cards.length === 0) return 0
  const sum = cards.reduce((acc, card) => acc + calcCardMasteryScore(card), 0)
  return Math.round(sum / cards.length)
}
