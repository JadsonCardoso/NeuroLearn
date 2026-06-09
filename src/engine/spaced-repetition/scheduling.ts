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

export function isDue(card: FlashCard): boolean {
  if (!card.nextReview) return true
  return new Date(card.nextReview) <= new Date()
}

export function addDays(days: number, from?: Date | null): string {
  const base = from ?? new Date()
  const result = new Date(base)
  result.setDate(result.getDate() + days)
  return result.toISOString()
}

export function relDate(iso: string | null | undefined): string {
  if (!iso) return 'sem data'
  const diff = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000)
  if (diff === 0) return 'hoje'
  if (diff === 1) return 'amanhã'
  if (diff === -1) return 'ontem'
  if (diff > 0) return `em ${diff} dias`
  return `${Math.abs(diff)} dias atrás`
}
