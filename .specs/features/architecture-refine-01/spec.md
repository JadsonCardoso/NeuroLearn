# ARCHITECTURE-REFINE-01 — Spec

**Feature:** Refatoração Arquitetural, Limpeza Técnica e Hardening do NeuroLearn  
**Created:** 2026-06-09  
**Status:** SPECIFY ✅ | DESIGN ✅ | TASKS ✅ | EXECUTE 🔜  
**Scope:** Complex — cross-cutting, todas as camadas  
**Pipeline:** SPECIFY → DESIGN → TASKS → EXECUTE

---

## Contexto

O NeuroLearn passou por 20+ sprints de desenvolvimento iterativo. A arquitetura está funcional e testada (327 testes unitários, E2E autenticado), mas acumulou dívida técnica identificada em auditoria formal de 2026-06-09. Esta fase transforma a base em arquitetura profissional de longo prazo — sem introduzir novas features.

**Princípio guia:** Corrigir causas raiz, não sintomas. Nenhum problema mascarado.

**Anti-scope:** Novas features, redesign de UI, mudança de stack, migrações de banco.

---

## Auditoria de Referência

> **Fonte da verdade:** `.specs/features/architecture-refine-01/design.md` §2 — Inventory completo de problemas identificados.

### Problemas Críticos (P0)

- **P0-001** — Supabase `createClient()` chama `createBrowserClient()` a cada invocação → múltiplas instâncias, sem singleton
- **P0-002** — AI output não validado com Zod → JSON.parse em dado não confiável
- **P0-003** — Código legado duplicado: `src/engine/sm2.ts`, `src/engine/retention.ts`, `src/engine/scheduling.ts` (versões raiz sobrescritas pelas versões em subpastas)
- **P0-004** — `console.log` / `console.error` de debug visíveis em produção (AppContext, FocusView, etc.)

### Problemas Altos (P1)

- **P1-001** — Lógica de level-up duplicada em `skillsService.ts` E `AppContext.tsx` (risco de drift)
- **P1-002** — Lógica de streak duplicada em 3 pontos do `AppContext.tsx` (reducer FINISH_SESSION, reducer UPDATE_STREAK, async handler)
- **P1-003** — `sessions` no AppState nunca carregado do Supabase (always `[]` após boot)
- **P1-004** — `FocusView.tsx` com 10+ estados locais e 4 useEffects — difícil testar e manter
- **P1-005** — Rate limiter in-memory (`src/lib/security/rateLimit.ts`) inadequado em deploy multi-instance (Vercel)
- **P1-006** — Sem quality gates de commit: Husky + lint-staged + Conventional Commits

### Problemas Médios (P2)

- **P2-001** — Brownfield docs (`ARCHITECTURE.md`, `CONVENTIONS.md`, `STACK.md`, `CONCERNS.md`) desatualizados — ainda descrevem v1 SPA HTML único
- **P2-002** — `cards` no AppState contém todos os cards de todos os conteúdos — componentes fazem `.filter(c => c.cid === x)` repetidamente
- **P2-003** — `useAppContext.ts` e `useAppData.ts` são dois hooks para a mesma coisa — desnecessário
- **P2-004** — `src/lib/seed.ts` provavelmente é dead code (seed do banco via script avulso)
- **P2-005** — `src/lib/utils.ts` vs helpers espalhados — duplicação de formatação de datas
- **P2-006** — Bounds check ausente em `cognitiveScore.ts` (valores > 100 possíveis)
- **P2-007** — `achievements.ts` na raiz de `engine/` fora da estrutura de subpastas

---

## Requisitos

### ARQ-01 — Supabase Client Singleton

**ID:** ARQ-01  
**Prioridade:** P0  
**Arquivo:** `src/lib/supabase/client.ts`

**R-01-01** O cliente browser do Supabase DEVE ser instanciado no máximo uma vez por contexto de navegação.  
**R-01-02** A função `createClient()` DEVE retornar a instância existente se já criada.  
**R-01-03** A implementação DEVE ser compatível com React Server Components (client.ts apenas para Client Components).  
**R-01-04** O tipo genérico `Database` DEVE ser mantido para type-safety nas queries.

**Critério de aceite:** Inserir `console.count('supabase-client-created')` e confirmar que count = 1 após carregar dashboard.

---

### ARQ-02 — Validação de Output de IA com Zod

**ID:** ARQ-02  
**Prioridade:** P0  
**Arquivos:** `src/app/api/ai/*/route.ts` (4 rotas), `src/lib/ai/validation.ts`

**R-02-01** Todo output retornado pelo OpenAI DEVE ser parseado via `z.safeParse()` antes de uso.  
**R-02-02** Se `safeParse` falhar, a rota DEVE retornar HTTP 422 com mensagem amigável.  
**R-02-03** Os schemas Zod para output de IA DEVEM estar centralizados em `src/lib/ai/validation.ts`.  
**R-02-04** O JSON mode do OpenAI NÃO elimina a necessidade de validação (output ainda pode ser malformado).

**Critério de aceite:** Teste unitário: dado output malformado do OpenAI → `safeParse` retorna `success: false` → API retorna 422.

---

### ARQ-03 — Remoção de Código Legado do Engine

**ID:** ARQ-03  
**Prioridade:** P0  
**Arquivos a remover:** `src/engine/sm2.ts`, `src/engine/retention.ts`, `src/engine/scheduling.ts`  
**Arquivos canônicos:** `src/engine/spaced-repetition/`, `src/engine/retention/`, etc.

**R-03-01** Os três arquivos raiz (`sm2.ts`, `retention.ts`, `scheduling.ts`) DEVEM ser deletados.  
**R-03-02** Qualquer import que referenciasse os arquivos raiz DEVE apontar para os arquivos canônicos nas subpastas.  
**R-03-03** `src/engine/index.ts` DEVE exportar apenas dos módulos nas subpastas.  
**R-03-04** Os 8 testes unitários do engine DEVEM continuar passando após remoção.

**Critério de aceite:** `npm run test:unit` passa · zero imports para `engine/sm2`, `engine/retention`, `engine/scheduling` raiz.

---

### ARQ-04 — Eliminação de Console Logs de Debug

**ID:** ARQ-04  
**Prioridade:** P0  
**Escopo:** Todo `src/`

**R-04-01** Nenhum `console.log`, `console.info`, `console.debug` de debug DEVE existir em `src/` (exceções: `console.error` e `console.warn` com propósito explícito de monitoramento).  
**R-04-02** Logs de erro legítimos (ex: `[AppContext] Erro ao carregar`) DEVEM ser mantidos.  
**R-04-03** A regra DEVE ser enforçada via ESLint `no-console` com allowedMethods `['error', 'warn']`.

**Critério de aceite:** `npm run lint` sem warnings de console · nenhum `console.log` em grep de `src/`.

---

### ARQ-05 — Extração de Lógica Pura do AppContext

**ID:** ARQ-05  
**Prioridade:** P1  
**Arquivo principal:** `src/store/AppContext.tsx`  
**Arquivos novos:** `src/store/reducers/streakReducer.ts`, `src/store/reducers/levelUpReducer.ts`

**R-05-01** A lógica de cálculo de streak DEVE ser extraída para uma função pura testável `calculateStreak(lastStudyDate: string, currentStreak: number): { streak: number; lastStudyDate: string }`.  
**R-05-02** A lógica de level-up DEVE ser extraída para uma função pura testável `calculateLevelUp(skill: Skill): Skill` e removida do `skillsService.ts` (que chamará esta função).  
**R-05-03** Ambas as funções puras DEVEM ter testes unitários com ≥6 casos (data de hoje, data de ontem, data antiga, XP exato no limite, XP abaixo, XP acima).  
**R-05-04** O AppContext DEVE chamar essas funções em vez de duplicar a lógica.

**Critério de aceite:** Zero duplicação de lógica streak/level-up · 12+ testes passando.

---

### ARQ-06 — Carregamento de Sessions do Supabase

**ID:** ARQ-06  
**Prioridade:** P1  
**Arquivo:** `src/store/AppContext.tsx` (loadFromSupabase), `src/services/sessionsService.ts`

**R-06-01** `loadFromSupabase()` DEVE carregar as últimas 30 sessões de estudo do Supabase ao inicializar.  
**R-06-02** `sessionsService.ts` DEVE exportar `listRecentSessions(userId: string, limit = 30): Promise<StudySession[]>`.  
**R-06-03** O estado `sessions` DEVE refletir dados reais do banco após load.  
**R-06-04** A query DEVE ter limit de 30 para não sobrecarregar o payload inicial.

**Critério de aceite:** Dashboard exibe histórico real de sessões · AppContext.test.ts cobre o novo carregamento.

---

### ARQ-07 — Decomposição do FocusView

**ID:** ARQ-07  
**Prioridade:** P1  
**Arquivo:** `src/modules/focus/FocusView.tsx`  
**Arquivos novos:** 3 sub-componentes de fase

**R-07-01** `FocusView.tsx` DEVE ser decompost em 3 sub-componentes: `FocusStudyPhase`, `FocusExtractPhase`, `FocusTeachPhase`.  
**R-07-02** Cada sub-componente DEVE receber via props apenas os dados que usa (sem acesso direto ao AppContext).  
**R-07-03** O estado compartilhado entre fases (timer, notes, highlights, teach) DEVE permanecer em `FocusView.tsx` como orquestrador.  
**R-07-04** A decomposição NÃO DEVE alterar o comportamento funcional — nenhuma regressão.  
**R-07-05** Os 3 testes E2E de foco (sprint1.spec.ts, sprint2.spec.ts, sprint3.spec.ts) DEVEM continuar passando.

**Critério de aceite:** FocusView.tsx com ≤150 linhas · 3 sub-componentes isolados · E2E sem regressões.

---

### ARQ-08 — Quality Gates de Commit

**ID:** ARQ-08  
**Prioridade:** P1  
**Arquivos:** `package.json`, `.husky/`, `.lintstagedrc`, `.commitlintrc`, `.prettierrc`

**R-08-01** Husky DEVE ser configurado com hook `pre-commit` executando `lint-staged`.  
**R-08-02** `lint-staged` DEVE executar: ESLint fix + Prettier format em arquivos `.ts/.tsx` staged.  
**R-08-03** Commitlint DEVE enforçar Conventional Commits: `feat|fix|docs|style|refactor|test|chore|perf`.  
**R-08-04** `.prettierrc` DEVE estar alinhado com a configuração ESLint existente (sem conflitos de semicolons, quotes, trailing commas).  
**R-08-05** O hook `pre-push` DEVE executar `npm run type-check` para garantir zero erros de tipo antes do push.

**Critério de aceite:** Commit com mensagem inválida é rejeitado · código não-formatado é auto-formatado no pre-commit.

---

### ARQ-09 — Atualização dos Brownfield Docs

**ID:** ARQ-09  
**Prioridade:** P2  
**Arquivos:** `.specs/codebase/ARCHITECTURE.md`, `CONVENTIONS.md`, `STACK.md`, `CONCERNS.md`

**R-09-01** `ARCHITECTURE.md` DEVE descrever a arquitetura atual: Next.js 15 App Router, React 19, módulos, AppContext/useReducer, engine/.  
**R-09-02** `CONVENTIONS.md` DEVE documentar padrões atuais: naming de arquivos, componentes, hooks, services, testes, inline styles vs Tailwind.  
**R-09-03** `STACK.md` DEVE refletir o `package.json` real atual (Next.js 15, React 19, Supabase, Sentry v10, PostHog, OpenAI, web-push, etc.).  
**R-09-04** `CONCERNS.md` DEVE listar apenas concerns ATIVOS (resolver/remover os já resolvidos).

**Critério de aceite:** Docs refletem código atual · nenhuma referência ao SPA v1.

---

### ARQ-10 — Limpeza de Dead Code

**ID:** ARQ-10  
**Prioridade:** P2  
**Arquivos candidatos:** `src/lib/seed.ts`, `useAppContext.ts` (se redundante), duplicações menores

**R-10-01** `src/lib/seed.ts` DEVE ser verificado: se sem importadores ativos, DEVE ser deletado ou movido para `scripts/`.  
**R-10-02** Se `useAppContext.ts` for apenas um re-export de `useAppData.ts`, DEVE ser consolidado.  
**R-10-03** `src/engine/achievements.ts` DEVE ser movido para `src/engine/achievements/index.ts` para manter consistência de estrutura.  
**R-10-04** Todos os imports de arquivos removidos DEVEM ser atualizados.

**Critério de aceite:** Zero dead code confirmado por grep · todos os testes passando.

---

## Sequência de Execução

```
Fase A (P0 — Qualidade & Corretude):
  ARQ-03 (dead code engine)
  ARQ-04 (console.logs)
  ARQ-01 (Supabase singleton)
  ARQ-02 (AI validation)

Fase B (P1 — Manutenibilidade):
  ARQ-05 (funções puras streak/level-up)
  ARQ-06 (sessions load)
  ARQ-07 (FocusView decomposição)
  ARQ-08 (quality gates)

Fase C (P2 — Documentação & Limpeza):
  ARQ-09 (brownfield docs)
  ARQ-10 (dead code final)
```

---

## Gate de Qualidade (por tarefa)

Todo task DEVE passar, antes de considerar concluído:

```bash
npm run type-check  # zero erros
npm run lint        # zero warnings
npm run test:unit   # todos passando (≥327)
npm run build       # build limpo
```

Testes E2E rodam na sessão final de validação completa.

---

## Out of Scope

| Item                                   | Motivo                                                       |
| -------------------------------------- | ------------------------------------------------------------ |
| Migrar rate limiter para Upstash Redis | Requer conta/billing externa; não é bug funcional            |
| Cache de AI calls                      | Feature nova, não refatoração                                |
| Transações coordenadas multi-service   | Mudança arquitetural grande; requer ARCHITECTURE-REFINE-02   |
| Migrar para Zustand                    | Risco alto de regressão sem benefício imediato claro         |
| React Server Components nos módulos    | Todos os módulos usam estado/hooks — SSR não aplicável       |
| Remover inline styles                  | Esforço alto, risco de regressão visual, sem ganho funcional |
