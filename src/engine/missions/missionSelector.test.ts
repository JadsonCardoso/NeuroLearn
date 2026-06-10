import { describe, it, expect } from 'vitest'
import { selectMissionsForPeriod, getMondayOfWeek, getTodayISO } from './missionSelector'
import { DAILY_MISSIONS, WEEKLY_MISSIONS, ALL_MISSIONS, getMissionById } from './missionDefinitions'

describe('missionDefinitions', () => {
  it('DAILY_MISSIONS tem exatamente 5 missões', () => {
    expect(DAILY_MISSIONS).toHaveLength(5)
  })

  it('WEEKLY_MISSIONS tem exatamente 4 missões', () => {
    expect(WEEKLY_MISSIONS).toHaveLength(4)
  })

  it('todos os IDs de DAILY_MISSIONS são únicos', () => {
    const ids = DAILY_MISSIONS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todos os IDs de WEEKLY_MISSIONS são únicos', () => {
    const ids = WEEKLY_MISSIONS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('DAILY_MISSIONS têm periodType daily', () => {
    DAILY_MISSIONS.forEach((m) => expect(m.periodType).toBe('daily'))
  })

  it('WEEKLY_MISSIONS têm periodType weekly', () => {
    WEEKLY_MISSIONS.forEach((m) => expect(m.periodType).toBe('weekly'))
  })

  it('getMissionById retorna a missão correta', () => {
    const m = getMissionById('daily_review_10')
    expect(m).toBeDefined()
    expect(m?.id).toBe('daily_review_10')
    expect(m?.goal).toBe(10)
    expect(m?.xpReward).toBe(50)
  })

  it('getMissionById retorna undefined para ID inexistente', () => {
    expect(getMissionById('nao_existe')).toBeUndefined()
  })

  it('weekly_streak_5 tem grantsShield = true', () => {
    const m = getMissionById('weekly_streak_5')
    expect(m?.grantsShield).toBe(true)
  })

  it('ALL_MISSIONS contém todas as missões diárias e semanais', () => {
    expect(ALL_MISSIONS).toHaveLength(DAILY_MISSIONS.length + WEEKLY_MISSIONS.length)
  })

  it('todas as missões têm xpReward > 0', () => {
    ALL_MISSIONS.forEach((m) => expect(m.xpReward).toBeGreaterThan(0))
  })

  it('todas as missões têm goal >= 1', () => {
    ALL_MISSIONS.forEach((m) => expect(m.goal).toBeGreaterThanOrEqual(1))
  })

  it('todas as missões têm pelo menos um trackingEvent', () => {
    ALL_MISSIONS.forEach((m) => expect(m.trackingEvents.length).toBeGreaterThan(0))
  })
})

describe('selectMissionsForPeriod', () => {
  const userId = 'user-abc-123'
  const date = '2026-06-10'

  it('retorna exatamente count missões', () => {
    const result = selectMissionsForPeriod(userId, date, DAILY_MISSIONS, 3)
    expect(result).toHaveLength(3)
  })

  it('retorna o pool completo quando count >= pool.length', () => {
    const result = selectMissionsForPeriod(userId, date, DAILY_MISSIONS, 10)
    expect(result).toHaveLength(DAILY_MISSIONS.length)
  })

  it('é determinístico — mesmo input, mesmo output', () => {
    const r1 = selectMissionsForPeriod(userId, date, DAILY_MISSIONS, 3)
    const r2 = selectMissionsForPeriod(userId, date, DAILY_MISSIONS, 3)
    expect(r1.map((m) => m.id)).toEqual(r2.map((m) => m.id))
  })

  it('produz resultado diferente para datas diferentes', () => {
    const r1 = selectMissionsForPeriod(userId, '2026-06-10', DAILY_MISSIONS, 3)
    const r2 = selectMissionsForPeriod(userId, '2026-06-11', DAILY_MISSIONS, 3)
    // Podem coincidir por acaso, mas com pool de 5 e count de 3 é muito improvável
    expect(r1.map((m) => m.id)).not.toEqual(r2.map((m) => m.id))
  })

  it('produz resultado diferente para userId diferentes', () => {
    const r1 = selectMissionsForPeriod('user-aaa', date, DAILY_MISSIONS, 3)
    const r2 = selectMissionsForPeriod('user-bbb', date, DAILY_MISSIONS, 3)
    expect(r1.map((m) => m.id)).not.toEqual(r2.map((m) => m.id))
  })

  it('todas as missões retornadas existem no pool original', () => {
    const result = selectMissionsForPeriod(userId, date, DAILY_MISSIONS, 3)
    result.forEach((m) => {
      expect(DAILY_MISSIONS.find((d) => d.id === m.id)).toBeDefined()
    })
  })

  it('não retorna missões duplicadas', () => {
    const result = selectMissionsForPeriod(userId, date, DAILY_MISSIONS, 3)
    const ids = result.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('funciona com pool semanal — retorna 2 missões', () => {
    const result = selectMissionsForPeriod(userId, '2026-W24', WEEKLY_MISSIONS, 2)
    expect(result).toHaveLength(2)
    result.forEach((m) => {
      expect(WEEKLY_MISSIONS.find((w) => w.id === m.id)).toBeDefined()
    })
  })
})

describe('getMondayOfWeek', () => {
  it('retorna a segunda-feira da semana para uma terça', () => {
    expect(getMondayOfWeek('2026-06-09')).toBe('2026-06-08')
  })

  it('retorna a segunda-feira para uma segunda', () => {
    expect(getMondayOfWeek('2026-06-08')).toBe('2026-06-08')
  })

  it('retorna a segunda-feira correta para um domingo', () => {
    expect(getMondayOfWeek('2026-06-14')).toBe('2026-06-08')
  })

  it('retorna a segunda-feira correta para uma sexta', () => {
    expect(getMondayOfWeek('2026-06-12')).toBe('2026-06-08')
  })
})

describe('getTodayISO', () => {
  it('retorna string no formato YYYY-MM-DD', () => {
    const today = getTodayISO()
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
