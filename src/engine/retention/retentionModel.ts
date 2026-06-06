import type { FlashCard } from '@/types'

// Estabilidade de memória S = intervalDays × easeFactor
export function calcStability(intervalDays: number, easeFactor: number): number {
  return intervalDays * easeFactor
}

// Retenção a partir de dias desde a última revisão: R = e^(-t/S)
export function calcRetentionFromDays(daysSinceReview: number, stability: number): number {
  if (daysSinceReview <= 0) return 100
  if (stability <= 0) return 0
  return Math.max(0, Math.round(100 * Math.exp(-daysSinceReview / stability)))
}

// Retenção de um card com base no tempo decorrido desde lastReview
export function calcRetention(card: FlashCard): number {
  if (!card.lastReview) return 0
  const days = (Date.now() - new Date(card.lastReview).getTime()) / 86_400_000
  const stability = calcStability(card.interval, card.ef)
  return calcRetentionFromDays(days, stability)
}
