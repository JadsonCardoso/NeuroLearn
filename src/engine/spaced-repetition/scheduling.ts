import type { FlashCard } from '@/types'
import { calcRiskScore, type RiskLevel } from '../retention/forgettingRisk'

const RISK_ORDER: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 }

// Constrói fila de revisão priorizada: risco alto → médio → baixo, desempate por data
export function buildReviewQueue(cards: FlashCard[]): FlashCard[] {
  return [...cards].sort((a, b) => {
    const riskA = RISK_ORDER[calcRiskScore(a)]
    const riskB = RISK_ORDER[calcRiskScore(b)]
    if (riskA !== riskB) return riskA - riskB
    const dateA = a.nextReview ? new Date(a.nextReview).getTime() : 0
    const dateB = b.nextReview ? new Date(b.nextReview).getTime() : 0
    return dateA - dateB
  })
}
