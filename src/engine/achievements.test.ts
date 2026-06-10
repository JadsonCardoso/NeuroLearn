import { describe, it, expect } from 'vitest'
import { computeAchievements, ACHIEVEMENT_COUNT } from './achievements'
import type { AppState } from '@/types'

// Fixture base — estado mínimo válido
function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    contents: [],
    cards: [],
    skills: [],
    sessions: [],
    trails: [],
    streak: 0,
    lastStudyDate: '',
    totalXp: 0,
    ...overrides,
  } as AppState
}

// Helpers para gerar arrays com N elementos mínimos
const cards = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `card-${i}` })) as AppState['cards']
const sessions = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `session-${i}` })) as AppState['sessions']

describe('ACHIEVEMENT_COUNT', () => {
  it('é 12', () => {
    expect(ACHIEVEMENT_COUNT).toBe(12)
  })
})

describe('computeAchievements', () => {
  it('retorna exatamente 12 conquistas', () => {
    expect(computeAchievements(makeState())).toHaveLength(12)
  })

  it('todas bloqueadas com estado vazio', () => {
    const result = computeAchievements(makeState())
    expect(result.every((a) => !a.unlocked)).toBe(true)
  })

  it('cada conquista tem icon, name, description, color e id', () => {
    const result = computeAchievements(makeState())
    for (const a of result) {
      expect(a.id).toBeTruthy()
      expect(a.name).toBeTruthy()
      expect(a.icon).toBeTruthy()
      expect(a.color).toBeTruthy()
      expect(a.description).toBeTruthy()
    }
  })
})

// ── Testes de limite por badge ───────────────────────────────────────────────

describe('first_card', () => {
  it('bloqueado com 0 cards', () => {
    const r = computeAchievements(makeState({ cards: cards(0) }))
    expect(r.find((a) => a.id === 'first_card')?.unlocked).toBe(false)
  })

  it('desbloqueado com 1 card', () => {
    const r = computeAchievements(makeState({ cards: cards(1) }))
    expect(r.find((a) => a.id === 'first_card')?.unlocked).toBe(true)
  })
})

describe('first_review', () => {
  it('bloqueado com 0 sessões', () => {
    const r = computeAchievements(makeState({ sessions: sessions(0) }))
    expect(r.find((a) => a.id === 'first_review')?.unlocked).toBe(false)
  })

  it('desbloqueado com 1 sessão', () => {
    const r = computeAchievements(makeState({ sessions: sessions(1) }))
    expect(r.find((a) => a.id === 'first_review')?.unlocked).toBe(true)
  })
})

describe('streak_3', () => {
  it('bloqueado com streak = 2', () => {
    const r = computeAchievements(makeState({ streak: 2 }))
    expect(r.find((a) => a.id === 'streak_3')?.unlocked).toBe(false)
  })

  it('desbloqueado com streak = 3', () => {
    const r = computeAchievements(makeState({ streak: 3 }))
    expect(r.find((a) => a.id === 'streak_3')?.unlocked).toBe(true)
  })
})

describe('streak_7', () => {
  it('bloqueado com streak = 6', () => {
    expect(
      computeAchievements(makeState({ streak: 6 })).find((a) => a.id === 'streak_7')?.unlocked
    ).toBe(false)
  })

  it('desbloqueado com streak = 7', () => {
    expect(
      computeAchievements(makeState({ streak: 7 })).find((a) => a.id === 'streak_7')?.unlocked
    ).toBe(true)
  })
})

describe('streak_30', () => {
  it('bloqueado com streak = 29', () => {
    expect(
      computeAchievements(makeState({ streak: 29 })).find((a) => a.id === 'streak_30')?.unlocked
    ).toBe(false)
  })

  it('desbloqueado com streak = 30', () => {
    expect(
      computeAchievements(makeState({ streak: 30 })).find((a) => a.id === 'streak_30')?.unlocked
    ).toBe(true)
  })
})

describe('cards_10', () => {
  it('bloqueado com 9 cards', () => {
    expect(
      computeAchievements(makeState({ cards: cards(9) })).find((a) => a.id === 'cards_10')?.unlocked
    ).toBe(false)
  })

  it('desbloqueado com 10 cards', () => {
    expect(
      computeAchievements(makeState({ cards: cards(10) })).find((a) => a.id === 'cards_10')
        ?.unlocked
    ).toBe(true)
  })
})

describe('cards_50', () => {
  it('bloqueado com 49 cards', () => {
    expect(
      computeAchievements(makeState({ cards: cards(49) })).find((a) => a.id === 'cards_50')
        ?.unlocked
    ).toBe(false)
  })

  it('desbloqueado com 50 cards', () => {
    expect(
      computeAchievements(makeState({ cards: cards(50) })).find((a) => a.id === 'cards_50')
        ?.unlocked
    ).toBe(true)
  })
})

describe('cards_100', () => {
  it('bloqueado com 99 cards', () => {
    expect(
      computeAchievements(makeState({ cards: cards(99) })).find((a) => a.id === 'cards_100')
        ?.unlocked
    ).toBe(false)
  })

  it('desbloqueado com 100 cards', () => {
    expect(
      computeAchievements(makeState({ cards: cards(100) })).find((a) => a.id === 'cards_100')
        ?.unlocked
    ).toBe(true)
  })
})

describe('reviews_10', () => {
  it('bloqueado com 9 sessões', () => {
    expect(
      computeAchievements(makeState({ sessions: sessions(9) })).find((a) => a.id === 'reviews_10')
        ?.unlocked
    ).toBe(false)
  })

  it('desbloqueado com 10 sessões', () => {
    expect(
      computeAchievements(makeState({ sessions: sessions(10) })).find((a) => a.id === 'reviews_10')
        ?.unlocked
    ).toBe(true)
  })
})

describe('reviews_50', () => {
  it('bloqueado com 49 sessões', () => {
    expect(
      computeAchievements(makeState({ sessions: sessions(49) })).find((a) => a.id === 'reviews_50')
        ?.unlocked
    ).toBe(false)
  })

  it('desbloqueado com 50 sessões', () => {
    expect(
      computeAchievements(makeState({ sessions: sessions(50) })).find((a) => a.id === 'reviews_50')
        ?.unlocked
    ).toBe(true)
  })
})

describe('xp_100', () => {
  it('bloqueado com 99 XP', () => {
    expect(
      computeAchievements(makeState({ totalXp: 99 })).find((a) => a.id === 'xp_100')?.unlocked
    ).toBe(false)
  })

  it('desbloqueado com 100 XP', () => {
    expect(
      computeAchievements(makeState({ totalXp: 100 })).find((a) => a.id === 'xp_100')?.unlocked
    ).toBe(true)
  })

  it('totalXp undefined tratado como 0 via ?? 0', () => {
    const state = makeState({ totalXp: undefined as unknown as number })
    expect(computeAchievements(state).find((a) => a.id === 'xp_100')?.unlocked).toBe(false)
  })
})

describe('xp_1000', () => {
  it('bloqueado com 999 XP', () => {
    expect(
      computeAchievements(makeState({ totalXp: 999 })).find((a) => a.id === 'xp_1000')?.unlocked
    ).toBe(false)
  })

  it('desbloqueado com 1000 XP', () => {
    expect(
      computeAchievements(makeState({ totalXp: 1000 })).find((a) => a.id === 'xp_1000')?.unlocked
    ).toBe(true)
  })
})

describe('múltiplas conquistas simultâneas', () => {
  it('50 cards desbloqueiam first_card + cards_10 + cards_50 mas não cards_100', () => {
    const result = computeAchievements(makeState({ cards: cards(50) }))
    expect(result.find((a) => a.id === 'first_card')?.unlocked).toBe(true)
    expect(result.find((a) => a.id === 'cards_10')?.unlocked).toBe(true)
    expect(result.find((a) => a.id === 'cards_50')?.unlocked).toBe(true)
    expect(result.find((a) => a.id === 'cards_100')?.unlocked).toBe(false)
  })

  it('estado completo desbloqueia todas as 12 conquistas', () => {
    const state = makeState({
      cards: cards(100),
      sessions: sessions(50),
      streak: 30,
      totalXp: 1000,
    })
    const result = computeAchievements(state)
    expect(result.every((a) => a.unlocked)).toBe(true)
    expect(result.filter((a) => a.unlocked)).toHaveLength(12)
  })
})
