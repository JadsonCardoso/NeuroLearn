import type { AppState } from '@/types'
import { SEED } from '@/lib/seed'

const STORAGE_KEY = 'nl_v2'

export function loadState(): AppState {
  if (typeof window === 'undefined') return SEED
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED
    const parsed = JSON.parse(raw) as Partial<AppState>
    if (
      !parsed ||
      !Array.isArray(parsed.contents) ||
      !Array.isArray(parsed.cards) ||
      !Array.isArray(parsed.skills)
    ) {
      console.warn('[NeuroLearn] localStorage com schema inválido — usando SEED')
      return SEED
    }
    return {
      contents: parsed.contents,
      cards: parsed.cards,
      skills: parsed.skills,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      trails: Array.isArray(parsed.trails) ? parsed.trails : [],
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      lastStudyDate: parsed.lastStudyDate ?? '',
      totalXp: typeof parsed.totalXp === 'number' ? parsed.totalXp : 0,
    }
  } catch (err) {
    console.warn('[NeuroLearn] Erro ao ler localStorage — usando SEED:', err)
    return SEED
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.warn('[NeuroLearn] Erro ao salvar:', err)
  }
}
