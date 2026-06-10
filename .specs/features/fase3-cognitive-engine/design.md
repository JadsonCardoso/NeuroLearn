# Design — Fase 3: Cognitive Engine

## Estrutura de arquivos

```
src/engine/
├── sm2.ts                          ← legado — NÃO ALTERAR (backward compat)
├── retention.ts                    ← legado — NÃO ALTERAR (backward compat)
├── scheduling.ts                   ← legado — NÃO ALTERAR (backward compat)
├── index.ts                        ← NOVO: API pública (re-exporta tudo)
├── spaced-repetition/
│   ├── sm2.ts                      ← SM-2 aprimorado com responseTimeMs
│   └── scheduling.ts               ← buildReviewQueue priorizado por risco
├── retention/
│   ├── retentionModel.ts           ← Ebbinghaus estendido + calcStability
│   └── forgettingRisk.ts           ← RiskLevel: high/medium/low
├── mastery/
│   └── masteryScore.ts             ← score 0–100 por card e por conteúdo
├── skill-evolution/
│   └── skillProgression.ts         ← velocity, daysToLevelUp, trend
├── active-learning/
│   └── activeLearningScore.ts      ← Pirâmide de Glasser (4 dimensões)
└── cognitive-score/
    └── cognitiveScore.ts            ← score global 0–100

Tests (colocalizados com os módulos):
src/engine/spaced-repetition/sm2.test.ts
src/engine/spaced-repetition/scheduling.test.ts
src/engine/retention/retentionModel.test.ts
src/engine/retention/forgettingRisk.test.ts
src/engine/mastery/masteryScore.test.ts
src/engine/skill-evolution/skillProgression.test.ts
src/engine/active-learning/activeLearningScore.test.ts
src/engine/cognitive-score/cognitiveScore.test.ts
```

## Decisões técnicas

### Backward compatibility

- `src/engine/sm2.ts`, `retention.ts`, `scheduling.ts` permanecem intocados
- Imports existentes como `import { sm2 } from '@/engine/sm2'` continuam funcionando
- `engine/index.ts` exporta tudo numa API unificada

### Sem dependências circulares

- Subdirs importam apenas de `@/types` e de outros subdirs
- Subdirs NÃO importam dos arquivos legados (evita circular)
- `engine/index.ts` importa dos legados E dos subdirs

### Vitest com path alias

- `vitest.config.ts` usa `resolve.alias` para `@/` → `src/`
- Environment: `node` (sem DOM necessário nos algoritmos)
- Include: `src/engine/**/*.test.ts`

## Fluxo de dados

```
Card (FlashCard)
  └─► retentionModel.calcRetention()
  └─► forgettingRisk.calcRiskScore()
  └─► masteryScore.calcCardMasteryScore()

Cards[] (por conteúdo)
  └─► buildReviewQueue() — ordenação por risco
  └─► calcContentMastery()

SM2Enhanced
  └─► input: quality + responseTimeMs
  └─► output: easeFactor, intervalDays, repetitions, mastery, nextReview

CognitiveScore
  └─► input: retention + mastery + consistency + activeLearning
  └─► output: score 0–100 com breakdown
```
