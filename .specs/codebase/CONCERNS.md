# Concerns

**Analyzed:** 2026-06-09 (auditoria pós-ARCHITECTURE-REFINE-01)
**Updated:** 2026-06-09 — Reescrito para v2.0 (Next.js 15 + Supabase). Concerns do SPA v1 removidas (todas resolvidas pela migração).

---

## 🔴 ALTO RISCO — Ação necessária

### C-101 — Rate Limiter In-Memory (não escalável)

**Evidência:** `src/lib/security/rateLimit.ts` usa `Map<string, number[]>` em memória de processo.
**Impacto:** Em produção multi-instance (Vercel Serverless), cada instância tem seu próprio Map. Um atacante com 10 IPs diferentes pode realizar 100× mais requests do que o limite nominal antes de ser bloqueado.
**Fix (ARCHITECTURE-REFINE-02):** Migrar para Upstash Redis com `@upstash/ratelimit`. Custo ~$0 no free tier.
**Referência:** `src/lib/security/rateLimit.ts`

---

### C-102 — Sessões sem persistência de highlights/notes/teach

**Evidência:** `study_sessions` no Supabase não tem colunas `highlights`, `notes`, `teach`. `listRecentSessions()` retorna esses campos como `[]`, `''`, `''` sempre.
**Impacto:** Dados cognitivos valiosos (anotações, highlights, explicações do Modo Professor) são perdidos após o logout. Dashboard de sessões mostra dados incompletos.
**Fix (v2.1):** Migration Supabase adicionando `highlights text[]`, `notes text`, `teach text` à tabela `study_sessions`. Atualizar `createStudySession()` e `listRecentSessions()`.
**Referência:** `src/services/sessionsService.ts`

---

## 🟡 MÉDIO RISCO — Planejar para v2.1

### C-103 — Respostas de IA sem cache

**Evidência:** Cada chamada a `/api/ai/*` faz request ao OpenAI. Não há cache por `(userId, contentId, action)`.
**Impacto:** Custos crescem linearmente com uso. Dois usuários estudando o mesmo conteúdo geram dois requests idênticos.
**Fix (v2.1):** Cache em Supabase ou Upstash Redis com TTL de 24h por `(contentId, action_type, hash_do_conteúdo)`.
**Referência:** `src/app/api/ai/*/route.ts`

---

### C-104 — Histórico de revisão sem análise de padrão de erro

**Evidência:** `review_cycles` registra `ef_before`, `ef_after`, `quality`, mas o algoritmo SM-2 não considera o histórico de erros anteriores do usuário no mesmo card.
**Impacto:** Usuário que erra o mesmo card repetidamente não recebe tratamento diferente de um usuário que erra pela primeira vez.
**Fix (v2.2):** Engine cognitiva backend com acesso a `review_cycles` para ajustar `ef` baseado em padrão histórico.
**Referência:** `src/engine/spaced-repetition/sm2.ts`, `src/services/reviewService.ts`

---

### C-105 — Web Push sem retry em falha

**Evidência:** `src/app/api/push/notify/route.ts` envia push e descarta assinatura expirada, mas não faz retry em falha de rede temporária.
**Impacto:** Notificações perdidas silenciosamente em falhas transitórias do servidor push.
**Fix (v2.1):** Implementar retry com exponential backoff (máximo 3 tentativas).
**Referência:** `src/app/api/push/notify/route.ts`

---

## 🟢 BAIXO RISCO — Melhorias futuras

### C-106 — Modo Professor sem validação de qualidade mínima

**Evidência:** `FocusTeachPhase.tsx` aceita qualquer texto na textarea do Modo Professor. Um alerta visual aparece apenas acima de 30 palavras, mas não bloqueia salvamento.
**Impacto:** Usuário pode salvar sessão com texto inválido e ganhar XP (gamificação corrompida).
**Fix (v2.1):** Validar mínimo de 10 palavras antes de habilitar "Finalizar e Salvar Sessão". Exibir `FormError` inline.
**Referência:** `src/modules/focus/FocusTeachPhase.tsx`

---

### C-107 — `src/lib/seed.ts` acoplado ao `localStorageService`

**Evidência:** `localStorageService.ts` importa `SEED` de `src/lib/seed.ts` como fallback de dados iniciais para novos usuários.
**Impacto:** Dados de seed estão no bundle de produção desnecessariamente. Em Supabase mode, o seed nunca é usado.
**Fix (v2.2):** Mover lógica de seed para script `scripts/seed.ts` e remover import de `localStorageService.ts` (substituir por estado vazio `EMPTY_STATE`).
**Referência:** `src/lib/seed.ts`, `src/services/localStorageService.ts`

---

### C-108 — Sem testes E2E para fluxo completo de sessão de foco

**Evidência:** Playwright cobre dashboard, library, profile e AI validation, mas não cobre o fluxo completo `/focus/[contentId]` (3 fases: study → extract → teach → finish).
**Impacto:** Regressões na decomposição do FocusView (T-B3) podem passar despercebidas.
**Fix (v2.1):** Criar `tests/e2e/focus-session.spec.ts` cobrindo as 3 fases e o salvamento da sessão.
**Referência:** `tests/e2e/`, `src/modules/focus/FocusView.tsx`

---

## Concerns Resolvidas (v1 → v2.0)

Todas as concerns C-001 a C-015 (SPA v1) foram resolvidas pela migração para Next.js 15 + Supabase:

| ID    | Concern v1                    | Resolução                                                                        |
| ----- | ----------------------------- | -------------------------------------------------------------------------------- |
| C-001 | Zero testes                   | 369 testes unitários + E2E Playwright                                            |
| C-002 | Arquivo único 1.650 linhas    | Next.js App Router, módulos por feature                                          |
| C-003 | CDN sem pinning               | npm + package-lock.json                                                          |
| C-004 | Sem export de dados           | Supabase — dados portáveis entre devices                                         |
| C-005 | Schema sem validação          | Zod schemas em `src/lib/validation/schemas.ts`                                   |
| C-006 | Babel standalone em produção  | Next.js build (SWC compiler)                                                     |
| C-007 | Prop drilling                 | AppContext + useAppData                                                          |
| C-008 | Motor cognitivo sem histórico | `review_cycles` tabela — histórico disponível (motor avançado pendente em C-104) |
| C-009 | Sem autenticação              | Supabase Auth, Magic Link, RLS                                                   |
| C-010 | Modo Professor sem validação  | Parcialmente (C-106 rastreia melhoria pendente)                                  |
| C-011 | React dev build               | Next.js produção usa build otimizado                                             |
| C-012 | Sem PWA                       | PWA com Service Worker + manifest + Web Push                                     |
| C-013 | Sem observabilidade           | Sentry + PostHog + cognitive_events                                              |
| C-014 | SEO inexistente               | Next.js SSR + OG tags + sitemap + robots.txt                                     |
| C-015 | Sem estratégia LGPD           | Política de privacidade + `/api/user/delete`                                     |
