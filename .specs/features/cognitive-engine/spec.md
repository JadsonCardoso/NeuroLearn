# Feature Spec — Motor Cognitivo

**ID:** F-030
**Status:** 🔜 Planned (v1.3)
**Complexidade:** Grande
**Depende de:** F-022 (database schema), F-020 (migração Next.js)

## Overview

Motor central responsável por calcular retenção, prever esquecimento, priorizar revisões, adaptar dificuldade e recomendar reforço cognitivo. Roda no backend (Supabase Edge Functions) com acesso ao histórico completo do usuário — algo que a versão client-side não consegue fazer.

---

## Responsabilidades do Motor

| Responsabilidade                   | Quando executa                       |
| ---------------------------------- | ------------------------------------ |
| Calcular taxa de retenção por card | Ao abrir Dashboard + snapshot diário |
| Prever esquecimento (risk score)   | Rotina diária assíncrona             |
| Gerar fila de revisão priorizada   | A cada login do usuário              |
| Ajustar EF após revisão            | Imediato após rate()                 |
| Calcular força da memória          | Snapshot diário em retention_metrics |
| Medir consistência do usuário      | Cálculo de streak + padrão de estudo |
| Recomendar reforço cognitivo       | Após análise semanal de padrões      |

---

## Requirements

### R-030-01 — API de revisões espaçadas

**Endpoint:** `POST /api/review/rate`

**Payload:**

```typescript
{
  flashcard_id: string,
  quality: 1 | 2 | 3 | 4,
  response_time_ms: number  // tempo de resposta em ms
}
```

**Resposta:**

```typescript
{
  next_review: string,       // ISO date
  interval_days: number,
  ease_factor: number,
  mastery: 'new' | 'learning' | 'review' | 'strong',
  xp_gained: number,
  retention_improvement: number  // % de melhora estimada
}
```

**Lógica:**

1. Buscar card + histórico do usuário
2. Executar SM-2 com time_bonus (resposta rápida = quality+1)
3. Atualizar flashcard no PostgreSQL
4. Inserir registro em review_cycles
5. Inserir evento em cognitive_events
6. Atualizar XP do usuário
7. Retornar resultado

**Done when:** Review no frontend chama API; card atualizado no banco; histórico gravado.

---

### R-030-02 — Algoritmo SM-2 tipado (TypeScript)

```typescript
interface SM2Input {
  quality: 1 | 2 | 3 | 4
  easeFactor: number // 1.3 – 5.0
  intervalDays: number
  repetitions: number
  responseTimeMs?: number // bonus de velocidade
}

interface SM2Result {
  easeFactor: number
  intervalDays: number
  repetitions: number
  mastery: Mastery
  nextReview: Date
}

export function sm2(input: SM2Input): SM2Result {
  // qualidade com time bonus (resposta < 5s = +0.5)
  const q =
    input.responseTimeMs && input.responseTimeMs < 5000
      ? Math.min(4, input.quality + 0.5)
      : input.quality

  let nef = Math.max(1.3, input.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  let ni: number, nr: number

  if (q < 3) {
    nr = 0
    ni = 1
  } else {
    nr = input.repetitions + 1
    ni =
      input.repetitions === 0
        ? 1
        : input.repetitions === 1
          ? 6
          : Math.round(input.intervalDays * nef)
  }

  const mastery: Mastery = ni >= 21 ? 'strong' : ni >= 6 ? 'review' : 'learning'

  return { easeFactor: nef, intervalDays: ni, repetitions: nr, mastery, nextReview: addDays(ni) }
}
```

**Done when:** Testes unitários com ≥15 casos cobrindo todos os quality levels e edge cases.

---

### R-030-03 — Cálculo de retenção e risk score

```typescript
// Ebbinghaus: R = 100 × e^(-t / stability)
export function calcRetention(card: FlashCard): number {
  if (!card.lastReview) return 0
  const days = daysSince(card.lastReview)
  const stability = card.intervalDays * card.easeFactor
  return Math.max(0, Math.round(100 * Math.exp(-days / stability)))
}

// Risk score: probabilidade de esquecer nas próximas 24h
export function calcRiskScore(card: FlashCard): 'high' | 'medium' | 'low' {
  const retention = calcRetention(card)
  const daysUntilDue = daysBetween(new Date(), card.nextReview)
  if (retention < 40 || daysUntilDue < 0) return 'high'
  if (retention < 65 || daysUntilDue < 1) return 'medium'
  return 'low'
}
```

**Done when:** Risk score aparece no Dashboard; cartas em risco destacadas corretamente.

---

### R-030-04 — Fila de revisão priorizada

**Algoritmo de priorização:**

```typescript
function buildReviewQueue(cards: FlashCard[]): FlashCard[] {
  return cards.filter(isDue).sort((a, b) => {
    // 1. Cards com maior risco de esquecimento primeiro
    const riskA = calcRiskScore(a)
    const riskB = calcRiskScore(b)
    if (riskA !== riskB) return RISK_ORDER[riskA] - RISK_ORDER[riskB]
    // 2. Cards mais atrasados em segundo
    return new Date(a.nextReview) - new Date(b.nextReview)
  })
}
```

**Done when:** Fila de revisão mostra cards em ordem de urgência cognitiva.

---

### R-030-05 — Snapshot diário de retenção (Edge Function)

**Cron job:** Executa diariamente às 06:00 (horário do usuário)

```typescript
// supabase/functions/daily-retention-snapshot/index.ts
Deno.serve(async () => {
  const users = await getUsersWithActiveCards()
  for (const user of users) {
    const cards = await getUserCards(user.id)
    const snapshots = cards.map((card) => ({
      user_id: user.id,
      flashcard_id: card.id,
      retention_pct: calcRetention(card),
      days_since_review: daysSince(card.lastReview),
      snapshot_date: today(),
    }))
    await insertRetentionSnapshots(snapshots)
  }
})
```

**Done when:** Tabela retention_metrics tem registros diários; Dashboard mostra evolução histórica.

---

### R-030-06 — Dashboard de analytics cognitivo

**Métricas adicionadas ao Dashboard:**

| Métrica                      | Cálculo                           | Visualização |
| ---------------------------- | --------------------------------- | ------------ |
| Curva de retenção 30 dias    | Média diária da retention_metrics | Linha chart  |
| Distribuição de mastery      | % new/learning/review/strong      | Stacked bar  |
| Taxa de recuperação ativa    | quality≥3 / total reviews         | Gauge        |
| Cards em risco (high/medium) | calcRiskScore por card            | Alert cards  |
| Tempo médio de resposta      | AVG(response_time_ms)             | Sparkline    |
| Previsão de carga semanal    | Cards que vencem por dia          | Bar chart    |

**Done when:** Todas as 6 métricas exibidas com dados reais do PostgreSQL.

---

## Métricas que o motor considera

| Fator                     | Peso                                | Como afeta                          |
| ------------------------- | ----------------------------------- | ----------------------------------- |
| Tempo de resposta         | Bônus +0.5 quality se < 5s          | Mais fácil = intervalo maior        |
| Taxa de erro histórica    | Reduz EF se > 50% errors            | Intervalo menor para cards difíceis |
| Frequência de revisão     | Penaliza lacunas > 3x o intervalo   | Risk score high                     |
| Qualidade das explicações | v2.0 (análise IA do Modo Professor) | Ajuste de dificuldade               |

## Não inclui nesta fase

- IA adaptativa (v2.0)
- Algoritmo próprio além do SM-2 (v2.0)
- Análise de texto do Modo Professor (v2.0)
