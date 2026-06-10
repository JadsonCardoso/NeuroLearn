# Project State

**Last updated:** 2026-06-06
**Session:** HOTFIX-01 — Correções Críticas em Produção

---

## Decisions

| ID    | Decision                                                  | Rationale                                                                                              | Date       |
| ----- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| D-001 | Single HTML file como arquitetura v1                      | Zero fricção de setup; prova de conceito rápida                                                        | 2026-06-05 |
| D-002 | localStorage como persistência v1                         | Sem backend simplifica deploy e onboarding                                                             | 2026-06-05 |
| D-003 | React CDN + Babel Standalone                              | Permite JSX sem toolchain de build                                                                     | 2026-06-05 |
| D-004 | CSS Custom Properties para dark/light                     | Troca de tema sem re-render React                                                                      | 2026-06-05 |
| D-005 | SM-2 como algoritmo de spaced repetition                  | Comprovado, simples, excelentes resultados                                                             | 2026-06-05 |
| D-006 | North Star: habilidades consolidadas                      | Mede capacidade real, não consumo                                                                      | 2026-06-05 |
| D-007 | **Next.js 15 + TypeScript como frontend** ✅ IMPLEMENTADO | SSR nativo, SEO, tipagem, ecossistema maduro, Vercel deploy                                            | 2026-06-05 |
| D-017 | **React Context + useReducer para estado**                | Zero deps extras; fácil upgrade para Zustand/Supabase nas fases seguintes                              | 2026-06-05 |
| D-018 | **CSS Custom Properties mantidas para theming**           | Compatibilidade v1.0 e zero flash na troca de tema; Tailwind usa vars como tokens                      | 2026-06-05 |
| D-019 | **Módulos como Client Components**                        | Todos os módulos usam estado/router/localStorage — `'use client'` obrigatório                          | 2026-06-05 |
| D-008 | **TailwindCSS como sistema de estilos**                   | Utility-first, design system escalável, sem CSS-in-JS overhead                                         | 2026-06-05 |
| D-009 | **Supabase como backend/BaaS**                            | PostgreSQL + Auth + Realtime + Storage + Edge Functions em um serviço; acelera MVP v2                  | 2026-06-05 |
| D-010 | **PostgreSQL como banco de dados**                        | Relações complexas (users, cards, reviews, skills); ACID; RLS nativo no Supabase                       | 2026-06-05 |
| D-011 | **Supabase Auth para autenticação**                       | JWT, OAuth, Magic Link, MFA — pronto para uso; sem implementar auth do zero                            | 2026-06-05 |
| D-012 | **RBAC com 4 perfis**                                     | aluno / mentor / admin / IA services — necessário para uso corporativo e multi-tenant                  | 2026-06-05 |
| D-013 | **Motor cognitivo no backend (Edge Functions)**           | Algoritmos SM-2 + IA precisam de dados históricos do usuário; frontend não tem acesso a todos os dados | 2026-06-05 |
| D-014 | **Sentry + PostHog para observabilidade**                 | Sentry → erros em produção; PostHog → eventos cognitivos e product analytics                           | 2026-06-05 |
| D-015 | **Vercel para deploy**                                    | Integração nativa Next.js, Edge Network global, CI/CD automático                                       | 2026-06-05 |
| D-016 | **LGPD como requisito de negócio**                        | Dados cognitivos são sensíveis (histórico, comportamento, uploads); compliance obrigatório             | 2026-06-05 |

---

## Blockers

| ID        | Blocker                                                                          | Impacto                                                   | Resolução necessária                                                     |
| --------- | -------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| B-001     | Algoritmo SM-2 sem testes unitários                                              | Qualquer refatoração pode quebrar silenciosamente         | Implementar Vitest em v1.1                                               |
| B-002     | Sem definição de provider IA (OpenAI vs Anthropic)                               | Bloqueia início da spec de IA                             | Decisão técnica a tomar em v1.3                                          |
| ~~B-003~~ | ~~[HOTFIX-01] updateUserTotalXP usa .single() — joga erro em usuário sem linha~~ | ~~Score 500 em produção~~                                 | ✅ RESOLVIDO: maybeSingle + update com early return                      |
| ~~B-004~~ | ~~[HOTFIX-01] /politica-de-privacidade retorna 404~~                             | ~~Viola LGPD art. 9º, ConsentBanner com link quebrado~~   | ✅ RESOLVIDO: página criada + redirect /privacy → 301                    |
| ~~B-005~~ | ~~[HOTFIX-01] root /app/page.tsx redireciona para /landing.html~~                | ~~Expõe arquitetura, frágil~~                             | ✅ RESOLVIDO: server component com auth check                            |
| B-006     | E2E authenticated tests falhando (23 testes)                                     | CI/CD — library, review, a11y do app não rodam localmente | Configurar TEST_USER_EMAIL + SUPABASE_SERVICE_ROLE_KEY no ambiente de CI |

---

## Todos

### Fase 1 — Concluída ✅

- [x] **[P0] Fase 1** — Migrar para Next.js 15 + TypeScript + TailwindCSS (App Router)
- [x] **[P0] Fase 1** — Separar domínio em módulos (dashboard, library, focus, review, active, skills, help)
- [x] **[P0] Fase 1** — Implementar React Context + useReducer para estado global
- [x] **[P0] Fase 1** — Portar algoritmos SM-2 e retention model para engine/ tipado
- [x] **[P0] Fase 1** — Manter localStorage com key nl_v2 (compatibilidade de dados)
- [x] **[P0] Fase 1** — Setup ESLint + Prettier + strict TypeScript sem `any`

### Aprovações

- [x] **[P0] Fase 1** — APROVADA pelo usuário em 2026-06-05

### HOTFIX-01 (Em andamento — 2026-06-06)

- [x] **[P0] spec.md** — Especificação dos 4 bugs críticos (`.specs/features/hotfix-01/spec.md`)
- [x] **[P0] tasks.md** — 8 tasks atômicas com parallelism plan (`.specs/features/hotfix-01/tasks.md`)
- [x] **[P0] T1** — `src/lib/auth/errors.ts` — mapAuthError()
- [x] **[P0] T2** — remover `public/landing.html`, fix `src/app/page.tsx`
- [x] **[P0] T3** — signup page com mensagens específicas
- [x] **[P0] T4** — login page com mensagens específicas
- [x] **[P0] T5** — `/politica-de-privacidade` page + `/privacy` redirect
- [x] **[P0] T6** — fix `updateUserTotalXP` maybeSingle + update
- [x] **[P0] T7** — middleware: remover `/landing.html`, adicionar privacy routes
- [x] **[P0] T8** — gate final: 266 testes ✅ · lint ✅ · build ✅

### Próximas fases (aguardando aprovação Fase 2)

- [x] **[P0] Fase 2** — Backend e Persistência Real (Supabase + Auth + RLS) — build ✅
- [ ] **[P0] Fase 3** — Aguarda especificação do usuário
- [ ] **[P0] Fase 4** — Aguarda especificação do usuário
- [ ] **[P0] Fase 5** — Aguarda especificação do usuário
- [ ] **[P0] Fase 6** — Aguarda especificação do usuário

### Backlog técnico

- [ ] **[P0]** — Setup Vitest + testes unitários sm2() e calcRetention() (desbloqueia B-001)
- [ ] **[P1]** — Implementar Export/Import JSON
- [ ] **[P1]** — Setup Supabase project + schema inicial
- [ ] **[P0] v2.0** — Definir provider IA (OpenAI vs Anthropic) — desbloqueia B-002
- [ ] **[P1] v2.0** — Auditoria LGPD antes do launch público

---

## Lessons Learned

| ID    | Lesson                                                                                        | Context                          |
| ----- | --------------------------------------------------------------------------------------------- | -------------------------------- |
| L-001 | Inline styles com CSS vars é eficiente para theming sem CSS-in-JS                             | Implementação dark/light mode    |
| L-002 | Arquivo único escala mal — refatorar em v1.2 para módulos separados                           | Análise brownfield               |
| L-003 | SM-2 sem testes é arriscado — bugs silenciosos impactam retenção real                         | Mapeamento de concerns           |
| L-004 | Motor cognitivo pertence ao backend — client-side não tem dados históricos suficientes        | Estratégia Técnica da Plataforma |
| L-005 | Segurança deve ser planejada antes de ter usuários — não adicionada depois                    | Estratégia de segurança LGPD     |
| L-006 | Observabilidade de eventos cognitivos é o diferencial competitivo — não é apenas logs de erro | Estratégia de observabilidade    |

---

## Deferred Ideas

| ID    | Idea                                    | Why deferred                               | Revisit at |
| ----- | --------------------------------------- | ------------------------------------------ | ---------- |
| I-001 | IA adaptativa própria (sem API externa) | Requer dataset grande + ML infrastructure  | v3.0       |
| I-002 | App mobile nativo (React Native)        | Após PWA validar demanda mobile            | v2.5       |
| I-003 | Marketplace de decks da comunidade      | Requer moderação + backend robusto         | v2.0+      |
| I-004 | Integração Kindle highlights automático | Depende de API Kindle (restrita)           | v1.3+      |
| I-005 | Modo sala de aula (professor → alunos)  | Requer multi-tenant + permissões complexas | v3.0       |
| I-006 | Certificação baseada em retenção        | Requer auditoria + proctoring              | v3.0       |

---

## Preferences

- **Modelo rápido** (haiku/sonnet): STATE.md updates, quick fixes, pinning CDN, configurações simples
- **Modelo potente**: brownfield mapping, design de features cognitivas, migração v1.2, spec de IA, schema PostgreSQL
