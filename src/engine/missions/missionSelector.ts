import type { MissionDefinition } from './missionDefinitions'

// Seleção determinística: mesmo userId + date sempre retorna as mesmas missões.
// Usa hash simples para evitar dependências externas e garantir previsibilidade.
function simpleHash(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash
}

// Retorna monday da semana do date fornecido (YYYY-MM-DD)
export function getMondayOfWeek(date: string): string {
  const d = new Date(date + 'T00:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

// Retorna a data de hoje no formato YYYY-MM-DD
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

// Seleção determinística de `count` missões do pool para um período.
// Usa Fisher-Yates com seed derivado de userId + periodKey.
export function selectMissionsForPeriod(
  userId: string,
  periodKey: string,
  pool: MissionDefinition[],
  count: number
): MissionDefinition[] {
  if (pool.length <= count) return [...pool]

  const seed = simpleHash(userId + periodKey)
  const indices = Array.from({ length: pool.length }, (_, i) => i)

  // Fisher-Yates com PRNG determinístico baseado no seed
  let rng = seed
  for (let i = indices.length - 1; i > 0; i--) {
    rng = (rng * 1664525 + 1013904223) >>> 0
    const j = rng % (i + 1)
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  return indices.slice(0, count).map((i) => pool[i])
}
