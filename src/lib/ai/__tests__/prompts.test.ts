import { describe, it, expect } from 'vitest'
import {
  buildFlashcardPrompt,
  buildTeachingPrompt,
  buildCoachPrompt,
  buildQuizPrompt,
} from '../prompts'
import type { CoachInput } from '@/types/ai'

// ── buildFlashcardPrompt ───────────────────────────────────────────────────

describe('buildFlashcardPrompt', () => {
  const base = {
    notes: 'A fotossíntese converte luz solar em energia química.',
    title: 'Biologia Celular',
    count: 5,
  }

  it('inclui o título no prompt', () => {
    const p = buildFlashcardPrompt(base)
    expect(p).toContain('Biologia Celular')
  })

  it('inclui as notas no prompt', () => {
    const p = buildFlashcardPrompt(base)
    expect(p).toContain('fotossíntese')
  })

  it('inclui o número de cards desejado', () => {
    const p = buildFlashcardPrompt({ ...base, count: 10 })
    expect(p).toContain('10')
  })

  it('inclui highlights quando fornecidos', () => {
    const p = buildFlashcardPrompt({ ...base, highlights: ['cloroplasto', 'ATP'] })
    expect(p).toContain('cloroplasto')
    expect(p).toContain('ATP')
  })

  it('usa "Nenhum highlight" quando highlights vazio', () => {
    const p = buildFlashcardPrompt({ ...base, highlights: [] })
    expect(p).toContain('Nenhum highlight')
  })

  it('exige resposta em JSON sem markdown', () => {
    const p = buildFlashcardPrompt(base)
    expect(p).toContain('APENAS com objeto JSON')
    expect(p).toContain('"cards"')
    expect(p).toContain('"front"')
    expect(p).toContain('"back"')
  })
})

// ── buildTeachingPrompt ────────────────────────────────────────────────────

describe('buildTeachingPrompt', () => {
  it('inclui o tópico no prompt', () => {
    const p = buildTeachingPrompt('O coração bombeia sangue.', 'Anatomia')
    expect(p).toContain('Anatomia')
  })

  it('inclui o texto do aprendiz no prompt', () => {
    const p = buildTeachingPrompt('O coração bombeia sangue.', 'Anatomia')
    expect(p).toContain('O coração bombeia sangue.')
  })

  it('solicita os 6 campos obrigatórios', () => {
    const p = buildTeachingPrompt('texto', 'tópico')
    expect(p).toContain('clarity_score')
    expect(p).toContain('coverage_score')
    expect(p).toContain('gaps')
    expect(p).toContain('strengths')
    expect(p).toContain('suggestions')
    expect(p).toContain('estimated_retention')
  })
})

// ── buildCoachPrompt ───────────────────────────────────────────────────────

describe('buildCoachPrompt', () => {
  const input: CoachInput = {
    cognitiveScore: 45,
    retention: 60,
    mastery: 25,
    consistency: 35,
    atRiskCount: 8,
    daysSinceReview: 3,
    skillTrend: 'decelerating',
  }

  it('inclui o score cognitivo no prompt', () => {
    const p = buildCoachPrompt(input)
    expect(p).toContain('45/100')
  })

  it('inclui contagem de cards em risco', () => {
    const p = buildCoachPrompt(input)
    expect(p).toContain('8')
  })

  it('inclui label legível para a tendência', () => {
    const p = buildCoachPrompt(input)
    expect(p).toContain('desacelerando')
  })

  it('inclui instrução sobre mastery < 30', () => {
    const p = buildCoachPrompt(input)
    expect(p).toContain('Você ainda não domina')
  })

  it('inclui instrução sobre atRiskCount > 5', () => {
    const p = buildCoachPrompt(input)
    expect(p).toContain('Sua retenção caiu')
  })

  it('label correto para tendência acelerando', () => {
    const p = buildCoachPrompt({ ...input, skillTrend: 'accelerating' })
    expect(p).toContain('acelerando')
  })
})

// ── buildQuizPrompt ────────────────────────────────────────────────────────

describe('buildQuizPrompt', () => {
  it('inclui a frente do card no prompt', () => {
    const p = buildQuizPrompt('O que é osmose?', 'Difusão de água por membrana', 3)
    expect(p).toContain('O que é osmose?')
  })

  it('inclui a resposta correta no prompt', () => {
    const p = buildQuizPrompt('O que é osmose?', 'Difusão de água por membrana', 3)
    expect(p).toContain('Difusão de água por membrana')
  })

  it('inclui o número de distratores solicitados', () => {
    const p = buildQuizPrompt('front', 'back', 4)
    expect(p).toContain('4')
  })

  it('solicita resposta em JSON com campo distractors', () => {
    const p = buildQuizPrompt('front', 'back', 3)
    expect(p).toContain('"distractors"')
  })
})
