import type { FlashCard } from '@/types'

export function isDue(card: FlashCard): boolean {
  if (!card.nextReview) return true
  return new Date(card.nextReview) <= new Date()
}

export function addDays(days: number, from?: Date | null): string {
  const d = new Date(from ? from.getTime() : Date.now())
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function relDate(iso: string | null | undefined): string {
  if (!iso) return 'Nunca'
  const diff = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  if (diff === -1) return 'Ontem'
  if (diff < 0) return `${Math.abs(diff)}d atrás`
  return `em ${diff}d`
}
