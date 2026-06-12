import { describe, it, expect } from 'vitest'
import { appReducer, EMPTY_STATE } from './AppContext'
import type { AppState, AppAction, Content, FlashCard, Skill, StudySession } from '@/types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeContent = (id = 'c1'): Content => ({
  id,
  title: 'Clean Code',
  type: 'book',
  author: 'Robert C. Martin',
  desc: 'Boas práticas',
  progress: 0,
  color: '#7c3aed',
  addedAt: '2026-01-01T00:00:00.000Z',
  trailId: null,
})

const makeCard = (id = 'card1', cid = 'c1'): FlashCard => ({
  id,
  cid,
  front: 'O que é SOLID?',
  back: 'Princípios de design OO',
  ef: 2.5,
  interval: 1,
  reps: 0,
  nextReview: '2026-01-02',
  lastReview: null,
  mastery: 'learning',
})

const makeSkill = (id = 's1'): Skill => ({
  id,
  name: 'TypeScript',
  cat: 'tech',
  color: '#3178c6',
  xp: 0,
  level: 1,
  maxXp: 100,
})

// ── LOAD_STATE ────────────────────────────────────────────────────────────────

describe('appReducer — LOAD_STATE', () => {
  it('substitui o estado completo pelo payload', () => {
    const payload: AppState = { ...EMPTY_STATE, totalXp: 500, streak: 7 }
    const next = appReducer(EMPTY_STATE, { type: 'LOAD_STATE', payload })
    expect(next.totalXp).toBe(500)
    expect(next.streak).toBe(7)
  })

  it('não muta o estado anterior', () => {
    const prev = { ...EMPTY_STATE }
    appReducer(prev, { type: 'LOAD_STATE', payload: { ...EMPTY_STATE, totalXp: 99 } })
    expect(prev.totalXp).toBe(0)
  })
})

// ── ADD_CONTENT ───────────────────────────────────────────────────────────────

describe('appReducer — ADD_CONTENT', () => {
  it('adiciona conteúdo ao array', () => {
    const content = makeContent()
    const next = appReducer(EMPTY_STATE, { type: 'ADD_CONTENT', payload: content })
    expect(next.contents).toHaveLength(1)
    expect(next.contents[0].id).toBe('c1')
  })

  it('não altera os demais campos do estado', () => {
    const next = appReducer(EMPTY_STATE, { type: 'ADD_CONTENT', payload: makeContent() })
    expect(next.cards).toEqual([])
    expect(next.totalXp).toBe(0)
  })

  it('retorna novo objeto (imutabilidade)', () => {
    const next = appReducer(EMPTY_STATE, { type: 'ADD_CONTENT', payload: makeContent() })
    expect(next).not.toBe(EMPTY_STATE)
    expect(next.contents).not.toBe(EMPTY_STATE.contents)
  })
})

// ── DELETE_CONTENT ────────────────────────────────────────────────────────────

describe('appReducer — DELETE_CONTENT', () => {
  it('remove o conteúdo pelo id', () => {
    const state: AppState = { ...EMPTY_STATE, contents: [makeContent('c1'), makeContent('c2')] }
    const next = appReducer(state, { type: 'DELETE_CONTENT', payload: 'c1' })
    expect(next.contents).toHaveLength(1)
    expect(next.contents[0].id).toBe('c2')
  })

  it('remove em cascata os cards do conteúdo deletado', () => {
    const state: AppState = {
      ...EMPTY_STATE,
      contents: [makeContent('c1')],
      cards: [makeCard('card1', 'c1'), makeCard('card2', 'c2')],
    }
    const next = appReducer(state, { type: 'DELETE_CONTENT', payload: 'c1' })
    expect(next.cards).toHaveLength(1)
    expect(next.cards[0].id).toBe('card2')
  })

  it('não remove conteúdos de outros ids', () => {
    const state: AppState = { ...EMPTY_STATE, contents: [makeContent('c1'), makeContent('c2')] }
    const next = appReducer(state, { type: 'DELETE_CONTENT', payload: 'c99' })
    expect(next.contents).toHaveLength(2)
  })
})

// ── UPDATE_CONTENT_PROGRESS ───────────────────────────────────────────────────

describe('appReducer — UPDATE_CONTENT_PROGRESS', () => {
  it('atualiza o progresso do conteúdo correto', () => {
    const state: AppState = { ...EMPTY_STATE, contents: [makeContent('c1')] }
    const next = appReducer(state, {
      type: 'UPDATE_CONTENT_PROGRESS',
      payload: { id: 'c1', progress: 75 },
    })
    expect(next.contents[0].progress).toBe(75)
  })

  it('não altera outros conteúdos', () => {
    const state: AppState = { ...EMPTY_STATE, contents: [makeContent('c1'), makeContent('c2')] }
    const next = appReducer(state, {
      type: 'UPDATE_CONTENT_PROGRESS',
      payload: { id: 'c1', progress: 50 },
    })
    expect(next.contents[1].progress).toBe(0)
  })
})

// ── ADD_CARDS ─────────────────────────────────────────────────────────────────

describe('appReducer — ADD_CARDS', () => {
  it('adiciona cards ao array', () => {
    const state: AppState = { ...EMPTY_STATE, cards: [makeCard('card1')] }
    const next = appReducer(state, {
      type: 'ADD_CARDS',
      payload: [makeCard('card2'), makeCard('card3')],
    })
    expect(next.cards).toHaveLength(3)
  })

  it('não muta o array original', () => {
    const original = [makeCard('card1')]
    const state: AppState = { ...EMPTY_STATE, cards: original }
    appReducer(state, { type: 'ADD_CARDS', payload: [makeCard('card2')] })
    expect(original).toHaveLength(1)
  })
})

// ── RATE_CARD ─────────────────────────────────────────────────────────────────

describe('appReducer — RATE_CARD', () => {
  it('atualiza ef, interval, reps e mastery do card avaliado', () => {
    const state: AppState = { ...EMPTY_STATE, cards: [makeCard('card1')] }
    const next = appReducer(state, {
      type: 'RATE_CARD',
      payload: {
        cardId: 'card1',
        ef: 2.8,
        interval: 4,
        repetitions: 1,
        nextReview: '2026-01-06',
        lastReview: '2026-01-02',
        mastery: 'review',
        xpEarned: 10,
        quality: 4,
      },
    })
    expect(next.cards[0].ef).toBe(2.8)
    expect(next.cards[0].interval).toBe(4)
    expect(next.cards[0].mastery).toBe('review')
  })

  it('acumula XP no totalXp', () => {
    const state: AppState = { ...EMPTY_STATE, totalXp: 50, cards: [makeCard('card1')] }
    const next = appReducer(state, {
      type: 'RATE_CARD',
      payload: {
        cardId: 'card1',
        ef: 2.5,
        interval: 1,
        repetitions: 0,
        nextReview: '2026-01-03',
        lastReview: '2026-01-02',
        mastery: 'learning',
        xpEarned: 15,
        quality: 3,
      },
    })
    expect(next.totalXp).toBe(65)
  })

  it('não altera cards com id diferente', () => {
    const state: AppState = { ...EMPTY_STATE, cards: [makeCard('card1'), makeCard('card2')] }
    const next = appReducer(state, {
      type: 'RATE_CARD',
      payload: {
        cardId: 'card1',
        ef: 3,
        interval: 6,
        repetitions: 2,
        nextReview: '2026-01-10',
        lastReview: '2026-01-04',
        mastery: 'strong',
        xpEarned: 20,
        quality: 4,
      },
    })
    expect(next.cards[1].ef).toBe(2.5)
  })
})

// ── ADD_SKILL + DELETE_SKILL ──────────────────────────────────────────────────

describe('appReducer — ADD_SKILL / DELETE_SKILL', () => {
  it('ADD_SKILL adiciona ao array', () => {
    const next = appReducer(EMPTY_STATE, { type: 'ADD_SKILL', payload: makeSkill() })
    expect(next.skills).toHaveLength(1)
  })

  it('DELETE_SKILL remove pelo id', () => {
    const state: AppState = { ...EMPTY_STATE, skills: [makeSkill('s1'), makeSkill('s2')] }
    const next = appReducer(state, { type: 'DELETE_SKILL', payload: 's1' })
    expect(next.skills).toHaveLength(1)
    expect(next.skills[0].id).toBe('s2')
  })
})

// ── GAIN_XP ───────────────────────────────────────────────────────────────────

describe('appReducer — GAIN_XP', () => {
  it('adiciona XP à skill e ao totalXp', () => {
    const state: AppState = { ...EMPTY_STATE, totalXp: 0, skills: [makeSkill('s1')] }
    const next = appReducer(state, { type: 'GAIN_XP', payload: { skillId: 's1', amount: 30 } })
    expect(next.skills[0].xp).toBe(30)
    expect(next.totalXp).toBe(30)
  })

  it('sobe de nível quando XP atinge maxXp (level < 5)', () => {
    const state: AppState = {
      ...EMPTY_STATE,
      skills: [{ ...makeSkill('s1'), xp: 90, level: 1, maxXp: 100 }],
    }
    const next = appReducer(state, { type: 'GAIN_XP', payload: { skillId: 's1', amount: 20 } })
    expect(next.skills[0].level).toBe(2)
    expect(next.skills[0].xp).toBe(10) // 90+20-100=10
  })
})

// ── EARN_XP ───────────────────────────────────────────────────────────────────

describe('appReducer — EARN_XP', () => {
  it('adiciona amount ao totalXp', () => {
    const state: AppState = { ...EMPTY_STATE, totalXp: 100 }
    const next = appReducer(state, { type: 'EARN_XP', payload: { amount: 50 } })
    expect(next.totalXp).toBe(150)
  })
})

// ── default (action desconhecida) ─────────────────────────────────────────────

describe('appReducer — default', () => {
  it('retorna o estado sem alteração para action desconhecida', () => {
    const next = appReducer(EMPTY_STATE, { type: 'UNKNOWN', payload: null } as unknown as AppAction)
    expect(next).toBe(EMPTY_STATE)
  })
})

// ── Fixtures de sessão ─────────────────────────────────────────────────────────

const makeSession = (id = 's1', cid = 'c1'): StudySession => ({
  id,
  cid,
  date: '2026-06-12T10:00:00.000Z',
  duration: 25,
  cardsCreated: 3,
  highlights: ['conceito A', 'conceito B'],
  notes: 'Minhas notas',
  teach: 'Minha explicação',
})

// ── UPDATE_SESSION ─────────────────────────────────────────────────────────────

describe('appReducer — UPDATE_SESSION', () => {
  it('atualiza os campos da sessão correta', () => {
    const state: AppState = { ...EMPTY_STATE, sessions: [makeSession('s1'), makeSession('s2')] }
    const next = appReducer(state, {
      type: 'UPDATE_SESSION',
      payload: { id: 's1', notes: 'Notas atualizadas', highlights: ['novo'] },
    })
    const updated = next.sessions.find((s) => s.id === 's1')
    expect(updated?.notes).toBe('Notas atualizadas')
    expect(updated?.highlights).toEqual(['novo'])
  })

  it('não altera outras sessões', () => {
    const state: AppState = { ...EMPTY_STATE, sessions: [makeSession('s1'), makeSession('s2')] }
    const next = appReducer(state, {
      type: 'UPDATE_SESSION',
      payload: { id: 's1', notes: 'Nova nota' },
    })
    const other = next.sessions.find((s) => s.id === 's2')
    expect(other?.notes).toBe('Minhas notas')
  })

  it('preserva campos não incluídos no payload', () => {
    const state: AppState = { ...EMPTY_STATE, sessions: [makeSession('s1')] }
    const next = appReducer(state, {
      type: 'UPDATE_SESSION',
      payload: { id: 's1', notes: 'Nova nota' },
    })
    const updated = next.sessions.find((s) => s.id === 's1')
    expect(updated?.teach).toBe('Minha explicação')
    expect(updated?.duration).toBe(25)
  })

  it('retorna novo array (imutabilidade)', () => {
    const state: AppState = { ...EMPTY_STATE, sessions: [makeSession('s1')] }
    const next = appReducer(state, {
      type: 'UPDATE_SESSION',
      payload: { id: 's1', notes: 'x' },
    })
    expect(next.sessions).not.toBe(state.sessions)
  })
})

// ── DELETE_SESSION ─────────────────────────────────────────────────────────────

describe('appReducer — DELETE_SESSION', () => {
  it('remove a sessão pelo id', () => {
    const state: AppState = { ...EMPTY_STATE, sessions: [makeSession('s1'), makeSession('s2')] }
    const next = appReducer(state, { type: 'DELETE_SESSION', payload: 's1' })
    expect(next.sessions).toHaveLength(1)
    expect(next.sessions[0].id).toBe('s2')
  })

  it('não remove sessões com id diferente', () => {
    const state: AppState = { ...EMPTY_STATE, sessions: [makeSession('s1'), makeSession('s2')] }
    const next = appReducer(state, { type: 'DELETE_SESSION', payload: 's99' })
    expect(next.sessions).toHaveLength(2)
  })

  it('retorna array vazio quando a única sessão é removida', () => {
    const state: AppState = { ...EMPTY_STATE, sessions: [makeSession('s1')] }
    const next = appReducer(state, { type: 'DELETE_SESSION', payload: 's1' })
    expect(next.sessions).toHaveLength(0)
  })

  it('não altera outros campos do estado', () => {
    const state: AppState = { ...EMPTY_STATE, sessions: [makeSession('s1')], totalXp: 500 }
    const next = appReducer(state, { type: 'DELETE_SESSION', payload: 's1' })
    expect(next.totalXp).toBe(500)
  })
})

// ── ASSIGN_CONTENT_TRAIL (TC-DND-010..012) ────────────────────────────────────

describe('appReducer — ASSIGN_CONTENT_TRAIL', () => {
  it('TC-DND-010: move conteúdo para nova trilha', () => {
    const content = makeContent('c1')
    content.trailId = 'trail-a'
    const state: AppState = { ...EMPTY_STATE, contents: [content] }

    const next = appReducer(state, {
      type: 'ASSIGN_CONTENT_TRAIL',
      payload: { contentId: 'c1', trailId: 'trail-b' },
    })

    expect(next.contents.find((c) => c.id === 'c1')?.trailId).toBe('trail-b')
  })

  it('TC-DND-011: move conteúdo para null (sem trilha)', () => {
    const content = makeContent('c1')
    content.trailId = 'trail-a'
    const state: AppState = { ...EMPTY_STATE, contents: [content] }

    const next = appReducer(state, {
      type: 'ASSIGN_CONTENT_TRAIL',
      payload: { contentId: 'c1', trailId: null },
    })

    expect(next.contents.find((c) => c.id === 'c1')?.trailId).toBeNull()
  })

  it('TC-DND-012: não altera outros conteúdos ao mover um', () => {
    const c1 = makeContent('c1')
    c1.trailId = 'trail-a'
    const c2 = { ...makeContent('c2'), trailId: 'trail-b' }
    const state: AppState = { ...EMPTY_STATE, contents: [c1, c2] }

    const next = appReducer(state, {
      type: 'ASSIGN_CONTENT_TRAIL',
      payload: { contentId: 'c1', trailId: 'trail-c' },
    })

    expect(next.contents.find((c) => c.id === 'c1')?.trailId).toBe('trail-c')
    expect(next.contents.find((c) => c.id === 'c2')?.trailId).toBe('trail-b')
  })

  it('TC-DND-013: não altera cards ao mover conteúdo entre trilhas', () => {
    const content = makeContent('c1')
    content.trailId = 'trail-a'
    const card = makeCard('card1', 'c1')
    const state: AppState = { ...EMPTY_STATE, contents: [content], cards: [card] }

    const next = appReducer(state, {
      type: 'ASSIGN_CONTENT_TRAIL',
      payload: { contentId: 'c1', trailId: 'trail-b' },
    })

    expect(next.cards).toHaveLength(1)
    expect(next.cards[0].cid).toBe('c1')
  })
})
