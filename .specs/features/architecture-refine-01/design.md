# ARCHITECTURE-REFINE-01 — Design

**Feature:** Refatoração Arquitetural, Limpeza Técnica e Hardening do NeuroLearn  
**Created:** 2026-06-09  
**Status:** ✅ Aprovado para implementação

---

## 1. Decisões Arquiteturais

### D-AR-001 — Supabase Client: Lazy Singleton por Módulo

**Problema:** `createBrowserClient()` é chamado a cada `createClient()` → múltiplas instâncias.

**Decisão:** Lazy singleton via variável de módulo.

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
```

**Rationale:**

- `createBrowserClient` do `@supabase/ssr` é seguro para ser singleton em client components
- Módulos JavaScript são cached → singleton persiste durante a SPA session
- Sem mudança de API — chamadores continuam usando `createClient()`
- **Não aplicar** ao `server.ts` — Server Components precisam de instâncias separadas por request

---

### D-AR-002 — AI Output Validation: safeParse Obrigatório

**Problema:** `JSON.parse(content)` sem Zod → falha silenciosa em produção.

**Decisão:** `z.safeParse()` em todos os outputs de IA, antes de `return NextResponse.json(data)`.

```typescript
// Padrão a seguir em todas as rotas /api/ai/*
const raw = JSON.parse(content ?? '{}')
const parsed = generateFlashcardsSchema.safeParse(raw)

if (!parsed.success) {
  return NextResponse.json(
    { error: 'IA retornou resposta inválida', code: 'AI_INVALID_OUTPUT' },
    { status: 422 }
  )
}

return NextResponse.json(parsed.data)
```

**Schemas de Output em `src/lib/ai/validation.ts`** (já existem — verificar e completar):

- `generateFlashcardsOutputSchema` — `{ cards: Array<{front, back}> }`
- `generateQuizOutputSchema` — `{ distractors: string[] }`
- `analyzeTeachingOutputSchema` — `{ clarity_score, coverage_score, gaps[], suggestions[] }`
- `coachOutputSchema` — `{ message: string }`

---

### D-AR-003 — Funções Puras para Streak e Level-Up

**Problema:** Lógica de streak em 3 lugares do AppContext; lógica de level-up em AppContext E skillsService.

**Decisão:** Extrair para funções puras com testes dedicados.

**Localização:** Próximo de onde são usadas primariamente:

- `src/store/reducers/streakReducer.ts` → `calculateStreak()`
- `src/engine/mastery/levelUp.ts` → `calculateLevelUp()` (pertence ao domínio cognitivo)

```typescript
// src/store/reducers/streakReducer.ts
export function calculateStreak(
  lastStudyDate: string | null,
  currentStreak: number
): { streak: number; lastStudyDate: string } {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

  if (lastStudyDate === today) {
    // Já estudou hoje — sem mudança
    return { streak: currentStreak, lastStudyDate: today }
  }
  if (lastStudyDate === yesterday) {
    // Continuou streak
    return { streak: currentStreak + 1, lastStudyDate: today }
  }
  // Quebrou streak
  return { streak: 1, lastStudyDate: today }
}

// src/engine/mastery/levelUp.ts
export function calculateLevelUp(skill: Skill): Skill {
  const maxXpTable = [0, 100, 250, 500, 1000] // por nível
  const maxXp = maxXpTable[skill.level - 1] ?? 1000
  if (skill.xp >= maxXp && skill.level < 5) {
    return { ...skill, xp: skill.xp - maxXp, level: skill.level + 1 }
  }
  return skill
}
```

**Regra:** `skillsService.ts` IMPORTA `calculateLevelUp`. AppContext IMPORTA `calculateStreak`. Zero duplicação.

---

### D-AR-004 — FocusView: Decomposição em 3 Sub-componentes

**Problema:** FocusView tem 10+ estados locais e 4 useEffects → difícil testar e manter.

**Decisão:** Extrair cada fase para um sub-componente que recebe props. FocusView atua como orquestrador.

```
src/modules/focus/
├── FocusView.tsx              (orquestrador — 150 linhas máx)
├── FocusStudyPhase.tsx        (fase 1: timer Pomodoro)
├── FocusExtractPhase.tsx      (fase 2: notas + highlights)
└── FocusTeachPhase.tsx        (fase 3: explicar conteúdo)
```

**Interface de Props:**

```typescript
// FocusStudyPhase
interface FocusStudyPhaseProps {
  content: Content
  onPhaseComplete: (secs: number) => void
  onLeave: () => void
}

// FocusExtractPhase
interface FocusExtractPhaseProps {
  content: Content
  onPhaseComplete: (notes: string, highlights: string[]) => void
}

// FocusTeachPhase
interface FocusTeachPhaseProps {
  content: Content
  notes: string
  onPhaseComplete: (teachText: string, newCards: FlashCard[]) => void
}
```

**Regra:** Sub-componentes NÃO acessam `useAppData` diretamente. Apenas FocusView acessa AppContext.

---

### D-AR-005 — Quality Gates de Commit

**Stack:** Husky v9 + lint-staged v15 + commitlint + @commitlint/config-conventional

**Hooks:**

- `pre-commit`: `lint-staged` (ESLint fix + Prettier)
- `commit-msg`: `commitlint` (Conventional Commits)
- `pre-push`: `npm run type-check` (zero erros TypeScript)

**`.lintstagedrc.json`:**

```json
{
  "*.{ts,tsx}": ["eslint --fix --max-warnings 0", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

**`.commitlintrc.json`:**

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "perf",
        "ci",
        "revert",
        "hotfix"
      ]
    ]
  }
}
```

**Importante:** Prettier config DEVE ser compatível com ESLint. Usar `eslint-config-prettier` para desligar regras conflitantes.

---

### D-AR-006 — ESLint: Regras Adicionais

**Adições ao `eslint.config.mjs` / `.eslintrc`:**

```json
{
  "rules": {
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "no-debugger": "error",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error"
  }
}
```

**Rationale:** `no-console` enforça ARQ-04 automaticamente. As demais são boas práticas TypeScript já implícitas no projeto mas não configuradas formalmente.

---

## 2. Inventory de Problemas (Auditoria 2026-06-09)

### 2.1 AppContext.tsx — Análise Detalhada

| #   | Problema                                            | Linha         | Severidade |
| --- | --------------------------------------------------- | ------------- | ---------- |
| 1   | Dispatch override async pode causar race conditions | 225           | P1         |
| 2   | `sessions` sempre `[]` após boot (não carregado)    | 205           | P1         |
| 3   | Streak logic triplicada                             | 119, 140, 318 | P1         |
| 4   | `RATE_CARD` faz 5 chamadas sem transação            | 298           | P1         |
| 5   | Sem retry em calls async falhas                     | todo          | P2         |

**Escopo desta fase:** Apenas #2 (sessions load) e #3 (streak extraction). Items #1, #4, #5 são ARCHITECTURE-REFINE-02.

### 2.2 Engine — Dead Code

| Arquivo                    | Status | Canônico em                                  |
| -------------------------- | ------ | -------------------------------------------- |
| `src/engine/sm2.ts`        | LEGADO | `src/engine/spaced-repetition/sm2.ts`        |
| `src/engine/retention.ts`  | LEGADO | `src/engine/retention/retentionModel.ts`     |
| `src/engine/scheduling.ts` | LEGADO | `src/engine/spaced-repetition/scheduling.ts` |

**Action:** Verificar importers → deletar arquivos raiz → atualizar imports.

### 2.3 Supabase Client — Proof of Issue

```typescript
// ATUAL (problemático)
export function createClient() {
  return createBrowserClient<Database>(URL, KEY) // nova instância a cada chamada
}

// Componente X chama createClient() → instância #1
// Componente Y chama createClient() → instância #2
// Sidebar chama createClient() → instância #3
// Total: N instâncias para N componentes que chamam createClient()
```

### 2.4 AI Validation — Proof of Issue

```typescript
// ATUAL (sem validação)
const content = response.choices[0]?.message?.content
const data = JSON.parse(content ?? '{}')
return NextResponse.json(data) // pode retornar qualquer shape
```

---

## 3. Arquitetura Alvo

### 3.1 Hierarquia de Dependências (após refatoração)

```
src/
├── app/                     # Next.js routes (pages + API)
│   └── (app)/               # Auth-protected routes
├── modules/                 # Feature views (composites)
│   └── focus/
│       ├── FocusView.tsx    # Orquestrador (≤150 linhas)
│       ├── FocusStudyPhase.tsx
│       ├── FocusExtractPhase.tsx
│       └── FocusTeachPhase.tsx
├── components/ui/           # Atomic UI (sem estado externo)
├── store/
│   ├── AppContext.tsx        # Reducer + Provider
│   └── reducers/
│       └── streakReducer.ts # calculateStreak() (pura + testável)
├── services/                # Data layer (Supabase CRUD)
├── engine/                  # Algoritmos cognitivos
│   ├── mastery/
│   │   ├── masteryScore.ts
│   │   └── levelUp.ts       # calculateLevelUp() (pura + testável)
│   └── [demais subpastas]
├── hooks/                   # Custom hooks (sem lógica de negócio)
└── lib/
    ├── supabase/
    │   ├── client.ts        # Singleton browser client
    │   └── server.ts        # Server client (por request)
    └── ai/
        └── validation.ts    # Zod schemas (input + output)
```

### 3.2 Regras de Dependência (nunca violar)

```
pages → modules → components/ui
pages → store (via hooks)
modules → store (via useAppData)
modules → services (direto é erro — via store)
store → services (OK — dispatch handler)
services → lib/supabase (OK)
engine/* → zero dependências externas (puro TS)
```

---

## 4. Validação de Qualidade

### 4.1 Métricas Alvo

| Métrica                        | Atual | Alvo                                    |
| ------------------------------ | ----- | --------------------------------------- |
| Testes unitários               | 327   | ≥ 340 (novos testes para funções puras) |
| Arquivos com `console.log`     | ~5    | 0                                       |
| Instâncias Supabase por sessão | N     | 1                                       |
| Linhas FocusView               | ~350  | ≤ 150                                   |
| Arquivos legados engine        | 3     | 0                                       |
| Brownfield docs atualizados    | 0/4   | 4/4                                     |

### 4.2 Gate Final

```bash
npm run type-check    # zero erros
npm run lint          # zero warnings (incluindo no-console)
npm run test:unit     # ≥340 testes passando
npm run build         # build limpo
npm run test:e2e      # todos os testes E2E passando (focus, library, review, profile)
```

---

## 5. Deferred (ARCHITECTURE-REFINE-02)

| Item                                   | Motivo do Defer                                                             |
| -------------------------------------- | --------------------------------------------------------------------------- |
| Transações coordenadas multi-service   | Requer Event Sourcing ou Supabase transactions — mudança arquitetural maior |
| Rate limiter → Upstash Redis           | Requer setup de conta + billing externo                                     |
| Cache de AI calls                      | Feature nova; requer Redis + ETags                                          |
| Streaming de AI responses              | UX improvement; requer mudança de cliente a API                             |
| React Query / SWR                      | Mudança grande no data fetching; risco de regressão                         |
| Testes unitários para FocusView phases | Requer mocking de Web Worker — complexo                                     |
