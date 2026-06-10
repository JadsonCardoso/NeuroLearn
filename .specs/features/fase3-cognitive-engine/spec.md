# Feature Spec — Fase 3: Cognitive Engine (Camada de Domínio)

**ID:** F-031
**Status:** 🚧 In Progress
**Complexidade:** Complex
**Depende de:** F-020 (Fase 1 ✅), F-022 (Fase 2 ✅), B-001 (Vitest — resolvido nesta fase)
**Relacionado a:** F-030 (Motor Cognitivo — spec completa, Edge Functions futuras)

## Contexto

O objetivo desta fase é implementar a **camada de domínio pura** do Cognitive Engine:
algoritmos TypeScript desacoplados da UI e da infraestrutura, testáveis de forma unitária.
A decisão D-013 (motor no backend) continua válida — esta camada será a base para Edge Functions futuras.

O que existe hoje em `src/engine/`:

- `sm2.ts` — SM-2 básico sem response time
- `retention.ts` — Ebbinghaus simples sem risk score
- `scheduling.ts` — isDue/relDate básicos

---

## Requirements

### CE-001 — Setup Vitest

- Instalar `vitest` + `@vitest/coverage-v8`
- Configurar `vitest.config.ts` com environment `node`, include `src/engine/**/*.test.ts`
- Adicionar scripts: `test:unit` e `test:coverage`
- **Done when:** `npm run test:unit` executa e passa

---

### CE-002 — SM-2 Aprimorado (`engine/spaced-repetition/sm2.ts`)

Input:

```ts
interface SM2Input {
  quality: 1 | 2 | 3 | 4
  easeFactor: number // 1.3–5.0, default 2.5
  intervalDays: number
  repetitions: number
  responseTimeMs?: number // bônus: < 5000ms → quality +0.5
}
```

Lógica:

1. Calcular qualidade ajustada com `responseTimeMs`
2. EF novo: `max(1.3, EF + 0.1 - (5-q)(0.08 + (5-q)×0.02))`
3. Se q < 3 → reset (reps=0, interval=1)
4. Se q ≥ 3: reps++, interval = reps=0→1, reps=1→6, else→round(interval×EF)
5. Mastery: interval≥21→'strong', ≥6→'review', else→'learning'
6. Limitar interval: min=1, max=365

Output: `{ easeFactor, intervalDays, repetitions, mastery, nextReview: Date }`

**Done when:** ≥15 testes unitários cobrindo todos os quality levels, bônus de tempo, reset e edge cases.

---

### CE-003 — Modelo de Retenção Ebbinghaus (`engine/retention/retentionModel.ts`)

Fórmula principal:

```
R(t) = e^(-t / S)   onde S = intervalDays × easeFactor
```

Retorna valor 0–100 (percentual).

- `t = 0` → R = 100
- Card sem `lastReview` → R = 0
- R arredondado para inteiro

Função adicional: `calcStability(intervalDays, easeFactor): number`

**Done when:** ≥10 testes cobrindo decaimento temporal, edge cases (t=0, sem review, EF extremo).

---

### CE-004 — Risk Score (`engine/retention/forgettingRisk.ts`)

```ts
type RiskLevel = 'high' | 'medium' | 'low'

function calcRiskScore(card: FlashCard): RiskLevel
```

Regras:

- retention < 40 OU card vencido → 'high'
- retention < 65 OU vence em < 1 dia → 'medium'
- else → 'low'

**Done when:** ≥8 testes cobrindo todos os níveis e limites.

---

### CE-005 — Fila de Revisão Priorizada (`engine/spaced-repetition/scheduling.ts`)

```ts
function buildReviewQueue(cards: FlashCard[]): FlashCard[]
```

Ordem de prioridade:

1. Risk score: high → medium → low
2. Desempate: cards mais atrasados primeiro (`nextReview` crescente)

Funções existentes mantidas: `isDue`, `relDate`

**Done when:** ≥8 testes cobrindo ordenação por risco e por data.

---

### CE-006 — Mastery Score (`engine/mastery/masteryScore.ts`)

Score 0–100 para um card:

```
masteryScore = baseScore × stabilityMultiplier
baseScore: new=0, learning=25, review=50, strong=75
stabilityMultiplier = min(1.0, R(t) / 100)
```

Score de domínio de um conteúdo:

```
contentMastery = avg(masteryScore dos cards do conteúdo)
```

**Done when:** ≥8 testes cobrindo cada mastery level e decaimento.

---

### CE-007 — Skill Evolution (`engine/skill-evolution/skillProgression.ts`)

```ts
interface SkillSnapshot {
  xp: number
  level: number
  maxXp: number
  recentXpGains: number[] // XP dos últimos 7 dias
}

interface SkillEvolution {
  velocity: number // XP médio por dia (últimos 7 dias)
  daysToLevelUp: number // baseado na velocity atual (-1 se velocity=0)
  trend: 'accelerating' | 'stable' | 'decelerating' | 'stalled'
}
```

**Done when:** ≥6 testes cobrindo velocity=0, aceleração, desaceleração, nível máximo.

---

### CE-008 — Active Learning Score (`engine/active-learning/activeLearningScore.ts`)

Baseado na Pirâmide de Glasser:

```ts
interface ActiveLearningInput {
  hasNotes: boolean // 10% weight
  hasHighlights: boolean // 20% weight
  teachingText: string // 30% weight (>50 chars = ativo)
  activeRecallCount: number // 40% weight (≥3 = completo)
}

// score 0–100
function calcActiveLearningScore(input: ActiveLearningInput): number
```

**Done when:** ≥8 testes cobrindo combinações de inputs e pesos.

---

### CE-009 — Cognitive Score (`engine/cognitive-score/cognitiveScore.ts`)

Score cognitivo geral 0–100 combinando todos os signals:

```
cognitiveScore = (
  retention × 0.35 +
  mastery   × 0.30 +
  consistency × 0.20 +
  activeLearning × 0.15
)
```

Onde `consistency = min(100, reviewsLast30Days / expectedReviews × 100)`

**Done when:** ≥8 testes cobrindo pesos, valores extremos e consistência zero.

---

### CE-010 — Engine Public API (`engine/index.ts`)

Exportar todas as funções públicas em um único ponto de entrada.
Re-exportar de `engine/retention.ts`, `engine/sm2.ts`, `engine/scheduling.ts` para backward compatibility.

**Done when:** imports existentes no codebase continuam funcionando sem alteração.

---

### CE-011 — Cobertura de testes ≥ 80%

`npm run test:coverage` deve reportar ≥ 80% nas funções do engine.

---

## Out of scope nesta fase

- Edge Functions Supabase (F-030-R-030-05)
- API Routes Next.js (R-030-01)
- Dashboard analytics (R-030-06) — próxima iteração
- IA adaptativa (v2.0)
