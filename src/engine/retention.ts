import type { FlashCard } from '@/types'

/**
 * Modelo de retenção por decaimento exponencial.
 * Baseado em Ebbinghaus: retention = exp(-days / (interval × ef))
 * Lógica idêntica ao v1.0 — NÃO alterar sem testes.
 */
export function calcRetention(card: FlashCard): number {
  if (!card.lastReview) return 0
  const days = (Date.now() - new Date(card.lastReview).getTime()) / 86_400_000
  return Math.max(0, Math.round(100 * Math.exp(-days / (card.interval * card.ef))))
}
