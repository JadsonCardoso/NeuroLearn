# ARCHITECTURE-REFINE-01 — Tasks

**Feature:** Refatoração Arquitetural, Limpeza Técnica e Hardening do NeuroLearn  
**Created:** 2026-06-09  
**Status:** 🔜 Pronto para execução

---

## Convenções

- `[P]` = pode rodar em paralelo com outras tasks `[P]` do mesmo grupo
- `Gate` = comandos obrigatórios antes de marcar como ✅
- `Depends on` = task(s) que devem estar ✅ antes de iniciar esta
- **Atomic commit** por task: `refactor(arch): <descrição curta>`

---

## FASE A — P0: Qualidade & Corretude

### T-A1 — Remover Arquivos Legados do Engine `[P]`

**ID:** T-A1  
**Req:** ARQ-03  
**Depends on:** —  
**Prioridade:** P0

**What:**  
Deletar os 3 arquivos raiz duplicados do engine e garantir que todos os importers apontem para as versões canônicas nas subpastas.

**Where:**

- DELETE: `src/engine/sm2.ts`
- DELETE: `src/engine/retention.ts`
- DELETE: `src/engine/scheduling.ts`
- CHECK imports: `grep -r "from.*engine/sm2\|from.*engine/retention\|from.*engine/scheduling" src/ --include="*.ts" --include="*.tsx"`
- UPDATE: `src/engine/index.ts` — garantir que só exporta de subpastas

**Steps:**

1. Grep para confirmar quem importa os arquivos raiz
2. Atualizar cada import para apontar para a versão canônica (subpasta)
3. Deletar os 3 arquivos raiz
4. Verificar que `src/engine/index.ts` não referencia os arquivos deletados

**Done when:**

- Arquivos deletados
- Zero imports para `engine/sm2`, `engine/retention`, `engine/scheduling` (raiz)
- `engine/index.ts` exporta apenas de subpastas

**Gate:**

```bash
npm run type-check
npm run test:unit
```

---

### T-A2 — Eliminar Console Logs de Debug `[P]`

**ID:** T-A2  
**Req:** ARQ-04  
**Depends on:** —  
**Prioridade:** P0

**What:**  
Auditar todo `src/` para `console.log`, `console.info`, `console.debug` de debug e removê-los. Manter apenas `console.error` e `console.warn` com propósito explícito.

**Where:**

- Grep: `grep -rn "console\.\(log\|info\|debug\)" src/ --include="*.ts" --include="*.tsx"`
- Arquivos prováveis: `src/store/AppContext.tsx`, `src/modules/focus/FocusView.tsx`, `src/app/api/*/route.ts`

**Steps:**

1. Rodar grep para listar todos os console logs
2. Para cada um: decidir remover (debug) ou manter (erro legítimo com `console.error`)
3. Adicionar regra `no-console` ao ESLint config para prevenir regressão

**Done when:**

- Zero `console.log/info/debug` em `src/`
- ESLint configurado com `"no-console": ["warn", {"allow": ["error", "warn"]}]`
- `npm run lint` sem warnings de console

**Gate:**

```bash
npm run lint
npm run type-check
```

---

### T-A3 — Supabase Client Singleton

**ID:** T-A3  
**Req:** ARQ-01  
**Depends on:** —  
**Prioridade:** P0

**What:**  
Refatorar `src/lib/supabase/client.ts` para implementar lazy singleton — uma única instância por contexto de navegação.

**Where:**

- EDIT: `src/lib/supabase/client.ts`

**Implementation:**

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!_client) {
    _client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}
```

**Done when:**

- `createBrowserClient` chamado no máximo uma vez por execução
- Nenhuma mudança de API (callers continuam usando `createClient()` sem alteração)
- `server.ts` NÃO tem singleton (Server Components precisam de instância por request — manter como está)

**Gate:**

```bash
npm run type-check
npm run build
```

---

### T-A4 — Validação de Output de IA com Zod

**ID:** T-A4  
**Req:** ARQ-02  
**Depends on:** —  
**Prioridade:** P0

**What:**  
Adicionar `z.safeParse()` em todas as 4 rotas de IA para validar o output do OpenAI antes de retornar ao cliente.

**Where:**

- CHECK/EDIT: `src/lib/ai/validation.ts` — garantir schemas de OUTPUT existem
- EDIT: `src/app/api/ai/generate-flashcards/route.ts`
- EDIT: `src/app/api/ai/generate-quiz/route.ts`
- EDIT: `src/app/api/ai/analyze-teaching/route.ts`
- EDIT: `src/app/api/ai/cognitive-coach/route.ts`

**Schemas de output necessários em `validation.ts`:**

```typescript
// Output schemas (adicionar se não existirem)
export const generateFlashcardsOutputSchema = z.object({
  cards: z
    .array(z.object({ front: z.string().min(1), back: z.string().min(1) }))
    .min(1)
    .max(20),
})

export const generateQuizOutputSchema = z.object({
  distractors: z.array(z.string().min(1)).min(2).max(5),
})

export const analyzeTeachingOutputSchema = z.object({
  clarity_score: z.number().min(0).max(100),
  coverage_score: z.number().min(0).max(100),
  gaps: z.array(z.string()),
  suggestions: z.array(z.string()),
})

export const coachOutputSchema = z.object({
  message: z.string().min(10).max(1000),
})
```

**Padrão para cada rota:**

```typescript
const raw = JSON.parse(content ?? '{}')
const parsed = <outputSchema>.safeParse(raw)

if (!parsed.success) {
  return NextResponse.json(
    { error: 'IA retornou resposta inválida', code: 'AI_INVALID_OUTPUT' },
    { status: 422 }
  )
}

return NextResponse.json(parsed.data)
```

**Done when:**

- 4 rotas de IA com `safeParse` obrigatório
- Output inválido → HTTP 422
- Schemas de output existem em `validation.ts`

**Gate:**

```bash
npm run type-check
npm run test:unit   # testes em lib/ai/__tests__/validation.test.ts devem passar
npm run build
```

---

## FASE B — P1: Manutenibilidade

### T-B1 — Extrair Funções Puras: calculateStreak e calculateLevelUp

**ID:** T-B1  
**Req:** ARQ-05  
**Depends on:** T-A1, T-A2 (gate limpo antes de refatorar AppContext)  
**Prioridade:** P1

**What:**  
Extrair a lógica duplicada de streak e level-up para funções puras com testes unitários dedicados.

**Where:**

- CREATE: `src/store/reducers/streakReducer.ts`
- CREATE: `src/store/reducers/streakReducer.test.ts`
- CREATE: `src/engine/mastery/levelUp.ts`
- CREATE: `src/engine/mastery/levelUp.test.ts`
- EDIT: `src/store/AppContext.tsx` — usar `calculateStreak()`
- EDIT: `src/services/skillsService.ts` — usar `calculateLevelUp()`

**`streakReducer.ts`:**

```typescript
export function calculateStreak(
  lastStudyDate: string | null,
  currentStreak: number
): { streak: number; lastStudyDate: string } {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]

  if (lastStudyDate === today) return { streak: currentStreak, lastStudyDate: today }
  if (lastStudyDate === yesterday) return { streak: currentStreak + 1, lastStudyDate: today }
  return { streak: 1, lastStudyDate: today }
}
```

**`levelUp.ts`:**

```typescript
import type { Skill } from '@/types'

const MAX_XP_TABLE: Record<number, number> = { 1: 100, 2: 250, 3: 500, 4: 1000, 5: Infinity }

export function calculateLevelUp(skill: Skill): Skill {
  const maxXp = MAX_XP_TABLE[skill.level] ?? 1000
  if (skill.xp >= maxXp && skill.level < 5) {
    return { ...skill, xp: skill.xp - maxXp, level: (skill.level + 1) as Skill['level'] }
  }
  return skill
}
```

**Testes obrigatórios (≥6 casos cada):**

`streakReducer.test.ts`:

- estudou hoje → sem mudança no streak
- estudou ontem → streak + 1
- não estudou ontem → streak = 1 (quebrou)
- primeira vez (lastStudyDate = null) → streak = 1
- streak > 1, estudou ontem → incrementa corretamente
- estudou há 3 dias → reset streak = 1

`levelUp.test.ts`:

- XP abaixo do threshold → sem mudança
- XP exato no threshold → sobe de nível
- XP acima do threshold → sobe e mantém saldo
- nível 5 → não passa de 5
- nível 1 → 2 com XP correto
- XP acumulado em cadeia (nível 1 → 2 → 3) → precisa de 2 chamadas

**Done when:**

- Funções puras criadas e importadas corretamente
- Zero duplicação de lógica streak/level-up
- ≥12 novos testes passando
- AppContext e skillsService usam as funções puras

**Gate:**

```bash
npm run type-check
npm run test:unit   # ≥339 testes esperados
```

---

### T-B2 — Carregar Sessions do Supabase no AppContext

**ID:** T-B2  
**Req:** ARQ-06  
**Depends on:** T-B1  
**Prioridade:** P1

**What:**  
`loadFromSupabase()` no AppContext atualmente carrega contents, cards, skills e userData — mas nunca carrega sessions. Sessions ficam sempre `[]`. Adicionar `listRecentSessions()` e incluir no load inicial.

**Where:**

- EDIT: `src/services/sessionsService.ts` — adicionar `listRecentSessions()`
- EDIT: `src/store/AppContext.tsx` — incluir sessions no `Promise.all` do load

**`sessionsService.ts` — nova função:**

```typescript
export async function listRecentSessions(userId: string, limit = 30): Promise<StudySession[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[sessionsService] Erro ao listar sessões:', error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    cid: row.content_id,
    date: row.created_at,
    duration: row.duration_seconds ?? 0,
    highlights: [],
    notes: '',
    teach: '',
  }))
}
```

**AppContext — atualização do Promise.all:**

```typescript
const [contents, cards, skills, userResult, sessions] = await Promise.all([
  listContents(),
  listAllFlashcards(),
  listUserSkills(user.id),
  supabase.from('users').select('total_xp, streak, last_study_date').eq('id', user.id).single(),
  listRecentSessions(user.id),
])
```

**Done when:**

- `listRecentSessions` exportada de `sessionsService.ts`
- `sessions` no LOAD_STATE payload inclui dados reais
- Dashboard exibe sessões do banco (verificar manualmente)
- `AppContext.test.ts` cobre o novo carregamento

**Gate:**

```bash
npm run type-check
npm run test:unit
```

---

### T-B3 — Decompor FocusView em 3 Sub-componentes

**ID:** T-B3  
**Req:** ARQ-07  
**Depends on:** T-A1, T-A2 (build limpo antes de refatoração grande)  
**Prioridade:** P1

**What:**  
Decompor `FocusView.tsx` (~350 linhas, 10+ estados, 4 useEffects) em 3 sub-componentes de fase. FocusView vira orquestrador puro.

**Where:**

- REFACTOR: `src/modules/focus/FocusView.tsx` → máximo 150 linhas
- CREATE: `src/modules/focus/FocusStudyPhase.tsx`
- CREATE: `src/modules/focus/FocusExtractPhase.tsx`
- CREATE: `src/modules/focus/FocusTeachPhase.tsx`

**Regras de decomposição:**

1. Ler FocusView.tsx completo antes de qualquer mudança
2. Identificar os 3 limites de fase (study / extract / teach)
3. Extrair cada fase para seu componente, passando dados via props
4. FocusView mantém: `phase` state, `session` state, `timer` worker, lógica de transição entre fases, dispatch final
5. Sub-componentes recebem props e chamam callbacks (sem acesso a `useAppData`)
6. Nenhum comportamento funcional alterado

**Interfaces de props (ver design.md §D-AR-004 para detalhes)**

**Done when:**

- FocusView.tsx ≤ 150 linhas
- 3 sub-componentes existem e estão sendo usados
- Nenhuma regressão funcional

**Gate:**

```bash
npm run type-check
npm run lint
npm run test:unit
npm run build
# Verificar manualmente: iniciar uma sessão de foco, completar as 3 fases
```

---

### T-B4 — Quality Gates de Commit (Husky + lint-staged + commitlint) `[P]`

**ID:** T-B4  
**Req:** ARQ-08  
**Depends on:** T-A2 (ESLint no-console deve estar configurado antes)  
**Prioridade:** P1

**What:**  
Instalar e configurar Husky v9 + lint-staged v15 + commitlint para enforçar qualidade automaticamente em cada commit.

**Where:**

- EDIT: `package.json` — devDependencies + scripts prepare
- CREATE: `.husky/pre-commit`
- CREATE: `.husky/commit-msg`
- CREATE: `.husky/pre-push`
- CREATE: `.lintstagedrc.json`
- CREATE: `.commitlintrc.json`
- CREATE/EDIT: `.prettierrc` (se não existir ou inconsistente)
- EDIT: `eslint.config.mjs` ou `.eslintrc` — adicionar `eslint-config-prettier`

**Instalação:**

```bash
npm install --save-dev husky lint-staged @commitlint/cli @commitlint/config-conventional eslint-config-prettier
npx husky init
```

**`.husky/pre-commit`:**

```sh
#!/bin/sh
npx lint-staged
```

**`.husky/commit-msg`:**

```sh
#!/bin/sh
npx --no-install commitlint --edit "$1"
```

**`.husky/pre-push`:**

```sh
#!/bin/sh
npm run type-check
```

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
        "hotfix",
        "build"
      ]
    ],
    "subject-case": [0],
    "header-max-length": [2, "always", 100]
  }
}
```

**`.prettierrc`:**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "arrowParens": "always"
}
```

**`package.json` — adicionar:**

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

**Done when:**

- `npm run prepare` instala hooks
- Commit com mensagem `xyz` é rejeitado (tipo inválido)
- Commit com `feat: mensagem válida` é aceito
- Pre-commit formata e corrige automaticamente
- Pre-push roda type-check

**Gate:**

```bash
npm run type-check
npm run lint
npm run build
# Testar: git commit -m "mensagem inválida" → deve falhar
# Testar: git commit -m "test: mensagem válida" → deve passar
```

---

## FASE C — P2: Documentação & Limpeza

### T-C1 — Atualizar Brownfield Docs `[P]`

**ID:** T-C1  
**Req:** ARQ-09  
**Depends on:** T-B1, T-B3 (após refatorações estruturais estarem completas)  
**Prioridade:** P2

**What:**  
Reescrever os 4 docs de codebase que ainda descrevem o SPA v1 HTML único.

**Where:**

- REWRITE: `.specs/codebase/ARCHITECTURE.md`
- REWRITE: `.specs/codebase/CONVENTIONS.md`
- REWRITE: `.specs/codebase/STACK.md`
- REWRITE: `.specs/codebase/CONCERNS.md`

**O que cada doc deve conter:**

**ARCHITECTURE.md:**

- Pattern: Next.js 15 App Router + React 19 + TypeScript
- Fluxo de dados: AppContext → useAppData → modules → services → Supabase
- Estrutura de pastas atual (pós-refatoração)
- Auth flow: Magic Link → /auth/callback → middleware → protected routes
- Algoritmos cognitivos: engine/ (puro TS, sem I/O)
- CSP, headers, Sentry tunnel
- Deploy: Vercel + Supabase Cloud

**CONVENTIONS.md:**

- Naming: PascalCase componentes, camelCase hooks/services, kebab-case pastas
- Hooks: prefixo `use`, sem lógica de negócio complexa
- Services: função pura async, retornam dados ou lançam erro
- Testes: `.test.ts` junto ao arquivo, `.spec.ts` para E2E em `tests/e2e/`
- Commits: Conventional Commits (após T-B4)
- Inline styles vs Tailwind: Tailwind para novos componentes, inline styles com CSS vars para theming
- Formulários: React Hook Form + Zod + zodResolver, noValidate obrigatório

**STACK.md:**

- Refletir exatamente o `package.json` atual
- Next.js 15.x, React 19, TypeScript 5.7, Tailwind 3.4, Supabase 2.x, Sentry 10.x, PostHog, OpenAI 6.x, web-push

**CONCERNS.md:**

- Remover todas as concerns do v1 (C-001 a C-015) que foram resolvidas pela migração
- Manter apenas concerns ativas (rate limiter in-memory, AI sem cache, sessions histórico incompleto)
- Adicionar concerns novas identificadas na auditoria 2026-06-09

**Done when:**

- 4 docs reescritos
- Nenhuma referência ao SPA v1
- Concerns ativas refletem o estado real do projeto

**Gate:** Revisão manual — nenhum gate automático.

---

### T-C2 — Limpeza de Dead Code `[P]`

**ID:** T-C2  
**Req:** ARQ-10  
**Depends on:** T-B1 (para saber quais hooks são realmente usados após refatoração)  
**Prioridade:** P2

**What:**  
Remover ou consolidar código morto identificado na auditoria.

**Where:**

- CHECK: `src/lib/seed.ts` — grep por importers; se nenhum → mover para `scripts/seed.ts`
- CHECK: `src/hooks/useAppContext.ts` — se é apenas re-export de `useAppData.ts`, consolidar
- MOVE: `src/engine/achievements.ts` → `src/engine/achievements/index.ts`
- CHECK: `src/engine/index.ts` — garantir que exporta `achievements` da nova localização

**Steps:**

1. `grep -r "useAppContext\b" src/ --include="*.ts" --include="*.tsx"` — verificar se tem callers
2. `grep -r "from.*lib/seed" src/ --include="*.ts" --include="*.tsx"` — verificar importers
3. `grep -r "achievements" src/ --include="*.ts" --include="*.tsx"` — verificar callers
4. Executar cada limpeza sem quebrar o restante

**Done when:**

- `src/lib/seed.ts` ausente de `src/` (movido para `scripts/` ou deletado se sem uso)
- `useAppContext.ts` consolidado se redundante
- `achievements.ts` na estrutura correta de subpasta

**Gate:**

```bash
npm run type-check
npm run test:unit
npm run build
```

---

## FASE D — Validação Final

### T-D1 — Gate Completo + Commit Final

**ID:** T-D1  
**Req:** Todos  
**Depends on:** T-C1, T-C2 (todas as tasks anteriores ✅)  
**Prioridade:** Obrigatório

**What:**  
Gate completo final: type-check + lint + testes + build + E2E.

**Gate:**

```bash
npm run type-check          # zero erros
npm run lint                # zero warnings
npm run test:unit           # ≥ 340 testes
npm run build               # build limpo
npm run test:e2e            # todos os E2E passando
```

**Verificações manuais:**

- [ ] FocusView funciona (3 fases completas)
- [ ] Dashboard carrega com sessions reais
- [ ] Commit inválido é rejeitado pelo Husky
- [ ] `grep -rn "console\.log" src/` retorna zero resultados
- [ ] `grep -rn "from.*engine/sm2" src/` retorna zero (arquivos raiz deletados)

**Documentação:**

- [ ] `progress.md` atualizado com ARCHITECTURE-REFINE-01
- [ ] STATE.md atualizado com decisões desta fase
- [ ] `npm run generate-doc && npm run generate-pdf`

---

## Resumo de Tasks

| Task | Fase | Req    | Paralelo?                  | Status |
| ---- | ---- | ------ | -------------------------- | ------ |
| T-A1 | A    | ARQ-03 | `[P]` com T-A2, T-A3, T-A4 | 🔜     |
| T-A2 | A    | ARQ-04 | `[P]` com T-A1, T-A3, T-A4 | 🔜     |
| T-A3 | A    | ARQ-01 | `[P]` com T-A1, T-A2, T-A4 | 🔜     |
| T-A4 | A    | ARQ-02 | `[P]` com T-A1, T-A2, T-A3 | 🔜     |
| T-B1 | B    | ARQ-05 | Sequential após A          | 🔜     |
| T-B2 | B    | ARQ-06 | Sequential após T-B1       | 🔜     |
| T-B3 | B    | ARQ-07 | Sequential após A          | 🔜     |
| T-B4 | B    | ARQ-08 | `[P]` com T-B2, T-B3       | 🔜     |
| T-C1 | C    | ARQ-09 | `[P]` com T-C2             | 🔜     |
| T-C2 | C    | ARQ-10 | `[P]` com T-C1             | 🔜     |
| T-D1 | D    | Todos  | Sequential — última        | 🔜     |

**Ordem de execução:**

```
[T-A1, T-A2, T-A3, T-A4] (paralelo)
        ↓
[T-B1] → [T-B2]
[T-B3] (independente de B1/B2)
[T-B4] (independente de B1/B2/B3)
        ↓
[T-C1, T-C2] (paralelo)
        ↓
[T-D1]
```

**Estimativa:** 6-8 horas de trabalho em sessões separadas.  
**Regra:** Nunca pular o Gate de uma task. Nunca começar a próxima com gate vermelho.
