import type { FlashCard } from '@/types'
import { calcRetention } from './retentionModel'

export type RiskLevel = 'high' | 'medium' | 'low'

// Risco de esquecimento baseado em retenção e data de revisão
export function calcRiskScore(card: FlashCard): RiskLevel {
  const retention = calcRetention(card)
  const now = Date.now()
  const isOverdue = card.nextReview ? new Date(card.nextReview).getTime() <= now : true
  const dueSoonMs = card.nextReview ? new Date(card.nextReview).getTime() - now : -1
  const dueSoon = dueSoonMs < 86_400_000

  if (retention < 40 || isOverdue) return 'high'
  if (retention < 65 || dueSoon) return 'medium'
  return 'low'
}
