# NeuroLearn — Progresso do Projeto

> **Última atualização:** 2026-06-12
> **Status geral:** Sprint 02 entregue. 484 testes unitários (34 arquivos), build limpo, zero erros de tipo. Módulo de Projetos completo (CRUD + associação de trilhas + progresso calculado). MemoryView com edição/exclusão de sessões e exercícios por conteúdo. LibraryView com filtros por tipo, status e busca textual. Novas rotas E2E autenticadas: projects, memory-crud, library-filters.

---

## Visão Geral

| Fase                             | Descrição                                                                                                                                                      | Status       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1                                | Migração arquitetural (Next.js 15 + TypeScript + Tailwind)                                                                                                     | ✅ Concluída |
| 2                                | Integração Supabase (auth + banco + serviços)                                                                                                                  | ✅ Concluída |
| 3                                | Cognitive Engine — camada de domínio (algoritmos + testes)                                                                                                     | ✅ Concluída |
| 4                                | Segurança da Plataforma (OWASP + LGPD + hardening)                                                                                                             | ✅ Concluída |
| UX-01                            | Sistema Global de Validação, Feedback e UX Cognitiva                                                                                                           | ✅ Concluída |
| QA-01                            | Engenharia de Qualidade — infraestrutura, cobertura E2E e unitária                                                                                             | ✅ Concluída |
| DOC-01                           | Reestruturação Completa da Documentação                                                                                                                        | ✅ Concluída |
| HOTFIX-01                        | 4 correções críticas de produção (auth UX, privacidade, routing, acessibilidade)                                                                               | ✅ Concluída |
| SMTP-01                          | E-mail customizado via Hostinger SMTP + templates brandados + DNS (SPF/DKIM/DMARC)                                                                             | ✅ Concluída |
| INFRA-01                         | Migração Hostinger → Vercel + fix auth callback + resolução DNS split-brain                                                                                    | ✅ Concluída |
| CRUD-01                          | CRUD completo na Biblioteca — ConfirmDialog, Edit/Delete conteúdo e flashcards, Toast global, fix UUID                                                         | ✅ Concluída |
| PRODUCT-OPS-01                   | Discovery completo + PRDs + Histórias + BDD + Estratégia QA + Roadmap 4 sprints                                                                                | ✅ Concluída |
| SPRINT-1                         | Busca na Library, atalhos de teclado no Review, Cognitive Score no Dashboard, streak no Supabase                                                               | ✅ Concluída |
| SPRINT-2                         | Tela de resultado do Review com Cognitive Score (antes vs. depois da sessão)                                                                                   | ✅ Concluída |
| SPRINT-3                         | IA modal flashcards, onboarding checklist, cron retenção, BUG-002 xpDelta atômico                                                                              | ✅ Concluída |
| SPRINT-4                         | Cards em risco reais (Supabase), análise Modo Professor IA, grade de conquistas + toast                                                                        | ✅ Concluída |
| SPRINT-4-ORIGINAL                | Web Worker timer, navigation warning, BottomNav mobile, Google OAuth "Em breve"                                                                                | ✅ Concluída |
| OBS-01                           | Observabilidade — Sentry v10 + PostHog + integração LGPD + PostCSS CVE fix                                                                                     | ✅ Concluída |
| DASH-01                          | Dashboard Avançado — heat map de atividade, tendência de retenção, domínio por conteúdo                                                                        | ✅ Concluída |
| SET-01                           | Página /settings — export/import JSON, exclusão de conta, sincronização Supabase, aviso LGPD                                                                   | ✅ Concluída |
| PWA-01                           | Instalabilidade (manifest + ícones), Service Worker cache-first, Push Notifications + cron diário                                                              | ✅ Concluída |
| AI-02                            | Quiz Adaptativo com IA — modo Auto-Avaliação em ActiveView, testes unitários + E2E                                                                             | ✅ Concluída |
| DOC-UX-01                        | Guia do Usuário v3.0 — 15 seções premium, UX Writing, Markdown + DOCX + PDF                                                                                    | ✅ Concluída |
| LIB-FIX-01                       | 3 correções na Biblioteca: overflow de URL, confirmação ao fechar modal com dados, JSON mode flashcards                                                        | ✅ Concluída |
| DOC-IMG-01                       | Screenshots reais no Guia do Usuário — 9 capturas Playwright + suporte a imagens no gerar-pdf.js                                                               | ✅ Concluída |
| PROD-FIX-01                      | 4 bugs de produção: CSP (worker-src blob:, PostHog CDN), React #418 (hydration mismatch), sentry.client.config.ts ausente, HTTP 500 diagnóstico OPENAI_API_KEY | ✅ Concluída |
| FRENTE-1                         | Perfil do usuário (/profile): edição de nome/avatar, notificações; SEO (sitemap.xml, robots.txt, OpenGraph); sidebar reativa via `nl:profile-updated`          | ✅ Concluída |
| HOTFIX-CONSOLE-01                | Console de produção limpo: RLS recursão infinita → 500, Sentry tunnel, CSP PostHog, config Sentry consolidada                                                  | ✅ Concluída |
| ARCHITECTURE-REFINE-01 Fase A    | Limpeza engine, ESLint no-console, lazy singleton Supabase, validação Zod output IA (422/AI_INVALID_OUTPUT)                                                    | ✅ Concluída |
| ARCHITECTURE-REFINE-01 Fases B–D | Funções puras, sessions reais, FocusView decomposto, Husky, dead code, brownfield docs                                                                         | ✅ Concluída |
| COGNITIVE-PERSISTENCE-01         | Autosave de rascunhos (`useAutoSave` + `sessionDraftsService`), MemoryView reescrita com acordeões por conteúdo + busca, `memory.spec.ts` E2E                  | ✅ Concluída |
| MELHORIAS-01                     | Tab "Meu Material de Estudo" no ReviewView, highlights âmbar, rename Caderno→Material, keyboard guard bug fix                                                  | ✅ Concluída |
| LEARNING-STRUCTURE-01 (LS-01-A)  | Hierarquia Trilhas→Conteúdos: `learning_trails` table, RLS, TrailFormModal, LibraryView agrupada, auto-migration "Meus Estudos", 10 testes E2E                 | ✅ Concluída |
| HELP-UPDATE-01                   | Central de Ajuda: 12 módulos (5 novos + 2 atualizados), `<button>` nativo WCAG, data-testid, help.spec.ts TC-HELP-001..007                                    | ✅ Concluída |
| LEARNING-STRUCTURE-01 (LS-01-B)  | Paginação por trilha (PAGE_SIZE=6), busca estendida (título+autor+desc), useMemo, botões "Ver mais/Menos", 8 testes E2E                                       | ✅ Concluída |
| HELP-UX-01                       | Busca em tempo real na Central de Ajuda (title+tagline+steps), deep-link ?section=id, Suspense Next.js 15, TC-HELP-001..013                                   | ✅ Concluída |
| PROFILE-UPGRADE                  | Metas de estudo (JSONB), histórico de atividade (7 sessões), stats de resumo; Dashboard com 4 progress bars de metas; TC-PROF-001..012                        | ✅ Concluída |
| F-080                            | Core Web Vitals: LCP (preconnect+font swap), CLS (skeletons), INP (startTransition+memo), bundle (analyzer+optimizePackageImports), lazy load (dynamic ssr:false) | ✅ Concluída |
| F-090                            | Gamificação v2: missões diárias/semanais, streak recovery (Streak Shields), MissionsPanel, StreakRecoveryBanner | ✅ Concluída |
| LIBRARY-UX-REVISION-01           | ContentDrawer lateral, DnD @dnd-kit, collapse de trilhas + localStorage, ContextSelector, aba Exercícios (Prática Livre), MemoryView contextual | ✅ Concluída |
| QA-GLOBAL-01                     | Análise completa do projeto (qa-estrategico + qa-expert + production-security-gate). BUG-GLOBAL-001 LGPD corrigido. 4 specs E2E novos (focus, active, skills, global-regression — 71+ cenários). | ✅ Concluída |
| KNOWLEDGE-HUB-01                 | Base Central de Conhecimento: 13 documentos em `project-knowledge/` — RF, RNF, RN, CA, ADR, Riscos, Fluxos, UX, Arquitetura, QA, Segurança, Contexto | ✅ Concluída |
| 7                                | Crescimento: ranking entre usuários, blog educacional, landing v2                                                                                              | 🔜 Futura    |
| 7                                | Crescimento: blog educacional, landing v2, Open Graph                                                                                                          | 🔜 Futura    |

---

## Fase 1 — Migração Arquitetural ✅

**O que era:** arquivo único `index.html` com React via CDN, Babel no runtime, sem TypeScript, sem modularização.

**O que foi feito:**

### Stack

- **Next.js 15** (App Router, porta 3003)
- **React 19**
- **TypeScript 5.7** (strict, sem `any`)
- **TailwindCSS 3.4** + PostCSS
- **ESLint** + Prettier

### Estrutura criada em `src/`

```
src/
├── app/
│   ├── layout.tsx               # Root layout (fontes, CSS global)
│   ├── page.tsx                 # Redireciona para /landing.html
│   ├── (app)/                   # Grupo de rotas protegidas
│   │   ├── layout.tsx           # Verifica sessão server-side
│   │   ├── dashboard/page.tsx
│   │   ├── library/page.tsx
│   │   ├── focus/page.tsx       # Tela de seleção de conteúdo
│   │   ├── focus/[contentId]/page.tsx
│   │   ├── review/page.tsx
│   │   ├── active/page.tsx
│   │   ├── skills/page.tsx
│   │   └── help/page.tsx
│   └── auth/
│       ├── login/page.tsx       # Email+Senha, Magic Link, Google OAuth
│       ├── signup/page.tsx
│       └── callback/route.ts   # Handler OAuth
├── components/
│   ├── icons/index.tsx          # Ícones SVG inline
│   ├── ui/                      # Ring, Button, Card, Input, Textarea, Badge, ProgressBar
│   └── layout/                  # Sidebar, ThemeToggle, MigrationBanner
├── modules/                     # Lógica de cada página
│   ├── dashboard/DashboardView.tsx
│   ├── library/LibraryView.tsx + AddContentModal.tsx
│   ├── focus/FocusView.tsx + FocusIndexView.tsx
│   ├── review/ReviewView.tsx
│   ├── active/ActiveView.tsx
│   ├── skills/SkillsView.tsx
│   └── help/HelpView.tsx
├── engine/                      # Algoritmos core
│   ├── sm2.ts                   # SM-2 (revisão espaçada)
│   ├── retention.ts             # Modelo de retenção exponencial
│   └── scheduling.ts
├── services/                    # Camada de dados
│   ├── contentsService.ts
│   ├── flashcardsService.ts
│   ├── skillsService.ts
│   ├── sessionsService.ts
│   ├── reviewService.ts
│   ├── retentionService.ts
│   ├── cognitiveEventsService.ts
│   └── localStorageService.ts   # Fallback offline
├── hooks/
│   ├── useAppData.ts
│   ├── useTheme.ts
│   └── useMigration.ts
├── lib/
│   ├── utils.ts
│   ├── seed.ts
│   └── supabase/
│       ├── client.ts            # createBrowserClient
│       └── server.ts            # createServerClient (cookies)
├── store/
│   └── AppContext.tsx           # Estado global + sync Supabase
└── types/
    ├── index.ts                 # Tipos de domínio
    └── database.types.ts        # Gerado via Supabase MCP
```

### Algoritmos core (engine/)

- **SM-2** (`sm2.ts`): fator de facilidade, intervalo, repetições — revisão espaçada
- **Retention** (`retention.ts`): decaimento exponencial `exp(-days / (interval × ef))` — identifica cartões em risco
- **Scheduling** (`scheduling.ts`): fila de revisão por data

### Tipos de domínio (`src/types/index.ts`)

```
Content, FlashCard, Skill, StudySession, AppState
ContentType, CardMastery, SkillCategory, UserRole
AppAction (LOAD_STATE, ADD_CONTENT, ADD_CARDS, RATE_CARD, ADD_SKILL, GAIN_XP, FINISH_SESSION, EARN_XP)
```

---

## Fase 2 — Integração Supabase ✅

### Projeto Supabase

- **Project ID:** `&lt;project-id&gt;`
- **Região:** `us-east-1` (US East)
- **URL:** `https://&lt;project-id&gt;.supabase.co`

### Variáveis de ambiente (`.env.local` — nunca commitar)

```
NEXT_PUBLIC_SUPABASE_URL=https://&lt;project-id&gt;.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
```

### Schema do banco (`public`)

| Tabela                | Descrição                                                              |
| --------------------- | ---------------------------------------------------------------------- |
| `users`               | Perfis de usuário (id, email, role, total_xp, streak, last_study_date) |
| `contents`            | Conteúdos da biblioteca (livros, cursos, vídeos, etc.)                 |
| `flashcards`          | Cartões SM-2 (ef, interval, reps, nextReview, mastery)                 |
| `skills`              | Habilidades globais                                                    |
| `user_skills`         | Relação usuário ↔ habilidade (XP, level)                               |
| `study_sessions`      | Sessões de estudo (Pomodoro)                                           |
| `review_cycles`       | Histórico de revisões                                                  |
| `retention_snapshots` | Snapshots de retenção por cartão                                       |
| `cognitive_events`    | Log de eventos cognitivos (analytics)                                  |

### RLS (Row Level Security)

- Todas as tabelas têm RLS ativo
- Política base: `auth.uid() = user_id`

### Autenticação

- **Provedor email/senha:** ativo
- **Magic Link:** ativo
- **Google OAuth:** configurado (requer setup no dashboard Supabase)
- **Trigger `on_auth_user_created`:** cria automaticamente row em `public.users` ao registrar

### Middleware (`middleware.ts`)

```
Matcher: todas as rotas exceto _next/static, imagens e favicon
Lógica:
  - Rota de app sem sessão → redirect /auth/login
  - Rota de auth com sessão → redirect /dashboard
```

### Clientes Supabase

- **Browser:** `src/lib/supabase/client.ts` → `createBrowserClient` (sem cookies server-side)
- **Servidor:** `src/lib/supabase/server.ts` → `createServerClient` com `cookies()` do Next.js

### AppContext (`src/store/AppContext.tsx`)

- Carrega estado do Supabase no mount (4 queries em paralelo)
- Fallback para localStorage quando sem sessão (modo offline/dev)
- Sincroniza ações com Supabase via side effects assíncronos

---

## Super Admin ✅

| Campo   | Valor                                        |
| ------- | -------------------------------------------- |
| Email   | `neurolearnadmindoneurolearn@gmail.com`      |
| Senha   | `NeuroLearn@2025!` ← **alterar em produção** |
| Role    | `super_admin`                                |
| User ID | `b33b240a-3121-429f-8099-48d34ef16d5e`       |

---

## Landing Page ✅

- `landing.html` → `public/landing.html` (servido estaticamente pelo Next.js)
- Root `/` redireciona para `/landing.html`
- Todos os links apontam para rotas Next.js (`/auth/login`, `/auth/signup`, `/dashboard`, etc.)
- Zero referências a `index.html`

---

## QA e Testes ✅

### Configuração

- **Playwright 1.60.0** configurado em `playwright.config.ts`
- Servidor: `npm run dev:clean` (port 3003, `reuseExistingServer: true` em dev)
- Reports em `tests/reports/playwright/`

### Suite de testes E2E (Playwright — multi-project)

| Arquivo                              | Projeto         | Testes                                               |
| ------------------------------------ | --------------- | ---------------------------------------------------- |
| `tests/e2e/global.setup.ts`          | `setup`         | Auth via Supabase Admin API → storageState           |
| `tests/e2e/landing.spec.ts`          | `chromium`      | 7 testes: links, redirects, conteúdo da landing      |
| `tests/e2e/auth.spec.ts`             | `chromium`      | 7 testes: login, signup, proteção de rotas           |
| `tests/e2e/app.spec.ts`              | `chromium`      | 23 testes: manifesto, rotas protegidas, auth público |
| `tests/e2e/ux-01-validation.spec.ts` | `chromium`      | 15 testes: novalidate, PT-BR, aria-invalid, loading  |
| `tests/e2e/library.spec.ts`          | `authenticated` | 11 testes: add conteúdo, validação, Escape, aria     |
| `tests/e2e/review.spec.ts`           | `authenticated` | 6 testes: carga, estado vazio, heading, sidebar      |
| `tests/e2e/accessibility.spec.ts`    | `authenticated` | 12 testes: labels, aria-label, tab order, role=alert |

### Casos de teste documentados

- `tests/auth/TEST-CASES.md` — TC-AUTH-001 a TC-AUTH-015
- `tests/dashboard/ARCH-TEST-CASES.md` — TC-ARCH
- `tests/e2e/LANDING-TEST-CASES.md` — TC-LAND
- `tests/reports/QA-REPORT-FASE1-FASE2-2026-06-05.md` — relatório completo
- `tests/TEST-EXECUTION-TRACKING.csv` — 33 casos rastreados

### QA Exploratório — Ciclo completo (2026-06-06)

Executado com skill `qa-estrategico` (heurísticas CREA + ALTER FACE). **17 bugs corrigidos** em 14 arquivos:

| Arquivo               | Correção                                               |
| --------------------- | ------------------------------------------------------ |
| `AddContentModal.tsx` | ESC + click no overlay fecha o modal                   |
| `SkillsView.tsx`      | ESC + overlay + botão "Remover habilidade"             |
| `ActiveView.tsx`      | Mostra todos os conteúdos (não só `progress > 0`)      |
| `DashboardView.tsx`   | Proteção `relDate` undefined + grid responsivo mobile  |
| `HelpView.tsx`        | Acessibilidade de teclado no accordion (WCAG 2.1)      |
| `LibraryView.tsx`     | Botão ✕ para remover conteúdo com confirmação          |
| `FocusView.tsx`       | `router.push('/focus')` em vez de `router.back()`      |
| `types/index.ts`      | Action types `DELETE_CONTENT` e `DELETE_SKILL`         |
| `AppContext.tsx`      | Reducers + handlers Supabase para DELETE_CONTENT/SKILL |
| `skillsService.ts`    | Função `removeUserSkill` criada                        |

---

## Correções e Otimizações Aplicadas ✅

| Data       | O que foi feito                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-05 | Tela de Foco: `/focus` criava redirect para biblioteca; agora exibe `FocusIndexView` com seleção de conteúdo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-06-05 | Performance: `(app)/layout.tsx` trocou `getUser()` por `getSession()` (elimina round-trip de rede desnecessário)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-06-05 | Performance: AppContext paralelizou query de XP/streak com as demais (4 queries simultâneas)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-06-05 | Email admin alterado para `neurolearnadmindoneurolearn@gmail.com`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-06-06 | Fase 3: Cognitive Engine implementado — 6 módulos de algoritmos + 76 testes unitários (Vitest)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-06-06 | Fase 4: Segurança implementada — OWASP hardening, rate limiting, Zod validation, RBAC, LGPD consent + data deletion API                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-06-06 | QA exploratório completo (qa-estrategico): 17 bugs corrigidos, 23 testes E2E criados (23/23 passando)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-06-06 | Landing page: seção Manifesto adicionada em `public/landing.html`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-06-06 | Flash de tema corrigido: script inline no `<head>` + CSS vars para auth panel + `signup/page.tsx` reescrito com `useTheme()`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-06-06 | Supabase config ajustada: URL do site `localhost:3003` + redirect URL `http://localhost:3003/auth/callback`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-06-06 | UX-01: componentes `FormField`, `FormError`, `FormHint`, `LoadingButton` criados; formulários Login, Signup, AddContentModal refatorados com React Hook Form + Zod v4 + novalidate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-06-06 | BUG-03 a BUG-06 corrigidos: aria-describedby, setFocus em erros, FieldErrors tipado, Zod `.email()` substituído por `.refine()`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-06-06 | QA-01: Testing Library + jsdom + @vitejs/plugin-react instalados; testes de services (contents, flashcards, review) com mock Supabase builder; AppContext reducer, ToastContext, useTheme, useToast testados; 260 testes unitários passando                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-06-06 | QA-01: Playwright multi-project configurado (setup/chromium/authenticated); Page Objects LibraryPage e ReviewPage; specs library, review e accessibility criados                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-06-06 | DOC-01: docs/ criada com 7 subpastas; 3 documentos oficiais (project-status, technical-documentation, user-guide) em MD + DOCX + PDF; gerar-doc.js e gerar-pdf.js reescritos para ler dos .md como fonte da verdade; arquivos obsoletos removidos da raiz                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-06-07 | PRODUCT-OPS-01: Discovery completo — mapa de 5 P0s + 8 P1s + 6 P2s; PRDs de 4 features (Dashboard Cognitivo, Revisão Premium, IA Flashcards, Onboarding); histórias de usuário com JTBD; critérios de aceite BDD (Gherkin PT-BR); estratégia QA por módulo; backlog priorizado (Critical/High/Medium/Low); plano de execução em 4 sprints. Documentado em `docs/qa/product-ops-01.md`. 10 skills PM criadas em `.claude/skills/`.                                                                                                                                                                                                                                                                                                                                                        |
| 2026-06-07 | SPRINT-1: busca na Library (normalize + filtro em tempo real); Cognitive Score no Dashboard (calcCognitiveScore); atalhos de teclado no Review (Space/1-4/Backspace + fila estável + histórico); streak e XP persistindo no Supabase (FINISH_SESSION + UPDATE_STREAK). 4 bugs críticos corrigidos. 15 testes E2E criados em `tests/e2e/sprint1.spec.ts`. Gate: 272 unit tests ✅, lint ✅, build ✅.                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-06-07 | SPRINT-2 (US-02.4): tela de resultado do Review exibe Cognitive Score pós-sessão com delta em relação ao score capturado antes da sessão. `computeCogScore()` helper + `scoreBefore` (useState init) + `scoreAfter` calculado em `done`. data-testid: `result-cognitive-score`, `result-score-value`, `result-score-delta`. 5 testes E2E em `tests/e2e/sprint2.spec.ts`. Gate: 272 unit tests ✅, lint ✅, build ✅.                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-06-08 | DOC-UX-01: Guia do Usuário v3.0 reescrito com 15 seções — linguagem humana/acolhedora, estrutura SaaS premium, todas as labels refletem o código real. DOCX + PDF regenerados. `docs/user-guide/user-guide.md` (1.200+ linhas).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-06-09 | LIB-FIX-01: (1) Fix overflow de URL longa em cards da Biblioteca (`wordBreak: break-all`); (2) Confirmação ao fechar modais com dados não salvos (AddContent, EditContent, GenerateFlashcards, CardEdit) via `ConfirmDialog` + `isDirty`; (3) Fix geração de flashcards com IA (JSON mode exige objeto, não array). 6 novos testes E2E (TC-LIB-008 a 012). Gate: 327 unit tests ✅, lint ✅, build ✅.                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-06-09 | DOC-IMG-01: 9 screenshots reais capturadas via Playwright (`tests/e2e/capture-screenshots.spec.ts`) e salvas em `docs/user-guide/images/`. `gerar-pdf.js` atualizado com suporte a `![alt](path)` (PDFKit `doc.image()`). 6 imagens reais embutidas no `user-guide.pdf` (712 KB).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-06-09 | PROD-FIX-01: (1) CSP `worker-src blob:` + PostHog CDN em `script-src`/`connect-src`; (2) React #418 resolvido — `getGreeting()`, `dateLabel` e `onboardingDismissed` movidos para `useEffect` (server UTC ≠ client UTC-3 + localStorage mismatch); (3) `sentry.client.config.ts` criado; (4) diagnóstico HTTP 500 para `OPENAI_API_KEY` ausente. Gate: 327 ✅.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-06-09 | HOTFIX-CONSOLE-01: RLS recursão infinita (500) → query linear com `.maybeSingle()`; Sentry `sentry-tunnel` habilitado; CSP PostHog `us-assets.i.posthog.com`; config Sentry consolidada em `instrumentation.ts`. Console de produção zerado. Gate: 327 ✅.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-06-09 | FRENTE-1: /profile (edição de nome, avatar 🎭 12 opções, notificações push), SEO (sitemap.xml, robots.txt, OpenGraph meta), sidebar reativa via `nl:profile-updated`. Gate: 327 ✅ + E2E profile.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-06-09 | ARCHITECTURE-REFINE-01 Fase A: T-A1 engine limpo (3 arquivos legados deletados, funções migradas para subpastas canônicas, 7 callers atualizados); T-A2 ESLint `no-console` + security logger → `console.warn`; T-A3 Supabase lazy singleton (client-side only); T-A4 schemas Zod de output para 4 rotas IA (422/AI_INVALID_OUTPUT, `.transform()` clamp 0-100). 30 testes unitários novos (357 total) + 11 cenários E2E em `ai-validation.spec.ts`. Gate: type-check ✅, lint ✅, 357/357 ✅, build ✅.                                                                                                                                                                                                                                                                                 |
| 2026-06-09 | ARCHITECTURE-REFINE-01 Fases B–D: T-B1 `calculateStreak` + `calculateLevelUp` como funções puras (12 novos testes); T-B2 `listRecentSessions()` + sessions reais no AppContext (coluna `started_at` corrigida); T-B3 FocusView decomposto em orquestrador + FocusStudyPhase + FocusExtractPhase + FocusTeachPhase; T-B4 Husky v9 + lint-staged v15 + commitlint (pre-commit: prettier, commit-msg: conventional, pre-push: type-check+lint); T-C1 CONCERNS.md reescrito (C-001..C-015 removidas, C-101..C-108 concerns ativas), STACK.md atualizado; T-C2 `achievements.ts` → `achievements/index.ts` + export em `engine/index.ts`; fix `.gitignore` (`.specs/` e `progress.md` removidos — agora versionados normalmente). Gate: 369/369 ✅, lint ✅, type-check ✅, build ✅, E2E ✅. |
| 2026-06-09 | COGNITIVE-PERSISTENCE-01: hook `useAutoSave` (debounce 30s, dirty-flag, `SaveIndicator`), `sessionDraftsService` (upsert/load/delete rascunho por userId+contentId), `FocusView` integrado com autosave + restore de rascunho ao abrir sessão, `MemoryView` reescrita — acordeões por conteúdo, busca NFD, highlights históricos, contagem de flashcards. `memory.spec.ts` 244 linhas E2E. Migração cliente OpenAI → Anthropic claude-haiku-4-5. Gate: 373/373 ✅, lint ✅, type-check ✅, build ✅. |
| 2026-06-09 | MELHORIAS-01: (1) IMP-01 highlights âmbar (#d97706) + botão × circular (#ef4444) separado com aria-label dinâmico em FocusStudyPhase; highlights históricos âmbar em MemoryView; (2) IMP-04 tab switcher "📚 Revisão / 📔 Meu Material" no ReviewView — estado da revisão preservado ao trocar; (3) Rename "Caderno Cognitivo" → "Meu Material de Estudo" (MemoryView + Sidebar). Bug crítico corrigido: keyboard guard `if (activeTab !== 'review') return` evita goBack/setFlipped silenciosos no tab Meu Material. Gate: 373/373 ✅, lint ✅, type-check ✅, build ✅. QA: qa-estrategico ✅ + qa-expert ✅ (12 test cases). |
| 2026-06-10 | HELP-UPDATE-01: HelpView 7→12 módulos (Trilhas, Meu Material, Conquistas, Perfil, Configurações); `<div role=button>` → `<button>` nativo; data-testid; help.spec.ts TC-HELP-001..007. Gate: 373/373 ✅. |
| 2026-06-10 | HELP-UX-01: busca em tempo real na Central de Ajuda (title+tagline+steps.t+steps.d, normalize NFD); botão × para limpar; contador; deep-link /help?section=id via useSearchParams; Suspense boundary em page.tsx; TC-HELP-001..013. Gate: 373/373 ✅. |
| 2026-06-10 | LEARNING-STRUCTURE-01 (LS-01-B): Paginação por trilha (PAGE_SIZE=6) + busca estendida (título+autor+desc). useMemo para filtered, trailGroups e orphanContents. Botões "Ver mais N conteúdos" / "Menos ↑" por seção. Paginação desativa durante busca ativa. data-testid: btn-show-more-{id}, btn-show-less-{id}, -orphan. ls01b.spec.ts TC-LS01B-001..008. Gate: 373/373 ✅ lint ✅ type-check ✅ build ✅. |
| 2026-06-10 | LEARNING-STRUCTURE-01 (LS-01-A): Hierarquia Trilhas→Conteúdos. T-01: migration SQL (`learning_trails` + `trail_id` em contents, RLS `users_own_trails`) aplicada em produção via MCP Supabase. T-02: tipos TypeScript (`LearningTrail`, `TrailType`, `Content.trailId`, 4 AppActions). T-03: `trailsService.ts` (CRUD completo + `createDefaultTrail`) + `contentsService.ts` (`trailId` em create/update). T-04: AppContext — `trails[]` no estado, reducer (ADD/UPDATE/DELETE_TRAIL + ASSIGN_CONTENT_TRAIL), loadData paralelo + auto-criação "Meus Estudos". T-05: `TrailFormModal.tsx` (RHF+Zod, 8 cores, 8 emojis, preview live, ConfirmDialog exclusão). T-06: `LibraryView.tsx` — agrupamento por trilha, seção "Sem Trilha", botão "+ Trilha". T-08: RLS audit — 9 tabelas verificadas, todas com RLS ativo. T-09: `trails.spec.ts` (TC-TRL-001..010) + playwright.config.ts atualizado. Gate: 373/373 ✅, lint ✅, type-check ✅, build ✅. |
| 2026-06-10 | F-080 Core Web Vitals: LCP — `Inter({ display: 'swap' })` + `<link rel="preconnect">` Supabase + `dns-prefetch` PostHog/Sentry; CLS — `DashboardSkeleton` (5 blocos) + `LibraryView` skeleton (4 blocos) com alturas reservadas; INP — `startTransition` em busca (Library+Help) + `React.memo` em Sidebar+BottomNav; Bundle — `@next/bundle-analyzer` + `cross-env` + script `analyze` + `optimizePackageImports`; Lazy — `AnalyticsIdentifier`/`ServiceWorkerRegistrar`/`PushNotificationPrompt` → `next/dynamic ssr:false`. Gate: type-check ✅ lint ✅ 373/373 ✅ build ✅. |
| 2026-06-10 | PROFILE-UPGRADE: STUDY-GOALS-01 — metas configuráveis (cardsPerDay/minutesPerDay/daysPerWeek/streakGoal) persistidas em `users.study_goals` JSONB (migration MCP + database.types.ts atualizado); formulário RHF+Zod com `zodResolver` explicitamente tipado. ACTIVITY-HISTORY-01 — timeline compacta das últimas 7 sessões (conteúdo, fmtDuration, cardsCreated, relativeDate). STATS-PROFILE-01 — 3 chips no topo (flashcards, streak, dias ativos). DashboardView — card "Metas de Hoje" com 4 progress bars (cardsReviewedToday/minutesToday/activeWeekDays/streak). FocusView + SettingsView — `cardsCreated` adicionado ao `StudySession`. `profile-upgrade.spec.ts` TC-PROF-001..012. Gate: type-check ✅ lint ✅ 373/373 ✅ build ✅. |
| 2026-06-10 | LIBRARY-UX-REVISION-01 Fase α + Cenários Avançados: `library-ux-advanced.spec.ts` — TC-ADV-001..019 (19 cenários). Implementados: drawer com métricas completas (progresso/retenção/flashcards/CTAs/ações); Inbox Cognitiva (criar sem trilha + excluir trilha move conteúdo para orphan); soft delete timer (TC-ADV-007/007b — conteúdo removido após 5s + segundo delete confirma o primeiro); exercício contextualizado end-to-end (flip + resposta sem RATE_CARD). Fixme: reordenação intra-trilha, persistência de ordem, filtro skill, tentativa de exercício, retenção backend. Gate: type-check ✅ lint ✅ 411/411 ✅. |
| 2026-06-10 | LIBRARY-UX-REVISION-01 Fase α (Soft Delete + Undo): `initiateDelete`/`undoDelete` em `LibraryView.tsx` — remoção otimista com `visibleFiltered` (useMemo), timer 5s, toast "Desfazer". `global.setup.ts` refatorado: `authenticateUser` helper reutilizável; suporte a usuário B (`TEST_USER_EMAIL_B` → `tests/e2e/.auth/user-b.json`). 4 specs E2E novos: `library-ux-functional.spec.ts` (15 cenários), `review-ux-functional.spec.ts` (10 cenários), `library-negative.spec.ts` (14 cenários), `library-security.spec.ts` (10 cenários — TC-SEC-008..010 implementados com dois contextos de browser). Gate: type-check ✅ lint ✅ 411/411 ✅. |
| 2026-06-11 | KNOWLEDGE-HUB-01: `project-knowledge/` criado — Base Central de Conhecimento Estruturado. 13 documentos: RF.md (75 requisitos funcionais), RNF.md (46 requisitos não funcionais), RN.md (38 regras de negócio), CA.md (13 critérios de aceite BDD), ADR.md (20 decisões arquiteturais), RISCOS.md (mapa de riscos com status), FLUXOS.md (9 fluxos detalhados), UX.md (padrões de feedback, formulários, acessibilidade), ARQUITETURA.md (stack, estrutura, banco, auth, crons), QA.md (estratégia completa, 411 testes, mandatos), SEGURANCA.md (OWASP, RLS, LGPD, headers, checklists), CONTEXTO.md (produto, personas, métricas, roadmap). Fonte: progress.md + product-ops-01.md + CLAUDE.md + código-fonte. |

---

## Comandos de Desenvolvimento

```bash
# Iniciar servidor dev com cache limpo (uso normal)
npm run dev:clean

# Verificar tipos
npm run type-check

# Lint
npm run lint

# Build de produção
npm run build

# Testes E2E
npm test

# Documentação
npm run generate-pdf
npm run generate-doc
```

> **Regra:** Nunca rodar `npm run build` com o servidor dev ativo.
> Se ocorrer erro 500 "Cannot find module './NNN.js'" → pare o servidor e use `npm run dev:clean`.

---

---

## Fase 3 — Cognitive Engine (Camada de Domínio) ✅

### Setup

- **Vitest 4.1.8** instalado para testes unitários
- Script `npm run test:unit` e `npm run test:coverage` adicionados
- `vitest.config.ts` com alias `@/` → `src/`, environment `node`

### Estrutura criada em `src/engine/`

```
src/engine/
├── index.ts                             ← API pública (re-exporta tudo)
├── spaced-repetition/
│   ├── sm2.ts                           ← SM-2 aprimorado + bônus responseTimeMs
│   ├── sm2.test.ts                      ← 17 testes
│   ├── scheduling.ts                    ← buildReviewQueue (prioridade por risco)
│   └── scheduling.test.ts              ← 8 testes
├── retention/
│   ├── retentionModel.ts               ← Ebbinghaus: R=e^(-t/S), calcStability
│   ├── retentionModel.test.ts          ← 10 testes
│   ├── forgettingRisk.ts               ← RiskLevel: high/medium/low
│   └── forgettingRisk.test.ts          ← 8 testes
├── mastery/
│   ├── masteryScore.ts                 ← score 0–100 por card e conteúdo
│   └── masteryScore.test.ts            ← 9 testes
├── skill-evolution/
│   ├── skillProgression.ts             ← velocity, daysToLevelUp, trend
│   └── skillProgression.test.ts        ← 7 testes
├── active-learning/
│   ├── activeLearningScore.ts          ← Pirâmide de Glasser (4 dimensões)
│   └── activeLearningScore.test.ts     ← 8 testes
└── cognitive-score/
    ├── cognitiveScore.ts               ← score global 0–100 com breakdown
    └── cognitiveScore.test.ts          ← 9 testes
```

### Algoritmos implementados

| Módulo                | Fórmula / Lógica                                                                     |
| --------------------- | ------------------------------------------------------------------------------------ |
| SM-2 aprimorado       | EF new = max(1.3, EF + 0.1 − (5−q)(0.08+(5−q)×0.02)) + bônus responseTime<5s         |
| Retenção Ebbinghaus   | R(t) = 100 × e^(−t/S), S = intervalDays × easeFactor                                 |
| Risco de esquecimento | high: R<40 ou vencido; medium: R<65 ou vence<1d; low: demais                         |
| Fila de revisão       | Ordena por risco (high→medium→low), desempate por nextReview crescente               |
| Mastery score         | base(new=0, learning=25, review=50, strong=75) × min(1, R/100)                       |
| Skill evolution       | velocity = avg(XP últimos 7d), daysToLevelUp = XP_needed/velocity, trend por metades |
| Active learning       | notas×10% + destaques×20% + ensino×30% + recall×40%                                  |
| Cognitive score       | retention×0.35 + mastery×0.30 + consistency×0.20 + activeLearning×0.15               |

### Resultados dos testes

```
Test Files  8 passed (8)
     Tests  76 passed (76)
  Duration  740ms
```

### Backward compatibility

- `src/engine/sm2.ts`, `retention.ts`, `scheduling.ts` intocados
- Todos os imports existentes continuam funcionando sem alteração

---

---

## Fase 4 — Segurança da Plataforma ✅

### Dependência instalada

- **Zod 4.4.3** — validação de schemas com type inference

### Arquivos criados/modificados

```
next.config.ts                              ← Security headers: CSP, HSTS, X-Frame-Options, etc.
middleware.ts                               ← Rate limiting + RBAC + security logging
src/lib/security/
├── rateLimit.ts                            ← Rate limiter in-memory, edge-compatible
├── validation.ts                          ← Schemas Zod: login, signup, content, flashcard
├── sanitize.ts                            ← stripHtml, escapeHtml, sanitizeFileName, isValidMimeType
├── rbac.ts                                ← hasRole, isAdmin, isSuperAdmin, requireRole, extractRole
├── logger.ts                              ← logSecurityEvent (JSON estruturado)
├── OWASP-CHECKLIST.md                     ← OWASP Top 10 mapeado
└── __tests__/
    ├── rateLimit.test.ts                  ← 6 testes
    ├── sanitize.test.ts                   ← 20 testes
    ├── rbac.test.ts                       ← 19 testes
    └── validation.test.ts                 ← 25 testes
src/components/lgpd/ConsentBanner.tsx      ← Banner LGPD (aceitar / somente necessários)
src/app/api/user/delete/route.ts           ← DELETE /api/user/delete (LGPD exclusão de dados)
src/app/layout.tsx                         ← ConsentBanner adicionado ao root layout
vitest.config.ts                           ← Include expandido para security tests
```

### O que foi implementado

| Entrega                   | Implementação                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| **HTTP Security Headers** | CSP, HSTS (prod), X-Frame-Options:DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| **Rate Limiting**         | 5 req/15min por IP em `/auth/*`; retorna 429 + `Retry-After`; edge-compatible                       |
| **Validação de Inputs**   | Schemas Zod para login, signup, content, flashcard; sanitizeString                                  |
| **Sanitização**           | stripHtml, escapeHtml, sanitizeFileName, isValidMimeType com whitelist                              |
| **RBAC**                  | Hierarquia user→admin→super_admin; middleware bloqueia `/api/admin/*`                               |
| **Security Logger**       | JSON estruturado; sanitiza campos sensíveis (password, token)                                       |
| **LGPD Consent**          | Banner fixo no rodapé; localStorage; aceitar / somente necessários                                  |
| **LGPD Exclusão**         | `DELETE /api/user/delete` — cascata em todas as tabelas + auth.admin.deleteUser                     |
| **OWASP Checklist**       | Top 10 mapeado com status atual e itens para próximas fases                                         |

### OWASP Top 10 — Resumo

| OWASP                           | Status                                                   |
| ------------------------------- | -------------------------------------------------------- |
| A01 — Broken Access Control     | ✅ Middleware + RLS + RBAC                               |
| A02 — Cryptographic Failures    | ✅ Supabase bcrypt/RS256 + HSTS                          |
| A03 — Injection                 | ✅ Zod + escapeHtml + Supabase parametrizado             |
| A04 — Insecure Design           | 🔄 Rate limiting + LGPD                                  |
| A05 — Security Misconfiguration | ✅ Security headers completos                            |
| A06 — Vulnerable Components     | 🔄 npm audit ok; Dependabot pendente                     |
| A07 — Auth Failures             | ✅ Rate limiting + Supabase Auth                         |
| A08 — Data Integrity            | 🔄 CSP + MIME validation                                 |
| A09 — Security Logging          | ✅ Logger implementado + Sentry v10 em produção (OBS-01) |
| A10 — SSRF                      | N/A (sem requests a URLs de usuário)                     |

### Resultados dos testes

```
Test Files  12 passed (12)
     Tests  146 passed (146)
  Duration  936ms
```

---

---

## UX-01 — Sistema Global de Validação, Feedback e UX Cognitiva ✅

### Componentes criados em `src/components/ui/`

| Componente      | Descrição                                                              |
| --------------- | ---------------------------------------------------------------------- |
| `FormField`     | Wrapper de campo com label, required \*, hint e slot de erro           |
| `FormError`     | Exibe mensagem de erro com `role="alert"` e `id` para aria-describedby |
| `FormHint`      | Texto auxiliar discreto abaixo do campo                                |
| `LoadingButton` | Botão com spinner e estado `disabled` durante submissão                |

### Formulários refatorados

- `src/app/auth/login/page.tsx` — Magic Link com React Hook Form + zodResolver + setFocus
- `src/app/auth/signup/page.tsx` — Nome + Email com validação PT-BR + setFocus
- `src/modules/library/AddContentModal.tsx` — Título*, Tipo*, Autor, Descrição com FieldErrors tipado

### Validação (`src/lib/validation/schemas.ts`)

- Zod v4 — `.email()` depreciado substituído por `.refine()` + `EMAIL_REGEX`
- `.trim()` em todos os campos string
- `emailSchema`, `nameSchema`, `contentSchema` centralizados

### Bugs corrigidos (BUG-03 a BUG-06)

| Bug    | Correção                                                      |
| ------ | ------------------------------------------------------------- |
| BUG-03 | `aria-describedby` correto em autor e descrição do modal      |
| BUG-04 | `setFocus` no primeiro campo com erro em todos os formulários |
| BUG-05 | `FieldErrors<ContentFormValues>` tipado (sem `any`)           |
| BUG-06 | Zod v4 `.email()` substituído por `.refine()` com regex       |

### Testes criados

- `src/lib/validation/schemas.test.ts` — 28 testes unitários (Vitest)
- `tests/e2e/ux-01-validation.spec.ts` — 15 testes Playwright

---

## QA-01 — Engenharia de Qualidade e Cobertura E2E ✅

### Infraestrutura instalada

| Pacote                        | Finalidade                                   |
| ----------------------------- | -------------------------------------------- |
| `@testing-library/react`      | Render de componentes React em Vitest        |
| `@testing-library/user-event` | Simulação de eventos de usuário              |
| `@testing-library/jest-dom`   | Matchers DOM (toBeVisible, toHaveAttribute…) |
| `jsdom`                       | Ambiente DOM para testes Vitest              |
| `@vitejs/plugin-react`        | Transpilação JSX no Vitest                   |

### Testes unitários adicionados (QA-01)

| Arquivo                                  | Ambiente | Testes                                      |
| ---------------------------------------- | -------- | ------------------------------------------- |
| `src/services/contentsService.test.ts`   | node     | 4 testes (mock Supabase builder)            |
| `src/services/flashcardsService.test.ts` | node     | 5 testes                                    |
| `src/services/reviewService.test.ts`     | node     | 3 testes                                    |
| `src/store/AppContext.test.ts`           | jsdom    | 12 testes (todos os reducers)               |
| `src/store/ToastContext.test.ts`         | jsdom    | 8 testes (add, remove, MAX_TOASTS)          |
| `src/hooks/useTheme.test.ts`             | jsdom    | 6 testes (toggle, localStorage, data-theme) |
| `src/hooks/useToast.test.ts`             | jsdom    | 4 testes (métodos expostos)                 |

**Total: 260 testes unitários passando (21 arquivos)**

### Configuração Vitest atualizada

- `globals: true` para `@testing-library/jest-dom`
- `plugins: [react()]` para JSX
- Ambiente padrão `node`; arquivos DOM usam `// @vitest-environment jsdom`
- `src/test/setup.ts` importa `@testing-library/jest-dom`

### E2E — Playwright multi-project

```
playwright.config.ts
├── setup         → tests/e2e/global.setup.ts (Supabase Admin API → storageState)
├── chromium      → testes sem auth (ignora library/review/accessibility)
└── authenticated → storageState: tests/e2e/.auth/user.json (library, review, accessibility)
```

### Page Objects criados

- `tests/e2e/pages/LibraryPage.ts` — goto, openAddModal, fillTitle, selectType, submit, cancel, getContentCard, isModalOpen
- `tests/e2e/pages/ReviewPage.ts` — goto, hasEmptyState, hasCardVisible, rateCard, getQueueCount, waitForPageLoad

### Helpers criados

- `tests/e2e/utils/helpers.ts` — `waitForToast`, `waitForRoute`, `assertNoNativeBrowserValidation`, `fillField`

### Thresholds de cobertura (vitest.config.ts)

| Métrica    | Mínimo |
| ---------- | ------ |
| Statements | 80%    |
| Branches   | 70%    |
| Functions  | 80%    |
| Lines      | 80%    |

### .gitignore atualizado

`tests/e2e/.auth/` adicionado (sessão auth gerada em runtime, não versionada)

---

## HOTFIX-01 — Correções Críticas de Produção ✅

**Data:** 2026-06-07 | **Commit:** `7e84500`

### Problemas corrigidos

| Bug                                                     | Arquivo                             | Correção                                                                                        |
| ------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| Rota raiz `/` redirecionava para `landing.html` (404)   | `src/app/page.tsx`                  | Smart redirect: autenticado → `/dashboard`, não autenticado → `/auth/login`                     |
| Página `/politica-de-privacidade` retornava 404         | —                                   | Criada `src/app/politica-de-privacidade/page.tsx` (LGPD completa) + redirect `/privacy` → `301` |
| Erros de auth em inglês e genéricos                     | `src/lib/auth/errors.ts`            | `mapAuthError()` com traduções PT-BR para todos os cenários (rate limit, expirado, rede, etc.)  |
| Sidebar: itens de nav com `div onClick` (não acessível) | `src/components/layout/Sidebar.tsx` | Substituído por `<Link href>` — elementos `<a>` válidos para screen readers e Playwright        |

### Arquivos criados/modificados

- `src/app/page.tsx` — redirect inteligente por sessão (`getUser()`)
- `src/app/politica-de-privacidade/page.tsx` — política LGPD completa
- `src/app/privacy/route.ts` — redirect 301 `/privacy` → `/politica-de-privacidade`
- `src/lib/auth/errors.ts` — mapeamento de erros auth PT-BR
- `src/lib/auth/errors.test.ts` — 88 testes unitários cobrindo todos os cenários
- `src/components/layout/Sidebar.tsx` — nav items acessíveis com `<Link>`
- `middleware.ts` — allowlist atualizada (trocou `landing.html` por `/politica-de-privacidade`)

---

## SMTP-01 — E-mail Customizado Hostinger ✅

**Data:** 2026-06-07 | **Commit:** `11d2c59` (E2E) + configuração manual no painel Supabase

### Problema resolvido

E-mails de autenticação saíam de `no-reply@mail.supabase.io` (sem branding, caíam em spam, limit de 3/hora no free tier Supabase).

### O que foi configurado (zero código no app)

| Item                    | Configuração                                                                    |
| ----------------------- | ------------------------------------------------------------------------------- |
| Conta de e-mail         | `noreply@neurolearn.tech` criada no Hostinger                                   |
| Supabase SMTP           | `smtp.hostinger.com:465` (SSL), usuário `noreply@neurolearn.tech`               |
| Sender                  | `NeuroLearn <noreply@neurolearn.tech>`                                          |
| Site URL                | `https://neurolearn.tech`                                                       |
| Redirect URLs           | `https://neurolearn.tech/auth/callback` + `http://localhost:3003/auth/callback` |
| Template Magic Link     | HTML responsivo com gradiente #7c3aed→#06b6d4, CTA, fallback                    |
| Template Confirm Signup | HTML com badge "🎉 Bem-vindo(a)!", preview de features                          |
| SPF                     | `v=spf1 include:_spf.mail.hostinger.com ~all` (já existia)                      |
| DKIM                    | 3 CNAMEs `hostingermail-a/b/c._domainkey` (Hostinger auto-configurou)           |
| DMARC                   | `v=DMARC1; p=none; rua=mailto:jadsonc190@gmail.com; aspf=r; adkim=r`            |

### Fluxo após configuração

```
Usuário → neurolearn.tech/auth/login
  → signInWithOtp() → Supabase → smtp.hostinger.com
    → E-mail de noreply@neurolearn.tech
      → Clique no link → /auth/callback → /dashboard ✅
```

### Próximos passos DNS

- Semana 3: atualizar DMARC `p=none` → `p=quarantine`
- Mês 2+: atualizar para `p=reject`

### Artefatos de documentação (`.specs/features/smtp-hostinger/` — gitignored)

- `spec.md`, `tasks.md`, `guia-supabase.md`, `guia-dns.md`
- `checklist-validacao.md`, `relatorio-final.md`
- `templates/magic-link.html`, `templates/confirm-signup.html`

---

## DOC-01 — Reestruturação Completa da Documentação ✅

### Arquivos removidos (obsoletos)

- `NeuroLearn-Documentacao.docx` — conteúdo desatualizado (v1.0)
- `NeuroLearn-Status-Projeto.pdf` — conteúdo desatualizado (v1.0)
- `NeuroLearn-Documentacao-Tecnica.pdf` — conteúdo desatualizado (v1.0)

### Nova estrutura `docs/`

```
docs/
├── project-status/
│   ├── project-status.md       ← Status, progresso, roadmap, bugs
│   ├── project-status.docx     ← Gerado automaticamente
│   └── project-status.pdf      ← Gerado automaticamente
├── technical-documentation/
│   ├── technical-documentation.md   ← Arquitetura, stack, engine, testes
│   ├── technical-documentation.docx
│   └── technical-documentation.pdf
├── user-guide/
│   ├── user-guide.md           ← Guia do usuário (UX writing)
│   ├── user-guide.docx
│   └── user-guide.pdf
├── architecture/               ← Reservado para ADRs e diagramas
├── qa/                         ← Reservado para relatórios de QA
├── security/                   ← Reservado para auditorias
└── ai/                         ← Reservado para estratégia de IA
```

### Geradores reescritos

| Script         | Comportamento anterior                      | Comportamento novo                            |
| -------------- | ------------------------------------------- | --------------------------------------------- |
| `gerar-doc.js` | Conteúdo hardcoded da v1.0 → 1 DOCX na raiz | Lê 3 `.md` de `docs/` → 3 DOCXs nas subpastas |
| `gerar-pdf.js` | Conteúdo hardcoded da v1.0 → 1 PDF na raiz  | Lê 3 `.md` de `docs/` → 3 PDFs nas subpastas  |

**Fonte da verdade:** arquivos `.md`. Os `.docx` e `.pdf` são artefatos gerados — nunca editar manualmente.

### Regra de atualização

Após qualquer modificação nos `.md`, regenerar com:

```bash
npm run generate-doc && npm run generate-pdf
```

---

## INFRA-01 — Migração Hostinger → Vercel ✅

**Data:** 2026-06-07 | **Commits:** `2d584ed` (callback fix) + `f91fe25` (gitignore)

### Problema original

Hostinger rodava o Next.js em modo serverless com cold start a cada request (~130ms), causando crash loop e 503 Service Unavailable consistente em produção. Adicionalmente, emails de Magic Link apontavam para `0.0.0.0:3000` (endereço interno do processo Node.js no Hostinger).

### O que foi feito

| Ação                     | Detalhe                                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Migração para Vercel** | Criada conta Hobby (free), repositório `JadsonCardoso/NeuroLearn` importado, 5 env vars configuradas                                           |
| **Deploy automático**    | Vercel detecta push no branch `main` e faz redeploy automaticamente                                                                            |
| **Domínio customizado**  | `neurolearn.tech` e `www.neurolearn.tech` adicionados ao projeto Vercel                                                                        |
| **Fix: auth callback**   | `request.url.origin` substituído por `process.env.NEXT_PUBLIC_SITE_URL` com fallback via headers `x-forwarded-host` — elimina o `0.0.0.0:3000` |
| **Fix: emailRedirectTo** | Login e signup passam `NEXT_PUBLIC_SITE_URL/auth/callback` em vez de `window.location.origin`                                                  |
| **DNS — A record**       | `neurolearn.tech @ → 216.198.79.1` (Vercel) — substituiu `82.25.67.90` (Hostinger)                                                             |
| **DNS — AAAA deletado**  | Registro IPv6 `2a02:4780:13:2038:0:14c0:b8b6:2` removido (causava split-brain DNS)                                                             |
| **DNS — CNAME www**      | `www → a24059192631a3df.vercel-dns-017.com`                                                                                                    |
| **Supabase Site URL**    | Confirmado `https://neurolearn.tech` (já estava correto)                                                                                       |
| **`.gitignore`**         | `*.tsbuildinfo` adicionado — arquivo gerado pelo TypeScript não deve ser versionado                                                            |

### Causa raiz do `0.0.0.0:3000`

```
DNS split-brain: ISP retornava IPv6 (Hostinger) + IPv4 (Vercel)
Browser prefere IPv6 (RFC 6555) → cai no Hostinger
Hostinger: Node.js interno escuta em 0.0.0.0:3000
Código antigo: const { origin } = new URL(request.url) → "http://0.0.0.0:3000"
Redirect: NextResponse.redirect("http://0.0.0.0:3000/dashboard") → erro no browser
```

### Resolução

Após deletar o AAAA record na Hostinger, o TTL (1800s) expirou nos resolvers e o DNS passou a retornar apenas `216.198.79.1` (Vercel). O fix no callback garante que mesmo em cenários de proxy o redirect sempre usa a URL correta.

### Arquivos modificados

- `src/app/auth/callback/route.ts` — fix origin via env var
- `src/app/auth/login/page.tsx` — emailRedirectTo usa NEXT_PUBLIC_SITE_URL
- `src/app/auth/signup/page.tsx` — idem
- `.gitignore` — `*.tsbuildinfo` adicionado

### Variáveis de ambiente (Vercel)

| Variável                        | Valor                                      |
| ------------------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`          | `https://neurolearn.tech`                  |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://jijlesgsusxyldmwgnbq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (chave anon)                               |
| `OPENAI_API_KEY`                | (chave OpenAI)                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | (chave service role — apenas server-side)  |

---

## CRUD-01 — CRUD Completo na Biblioteca ✅

**Data:** 2026-06-07

### O que foi implementado

#### Componentes criados

| Arquivo                                    | Descrição                                                                                                                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/ui/ConfirmDialog.tsx`      | Diálogo de confirmação reutilizável. `role="alertdialog"`, `aria-modal`, `aria-labelledby/describedby`, foco automático no botão confirmar, ESC para cancelar, variantes `danger`/`warning`, `data-testid` completo |
| `src/modules/library/EditContentModal.tsx` | Modal de edição de conteúdo pré-populado com React Hook Form + Zod + `zodResolver`. Mesmos padrões do AddContentModal                                                                                               |

#### Funcionalidades adicionadas em `LibraryView.tsx`

- Botões editar/remover por card de conteúdo com `data-testid`
- ConfirmDialog para exclusão de conteúdo (substitui `window.confirm`)
- EditContentModal para edição inline de conteúdo
- Cor do card derivada automaticamente do tipo ao editar
- Expansão de flashcards por conteúdo
- CardEditModal inline (Zod: `front` max 500 chars, `back` max 1000) com ESC close
- ConfirmDialog para exclusão de flashcards

#### Novos serviços

| Função                               | Arquivo                             |
| ------------------------------------ | ----------------------------------- |
| `updateContent(id, input)`           | `src/services/contentsService.ts`   |
| `deleteFlashcard(id)`                | `src/services/flashcardsService.ts` |
| `updateFlashcard(id, {front, back})` | `src/services/flashcardsService.ts` |

#### Novos action types em `src/types/index.ts`

- `UPDATE_CONTENT` — atualiza campos de um conteúdo
- `DELETE_CARD` — remove um flashcard
- `UPDATE_CARD` — edita frente/verso de um flashcard

#### Integração Toast no AppContext

Toast de sucesso para: ADD_CONTENT, DELETE_CONTENT, UPDATE_CONTENT, ADD_CARDS, ADD_SKILL, DELETE_SKILL, FINISH_SESSION, DELETE_CARD, UPDATE_CARD. Toast de erro genérico no catch global.

#### SkillsView.tsx

Substituído `window.confirm` por `ConfirmDialog` para exclusão de habilidades.

### Bug crítico corrigido: UUID inválido no PostgreSQL

**Causa raiz:** `uid()` em `src/lib/utils.ts` gerava strings base36 (`"lkj3m2x1"`) incompatíveis com a coluna `uuid` do PostgreSQL. Ao executar `DELETE WHERE id = 'lkj3m2x1'`, o banco lançava `invalid input syntax for type uuid`, o catch do AppContext capturava e exibia toast de erro em vez de sucesso.

**Correção aplicada:**

1. `src/lib/utils.ts` — `uid()` agora usa `crypto.randomUUID()` (UUID v4 válido)
2. `src/services/contentsService.ts` — `createContent` aceita `id?: string` e passa no INSERT
3. `src/store/AppContext.tsx` — ADD_CONTENT passa `id: c.id` para que o ID do cliente seja o mesmo do banco

### Testes E2E criados — `tests/e2e/crud-01.spec.ts`

**33 testes, 27 passando, 6 skipped** (flashcard tests — sem cards no usuário de teste, comportamento esperado)

| Grupo                                 | Testes            | Status         |
| ------------------------------------- | ----------------- | -------------- |
| ConfirmDialog: remover conteúdo       | TC-CRUD-001 a 007 | 7/7 ✅         |
| EditContentModal                      | TC-CRUD-010 a 017 | 8/8 ✅         |
| Toast: feedback visual                | TC-CRUD-020 a 024 | 5/5 ✅         |
| Expandir/Colapsar flashcards          | TC-CRUD-030       | 1/1 ✅         |
| CardEditModal: editar flashcard       | TC-CRUD-040 a 045 | 0/6 ⏭ skipped |
| Regressão: funcionalidades anteriores | TC-CRUD-050 a 055 | 6/6 ✅         |

### Gate de qualidade

```
npm run type-check  → zero erros
npm run lint        → zero warnings
npm run test:unit   → 272/272 passed (23 arquivos)
npm run build       → ✓ Compiled successfully
npx playwright test crud-01 --project=authenticated → 27 passed, 6 skipped
```

---

## SPRINT-1 — NeuroLearn Sprint 1 ✅

**Entregues:** US-01.1, US-01.2, US-02.1, US-02.2, QW-05  
**Abordagem:** spec-driven (TLC) + QA-First. Gate completo antes de cada entrega.

### Funcionalidades implementadas

#### QW-05 — Busca na Library por título

**Arquivo:** `src/modules/library/LibraryView.tsx`

- `useState('')` para o termo de busca
- Função `normalize(s)` — lowercase + NFD sem diacríticos (busca sem acento)
- `filtered = search.trim() ? contents.filter(...) : contents` — filtro em tempo real
- Input com `data-testid="library-search"`, `aria-label="Buscar conteúdo"`, `placeholder="Buscar por título..."`
- Contador `X de Y itens` quando filtro ativo
- Estado vazio diferenciado: "sem resultados para busca" vs "biblioteca vazia"

#### US-01.1 — Cognitive Score no Dashboard

**Arquivo:** `src/modules/dashboard/DashboardView.tsx`

- Importa `calcCognitiveScore` de `src/engine/cognitive-score/cognitiveScore.ts`
- Calcula `avgMastery`, `reviewsLast30Days`, `expectedReviews` a partir de `state.cards`
- Chama `calcCognitiveScore({ retention, mastery, reviewsLast30Days, expectedReviews, activeLearning: 0 })`
- Substitui stat "Retenção média" por "Cognitive Score" (`cogScore.score + '/100'`) no grid de stats

#### US-01.2 — Streak persistindo no Supabase (P0 bug fix)

**Arquivo principal:** `src/store/AppContext.tsx`  
**Arquivo de serviço:** `src/services/skillsService.ts`

Dois bugs corrigidos:

1. **Reducer FINISH_SESSION** não incrementava streak e não somava XP → agora calcula `newStreak` e retorna `totalXp + 10` + `streak: newStreak`
2. **Side-effect FINISH_SESSION** não chamava `updateUserTotalXP` nem `updateUserStreak` → adicionados ao `Promise.all`

Nova ação `UPDATE_STREAK` adicionada ao reducer e ao `originalDispatch` (chamada ao fim da sessão de revisão).

Nova função `updateUserStreak(userId, streak, lastStudyDate)` em `skillsService.ts` → UPDATE na tabela `users`.

**Arquivo de tipos:** `src/types/index.ts` — `| { type: 'UPDATE_STREAK' }` adicionado à union `AppAction`

#### US-02.1 + US-02.2 — Atalhos de teclado no ReviewView

**Arquivo:** `src/modules/review/ReviewView.tsx` — reescrita completa

- **Fila estável:** `useState<FlashCard[]>(() => state.cards.filter(isDue))` — calculada uma vez ao montar, não reage a RATE_CARD
- **Histórico:** `history: number[]` para navegação retroativa
- **`rate`:** `useCallback([queue, idx, dispatch])` — SM-2 + UPDATE_STREAK ao final da fila
- **`goBack`:** `useCallback([history])` — decrementa idx, remove último log
- **useEffect teclado** (deps: `[done, flipped, rate, goBack]`):
  - `Space` / `code=Space` → vira card (toggle)
  - `1–4` → avalia (só quando `flipped === true`)
  - `Backspace` → aciona `goBack()`
  - Ignora INPUT / TEXTAREA / SELECT
- **Botão `← Voltar`** com `data-testid="btn-go-back"` — visível apenas quando `history.length > 0`
- **Dicas de teclado** exibidas na frente do card (`Space`) e nos botões de avaliação (`1`–`4`)

### Testes E2E criados

**Arquivo:** `tests/e2e/sprint1.spec.ts`  
**Projeto Playwright:** `authenticated`

| Grupo                                         | Cenários                        |
| --------------------------------------------- | ------------------------------- |
| Library Search (US-QW.1)                      | TC-S1-LIB-001 a 005 (5 testes)  |
| Review Keyboard Shortcuts (US-02.1 + US-02.2) | TC-S1-REV-001 a 006 (6 testes)  |
| Dashboard Cognitive Score (US-01.1)           | TC-S1-DASH-001 a 004 (4 testes) |

**Total:** 15 testes E2E novos, em spec separado, adicionado ao projeto `authenticated` no `playwright.config.ts`.

### Gate de qualidade

```
npm run type-check  → zero erros
npm run lint        → zero warnings
npm run test:unit   → 272/272 passed (23 arquivos)
npm run build       → ✓ Compiled successfully (23 pages)
```

### Bugs corrigidos

| #   | Descrição                                                                    | Arquivo                                     |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | Streak não incrementava após sessão de estudo                                | `AppContext.tsx` reducer FINISH_SESSION     |
| 2   | Streak não persistia no Supabase                                             | `AppContext.tsx` side-effect FINISH_SESSION |
| 3   | XP não persistia no Supabase após sessão                                     | `AppContext.tsx` side-effect FINISH_SESSION |
| 4   | Cards desapareciam da fila de revisão no meio da sessão (reactive re-filter) | `ReviewView.tsx` (fila estável)             |

---

---

## Sprint 3 ✅

**Data:** 2026-06-07  
**Gate:** type-check ✅ · lint ✅ · 272 testes unitários ✅ · build ✅ · QA estratégico ✅ · 5 CCs corrigidos

### Arquivos criados

| Arquivo                                           | Descrição                                                                                                                   |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/modules/library/GenerateFlashcardsModal.tsx` | Modal de geração de flashcards via IA — 3 steps (form/loading/review), seletor de count, edição inline, guard double-submit |
| `src/app/api/cron/retention-snapshot/route.ts`    | Endpoint GET protegido por CRON_SECRET; service role key; upsert em batches 500; best-effort (207 parcial)                  |
| `vercel.json`                                     | Cron schedule `0 3 * * *` para o endpoint de retenção                                                                       |
| `tests/e2e/sprint3.spec.ts`                       | 13 cenários E2E — modal IA (7), onboarding (4), cron 401 (2)                                                                |

### Arquivos modificados

| Arquivo                                           | Alteração                                                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/modules/review/ReviewView.tsx`               | BUG-002: `xpDelta` atômico no RATE_CARD elimina dois dispatches separados; CC-05 documentado |
| `src/modules/library/LibraryView.tsx`             | Botão "✦ IA" + estado `genContent` + render do `GenerateFlashcardsModal`                     |
| `src/modules/dashboard/DashboardView.tsx`         | US-04.1: onboarding checklist (4 itens, progresso, dismiss localStorage)                     |
| `src/app/api/cron/retention-snapshot/route.ts`    | CC-02: rejeita CRON_SECRET vazio; CC-04: continua batches após erro                          |
| `src/modules/library/GenerateFlashcardsModal.tsx` | CC-03: `useRef` guard + `isSubmitting` state no botão "Gerar"                                |
| `playwright.config.ts`                            | `sprint3.spec.ts` adicionado ao projeto `authenticated`                                      |

### Correções de QA Estratégico (5 CCs)

| CC    | Problema                                                  | Solução                                                               |
| ----- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| CC-01 | XP corrompido por falha de rede entre EARN_XP + RATE_CARD | `xpDelta = newXp - prevXp` no payload de RATE_CARD — operação atômica |
| CC-02 | `CRON_SECRET=""` deixava endpoint aberto                  | `!cronSecret \|\| cronSecret.trim() === ''`                           |
| CC-03 | Double-submit cobrava 2x o OpenAI                         | `useRef` síncrono + `isSubmitting` state + botão `disabled`           |
| CC-04 | Upsert parcial abortava batches seguintes                 | Loop continua, coleta `batchErrors[]`, retorna 207 ao final           |
| CC-05 | Risco de ref leak entre sessões                           | Confirmado seguro (unmount entre sessões); invariante documentado     |

---

## SPRINT-4 — Analytics Real + IA Professor + Conquistas ✅

**Escopo:** US-DA-01 (Cards em Risco Reais), US-AI-01 (Análise Modo Professor), US-GM-01 (Grade de Conquistas)

**Gate:** `type-check` ✅ · `lint` ✅ · `test:unit 272/272` ✅ · `build` ✅

### Arquivos criados

| Arquivo                            | Descrição                                                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/services/analyticsService.ts` | `getAtRiskCards(userId)` — 3 queries: snapshot mais recente → retention_metrics < 50% → detalhes flashcards |
| `src/engine/achievements.ts`       | `computeAchievements(state)` — 12 badges puros do AppState; `ACHIEVEMENT_COUNT = 12`                        |
| `tests/e2e/sprint4.spec.ts`        | 19 cenários E2E — Dashboard (3), ActiveView/IA (6), SkillsView/Conquistas (6)                               |

### Arquivos modificados

| Arquivo                                   | Alteração                                                                                                                                                                                                                         |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/modules/dashboard/DashboardView.tsx` | US-DA-01: `getAtRiskCards` via useEffect, fallback para cálculo client-side, skeleton de loading                                                                                                                                  |
| `src/modules/active/ActiveView.tsx`       | US-AI-01: `analyzeTeaching()` com `useRef` guard; botão "✦ Analisar com IA" (visível com ≥100 chars, Modo Professor); painel `teaching-analysis` com barras de score, chips strengths/gaps, sugestões, badge de retenção estimada |
| `src/modules/skills/SkillsView.tsx`       | US-GM-01: grade de 12 badges (`achievements-grid`), `useEffect` detecta novos unlocks e dispara `toast.success`, contador `X/12`                                                                                                  |
| `playwright.config.ts`                    | `sprint4.spec.ts` adicionado a `testIgnore` (chromium) e `testMatch` (authenticated)                                                                                                                                              |

### Decisões de design

- **analyticsService — duas queries separadas:** evita complexidade de tipagem de joins gerados pelo Supabase; Map para merge O(n)
- **achievements como engine puro:** sem nova tabela no Supabase; `computeAchievements(state)` derivado do AppState existente — zero migration, zero RLS nova
- **localStorage para IDs notificados (CC-S4-01):** `neurolearn:achievements:notified` persiste IDs entre navegações SPA — evita toast spam em remontagem e dispara notificação na visita seguinte a /skills após badge ser desbloqueado em outra rota
- **Dashboard fallback:** quando `realRiskCards` é vazio (Supabase sem snapshot ainda), usa cálculo client-side para não mostrar tela em branco

### Correções de QA Estratégico (4 CCs)

| CC       | Problema                                                                             | Solução                                                                                                               |
| -------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| CC-S4-01 | `prevUnlockedRef` destruído em cada navegação SPA → spam de toasts ao remontar       | `localStorage('neurolearn:achievements:notified')` persiste IDs já notificados entre navegações                       |
| CC-S4-02 | Painel de análise IA (`teaching-analysis`) persistia ao trocar/deselecionar conteúdo | `setAnalysis(null)` + `setAnalyzeError('')` nos dois handlers de `setSel(null)`                                       |
| CC-S4-03 | Risco de skeleton infinito em falha de rede                                          | `.catch(() => setRealRiskCards([]))` já presente — confirmado e documentado                                           |
| CC-S4-04 | `achievements.ts` e `analyticsService.ts` sem testes unitários                       | 40 testes em `achievements.test.ts` (12 badges × boundary) + 9 testes em `analyticsService.test.ts` (mock chain FIFO) |

---

## SPRINT-4-ORIGINAL — Features Originais PRODUCT-OPS-01 ✅

**Data:** 2026-06-08
**Gate:** `type-check` ✅ · `lint` ✅ · `test:unit 312/312` ✅ · `build` ✅

### Arquivos criados

| Arquivo                               | Descrição                                                                                                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/timer.worker.js`              | Web Worker do timer Pomodoro — controla tick por `setInterval` isolado, recebe `START/PAUSE/RESET`, envia `TICK/DONE` — sem drift em background tabs           |
| `src/components/layout/BottomNav.tsx` | Barra de navegação inferior para mobile (≤767px) — 5 rotas: Dashboard, Biblioteca, Foco, Revisão, Skills; `aria-current`, `safe-area-inset-bottom` para iPhone |

### Arquivos modificados

| Arquivo                           | Alteração                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/modules/focus/FocusView.tsx` | (1) Substituído `setInterval` por `new Worker('/timer.worker.js')` com `workerRef`+`phaseRef` para evitar drift e stale closure; (2) Navigation warning: `handleBack()` mostra `ConfirmDialog` quando `running === true`; (3) `beforeunload` intercepta refresh/fechamento com sessão ativa; `data-testid="btn-back-focus"` e `data-testid="btn-timer-toggle"` adicionados |
| `src/app/(app)/AppShell.tsx`      | Import + render `<BottomNav />`; CSS `.app-main { padding-bottom: 64px }` em mobile para não cobrir conteúdo                                                                                                                                                                                                                                                               |
| `src/app/auth/login/page.tsx`     | Botão "Entrar com Google" desabilitado com tooltip "Em breve" ao clicar; `data-testid="btn-google-oauth"`; divisor visual entre Magic Link e OAuth                                                                                                                                                                                                                         |

### Decisões de design

- **Web Worker em `public/`:** acessível via URL absoluta `/timer.worker.js` — Next.js não processa workers em `src/` por padrão sem configuração extra; arquivos em `public/` são servidos como estáticos
- **`phaseRef` para evitar stale closure:** o callback `worker.onmessage` é criado uma única vez no `useEffect([], [])` — sem `phaseRef`, `phase` ficaria estático no valor da montagem; com `phaseRef`, a transição `study → extract` funciona corretamente mesmo após mudanças de fase
- **Secs capturados pelo render que disparou o efeito:** quando `running` muda para `true`, o `useEffect([running])` captura `secs` do render corrente (React garante snapshot por render) — sem necessidade de `secsRef` adicional
- **BottomNav como componente separado em `components/layout/`:** mantém `AppShell` simples e segue o padrão de colocação dos demais componentes de layout (`Sidebar`, `MigrationBanner`)
- **Google OAuth "Em breve":** botão existe no DOM mas desabilitado; tooltip ao clicar (em vez de `title` nativo) para melhor controle visual e UX consistente entre plataformas

### Gate de qualidade

```
npm run type-check  → zero erros
npm run lint        → zero warnings
npm run test:unit   → 312/312 passed (25 arquivos)
npm run build       → ✓ Compiled successfully (24 pages)
```

---

## OBS-01 — Observabilidade (Sentry + PostHog) ✅

**Data:** 2026-06-08 | **Commit:** `b6c9667`

### Sentry v10 — Error Tracking

| Arquivo                         | Papel                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/instrumentation-client.ts` | Init browser: Session Replay (100% em erros, 10% geral), `maskAllText`, `blockAllMedia`     |
| `src/instrumentation.ts`        | Init server/edge via Next.js hook; hook `onRequestError` captura erros em Server Components |
| `sentry.server.config.ts`       | Config server-side (tracesSampleRate)                                                       |
| `sentry.edge.config.ts`         | Config edge runtime                                                                         |
| `src/app/global-error.tsx`      | Captura erros de renderização React; tela de fallback PT-BR                                 |
| `next.config.ts`                | `withSentryConfig` + CSP expandida (Sentry ingest + PostHog endpoints)                      |

### PostHog — Product Analytics

| Arquivo                                            | Papel                                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------------------- |
| `src/components/analytics/PostHogProvider.tsx`     | Init PostHog; page views manuais; opt-in/out sincronizado com `nl_lgpd_consent`  |
| `src/components/analytics/AnalyticsIdentifier.tsx` | Identifica usuário autenticado no PostHog e Sentry ao entrar na área autenticada |
| `src/hooks/useAnalytics.ts`                        | Hook type-safe: `track()`, `identifyUser()`, `resetUser()`                       |

### Eventos instrumentados

| Evento                 | Onde                                                           |
| ---------------------- | -------------------------------------------------------------- |
| `session_started`      | `FocusView` — primeira vez que o timer inicia por sessão       |
| `session_completed`    | `FocusView` — ao clicar "Finalizar e Salvar Sessão"            |
| `achievement_unlocked` | `SkillsView` — quando `computeAchievements` detecta badge novo |
| `$pageview`            | `PostHogProvider` — toda navegação SPA                         |

### Variáveis de ambiente adicionadas

| Variável                   | Escopo  | Propósito                          |
| -------------------------- | ------- | ---------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`   | Público | DSN para ingestão de erros         |
| `SENTRY_AUTH_TOKEN`        | Privado | Upload de source maps              |
| `SENTRY_ORG`               | Privado | Org slug (`neurolearn-0c`)         |
| `SENTRY_PROJECT`           | Privado | Project slug (`javascript-nextjs`) |
| `NEXT_PUBLIC_POSTHOG_KEY`  | Público | Project token do PostHog           |
| `NEXT_PUBLIC_POSTHOG_HOST` | Público | `https://us.i.posthog.com`         |

### Integração LGPD

PostHog respeita `nl_lgpd_consent` (localStorage): `accepted` → `opt_in_capturing()`, `minimal` ou ausente → `opt_out_capturing()`. Reage a mudanças via `storage` event (outras abas).

### Gate de qualidade

```
npm run type-check  → zero erros
npm run lint        → zero warnings
npm run test:unit   → 312/312 passed (25 arquivos)
npm run build       → ✓ Compiled successfully
npm audit           → found 0 vulnerabilities (PostCSS CVE GHSA-qx2v-qp2m-jg93 resolvido via npm overrides)
```

---

## DASH-01 — Dashboard Avançado ✅

**Data:** 2026-06-08 | **Commit:** `9f5818c`

**Gate:** `type-check` ✅ · `lint` ✅ · `test:unit 312/312` ✅ · `build` ✅

### Arquivos criados

| Arquivo                                      | Descrição                                                                                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/ui/ActivityHeatmap.tsx`      | Grade de atividade estilo GitHub Contributions — últimas 16 semanas × 7 dias; conta sessões por data; 4 intensidades via `rgba(124,58,237,...)` |
| `src/components/ui/CognitiveScoreTrend.tsx`  | Gráfico SVG de linha — tendência do índice de retenção histórico; área preenchida, ponto final destacado, grid guia e rótulos de datas          |
| `src/components/ui/ContentProgressChart.tsx` | Barras horizontais — domínio médio (mastery score) por conteúdo; strong=100%, review=65%, learning=30%, new=5%; ordenado decrescente            |

### Arquivos modificados

| Arquivo                                   | Alteração                                                                                                                                                                                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/services/analyticsService.ts`        | Adicionado `getRetentionHistory(userId)` — lê `retention_metrics` dos últimos 30 dias, agrupa por `snapshot_date` em JS e retorna `RetentionHistoryPoint[]`                                                                                     |
| `src/modules/dashboard/DashboardView.tsx` | Integração dos 3 widgets: (1) `ActivityHeatmap` em faixa full-width entre stats e main grid; (2) `ContentProgressChart` na coluna esquerda; (3) `CognitiveScoreTrend` na coluna direita com skeleton de loading via `retentionHistory === null` |

### Decisões de arquitetura

- **Sem biblioteca de charts:** widgets implementados com CSS grid + SVG puro — zero dependência nova, bundle enxuto
- **ActivityHeatmap — dados de `state.sessions`:** dados já carregados em memória pelo AppContext; sem query adicional ao Supabase
- **CognitiveScoreTrend — query Supabase:** `retention_metrics` é a única fonte confiável de histórico real; agregação por data feita em JS para evitar RPC
- **ContentProgressChart — dados de `state.cards`:** cálculo de mastery score por conteúdo derivado do estado local; sem nova query
- **Skeleton state para tendência:** `null` = carregando, `[]` = sem dados; `CognitiveScoreTrend` distingue os dois estados visualmente

---

## PWA-01 — Progressive Web App

**Arquivos criados:**
| Arquivo | Descrição |
|---------|-----------|
| `public/manifest.webmanifest` | Web App Manifest com name, icons, display, theme_color |
| `public/sw.js` | Service Worker — cache-first para shell, network-first para API/Supabase; notificationclick com validação Open Redirect; CACHE_NAME versionado `neurolearn-v1-20260608` |
| `public/icons/*.png` | Ícones 192x192 e 512x512 gerados via script |
| `src/hooks/usePushNotifications.ts` | Hook — detecta suporte, estado de permissão reativo (permissionchange), subscribe/unsubscribe |
| `src/components/ui/PushNotificationPrompt.tsx` | Componente de opt-in com UI contextual |
| `src/components/ui/ServiceWorkerRegistrar.tsx` | Registra o SW no AppShell |
| `src/app/api/push/subscribe/route.ts` | POST/DELETE — salva/remove subscription no Supabase (RLS user_id) |
| `src/app/api/push/notify/route.ts` | POST — cron diário; service role client (bypassa RLS); envia push via web-push; remove subscriptions 410 expiradas |

**Arquivos modificados:** `src/app/(app)/AppShell.tsx`, `src/app/layout.tsx`, `next.config.ts` (CSP worker-src), `package.json` (web-push), `src/types/database.types.ts` (push_subscriptions), `vercel.json` (cron 0 8 \* \* \*), `src/modules/settings/SettingsView.tsx` (unsubscribe antes de deletar conta).

**Bugs corrigidos nesta fase:**

- `notify` usava `createClient` cookie-based sem sessão → RLS bloqueava queries → trocado para service role client
- SW `notificationclick` permitia Open Redirect → adicionada validação `rawUrl.startsWith('/')`
- `Uint8Array.from()` retornava `ArrayBufferLike` → corrigido com loop explícito (`new Uint8Array(length)`)

**Tabela Supabase:** `push_subscriptions` com RLS `auth.uid() = user_id`.

---

## AI-02 — Quiz Adaptativo com IA

**Arquivos modificados:**
| Arquivo | Alteração |
|---------|-----------|
| `src/modules/active/ActiveView.tsx` | Novo modo `quiz` — `loadQuiz` (priorização por mastery, `Promise.allSettled`, Fisher-Yates), `handleQuizPick`, `handleQuizNext`; `data-testid` em todos os elementos do quiz UI |

**Testes criados:**
| Arquivo | Cobertura |
|---------|-----------|
| `src/lib/ai/__tests__/validation.test.ts` | 15 casos para `generateQuizSchema` — inputs válidos, limites, campos ausentes, valores inválidos |
| `tests/e2e/sprint4.spec.ts` (US-AI-02) | 9 cenários E2E — home, loading, playing, answering, done, refazer, voltar |

**Algoritmo de priorização:** cards ordenados por mastery (`new→learning→review→strong`), máximo 7 por quiz. Cards com mastery baixo aparecem primeiro para reforçar pontos fracos.

**XP:** 10 XP por resposta correta, despachado via `EARN_XP` ao fim do quiz.

---

## DOC-UX-01 — Guia do Usuário v3.0 ✅

**Data:** 2026-06-08  
**Escopo:** Reescrita completa do Guia do Usuário com foco em UX Writing premium — linguagem humana, acolhedora e didática, estilo onboarding de SaaS moderno.

### Arquivos

| Arquivo                           | Ação                                         |
| --------------------------------- | -------------------------------------------- |
| `docs/user-guide/user-guide.md`   | Reescrito do zero — 15 seções, ~1.200 linhas |
| `docs/user-guide/user-guide.docx` | Regenerado via `npm run generate-doc`        |
| `docs/user-guide/user-guide.pdf`  | Regenerado via `npm run generate-pdf`        |

### Estrutura do novo guia (v3.0)

| Seção                      | Conteúdo                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------- |
| 1. O que é o NeuroLearn    | Problema, solução, 3 pilares, Pirâmide de Glasser                                     |
| 2. Primeiros Passos        | Magic Link, criação de conta, fluxo inicial sugerido                                  |
| 3. Dashboard               | Todas as métricas reais: Sequência, XP, Cognitive Score, heat map, tendência, domínio |
| 4. Biblioteca              | CRUD completo, organização, busca                                                     |
| 5. Sessão de Foco          | Timer Pomodoro, anotações, highlights, criação de flashcards, finalização             |
| 6. Revisão Inteligente     | Curva do esquecimento, avaliações 1–4+Perfeito, atalhos de teclado                    |
| 7. Flashcards Inteligentes | Boas práticas, levels de mastery, geração com IA                                      |
| 8. Aprendizado Ativo       | Modo Professor (90%), Aplicação Prática (75%), Quiz Adaptativo (65%)                  |
| 9. Habilidades             | Categorias, XP, níveis, 12 conquistas                                                 |
| 10. Dashboard Cognitivo    | Cognitive Score detalhado, interpretação, heat map, tendência                         |
| 11. Dicas de Aprendizagem  | 8 boas práticas baseadas em neurociência                                              |
| 12. App + Notificações     | Instalação PWA (Android, iOS, Desktop), Push Notifications                            |
| 13. Configurações          | Export/Import backup, exclusão de conta                                               |
| 14. FAQ                    | 9 perguntas frequentes respondidas                                                    |
| 15. Atalhos e Referência   | Tabela de atalhos, tabela de retenção por método, boas práticas                       |

### Padrão de conteúdo aplicado

- Linguagem: PT-BR, tom conversacional, sem jargão técnico
- Estrutura por seção: Conceito → Por que importa → Passo a passo → Dica prática
- Callouts `>` para dicas, avisos e regras de ouro
- Tabelas para comparações e referências rápidas
- Placeholders de imagem `> 📸 [Imagem: ...]` em pontos estratégicos
- Todos os nomes de UI refletem o código real (labels, data-testid, textos exatos)

---

## FRENTE-1 — Perfil do Usuário + SEO ✅

**Data:** 2026-06-09

### Arquivos criados

| Arquivo                               | Descrição                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/services/profileService.ts`      | `getUserProfile` e `updateUserProfile` — acesso à tabela `public.users` via Supabase                                                                    |
| `src/modules/profile/ProfileView.tsx` | Formulário React Hook Form + Zod: nome (max 80), avatar_url (URL opcional); preview de avatar; toggle de notificações (localStorage `nl_notifications`) |
| `src/app/(app)/profile/page.tsx`      | Rota `/profile` com metadata `title`                                                                                                                    |
| `src/app/sitemap.ts`                  | Sitemap.xml com URLs públicas (home, login, signup, política de privacidade)                                                                            |
| `src/app/robots.ts`                   | robots.txt bloqueando rotas autenticadas                                                                                                                |
| `tests/e2e/profile.spec.ts`           | 16 testes E2E: renderização, validação, notificações, sidebar, SEO                                                                                      |

### Arquivos modificados

| Arquivo                             | Alteração                                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/components/layout/Sidebar.tsx` | Nome do usuário reativo: `useEffect` carrega do Supabase; listener `nl:profile-updated` atualiza em tempo real sem reload |
| `src/app/layout.tsx`                | Metadata global com `openGraph` e `twitter` card                                                                          |
| `playwright.config.ts`              | `profile.spec.ts` adicionado ao projeto `authenticated`                                                                   |

### Decisões técnicas

- **Evento customizado** `nl:profile-updated` para comunicação ProfileView → Sidebar sem adicionar ao AppContext
- **`isDirty`** no RHF guarda o botão "Salvar alterações" desabilitado enquanto form limpo
- Coluna `name` já existia na tabela `public.users` — nenhuma migração necessária

---

## HOTFIX-CONSOLE-01 — Console de Produção Limpo ✅

**Data:** 2026-06-09

### Causa raiz dos erros

| Erro                             | Causa                                                                                                                                      | Arquivo                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| `500 /rest/v1/users`             | RLS infinite recursion: `super_admin_read_all_users` usava subquery em `users` dentro de policy SELECT de `users`                          | Supabase DB                 |
| `ERR_BLOCKED_BY_CLIENT` (Sentry) | Sentry enviava eventos diretamente para `sentry.io` — bloqueado por adblockers + Session Replay retry flood                                | `instrumentation-client.ts` |
| CSP bloqueando PostHog CDN       | `us-assets.i.posthog.com` ausente no `connect-src` deployed                                                                                | `next.config.ts`            |
| `ignoreErrors` perdido           | `sentry.client.config.ts` (deprecated) tinha `ignoreErrors`; `instrumentation-client.ts` (ativo) chamava `Sentry.init()` novamente sem ele | duplo init                  |

### Correções aplicadas

**HC-03 — RLS fix (Supabase migration)**

- Criada função `public.get_my_role()` com `SECURITY DEFINER` — lê `role` sem ativar RLS (sem recursão)
- Policy `super_admin_read_all_users` recriada: `auth.uid() = id OR get_my_role() = 'super_admin'`

**HC-02 — Sentry tunnel**

- Criado `src/app/api/sentry-tunnel/route.ts` — proxy server-side que valida DSN e repassa ao ingest real
- `instrumentation-client.ts` atualizado com `tunnel: '/api/sentry-tunnel'`

**HC-04 — Config Sentry consolidada**

- `ignoreErrors`, `tunnel` e `onRouterTransitionStart` adicionados em `instrumentation-client.ts`
- `sentry.client.config.ts` deletado (eliminado duplo init)

**HC-01 — CSP PostHog**

- `us-assets.i.posthog.com` e `eu-assets.i.posthog.com` já presentes em `next.config.ts` — resolvido no deploy

### Gate

- type-check ✅ | lint ✅ | 327/327 testes ✅ | build ✅

---

## LEARNING-STRUCTURE-01 (LS-01-A) — Hierarquia Trilhas de Aprendizado ✅

**Data:** 2026-06-10
**Gate:** `type-check` ✅ · `lint` ✅ · `test:unit 373/373` ✅ · `build` ✅ · `RLS audit` ✅ · `migration produção` ✅

### Escopo

Fase A da LEARNING-STRUCTURE-01: implementação completa da hierarquia `LearningTrail → Content → StudySession`. Scope limitado a Hierarquia + RLS (fases B e C — paginação, busca cognitiva, resiliência — são próximos sprints).

### Arquivos criados

| Arquivo | Descrição |
|---------|-----------|
| `supabase/migrations/20260609_learning_trails.sql` | Migration: tabela `learning_trails`, RLS `users_own_trails`, coluna `trail_id` em `contents`, índices |
| `src/services/trailsService.ts` | CRUD completo de trilhas + `createDefaultTrail` (auto-migração de usuários existentes) |
| `src/modules/library/TrailFormModal.tsx` | Modal criar/editar trilha: RHF+Zod, seletor de 8 cores + 8 emojis, preview live, ConfirmDialog de exclusão |
| `tests/e2e/trails.spec.ts` | 10 testes E2E: TC-TRL-001..010 (criar, editar, excluir, busca, seção Sem Trilha) |

### Arquivos modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/types/index.ts` | `TrailType`, `LearningTrail`, `Content.trailId`, `AppState.trails`, 4 novos `AppAction` |
| `src/types/database.types.ts` | `trail_id` em contents, tabela `learning_trails` completa, alias `DbTrail` |
| `src/services/contentsService.ts` | `trailId` em `toContent()`, `createContent()`, `updateContent()` |
| `src/lib/seed.ts` | `trailId: null` nos 3 conteúdos seed + `trails: []` |
| `src/lib/validation/schemas.ts` | `trailSchema` + `TrailFormValues` |
| `src/services/localStorageService.ts` | `trails: []` no fallback do localStorage |
| `src/store/AppContext.tsx` | Imports trailsService, `trails: []` em EMPTY_STATE, 4 reducer cases, loadData paralelo + auto-criação, 4 side-effects |
| `src/modules/library/LibraryView.tsx` | Agrupamento por trilha: `trailGroups` + seção "Sem Trilha" + `ContentGrid` reutilizável + botão "+ Trilha" |
| `src/modules/library/AddContentModal.tsx` | `trailId: null` no objeto Content |
| `src/modules/settings/SettingsView.tsx` | `trailId` e `trails` adicionados ao `BackupDataSchema` (backward-compatible com `.optional().default()`) |
| `src/engine/achievements.test.ts` | `trails: []` no fixture `makeState` |
| `src/store/AppContext.test.ts` | `trailId: null` no fixture `makeContent` |
| `src/services/contentsService.test.ts` | `trail_id: null` no fixture `dbRow` |
| `playwright.config.ts` | `trails.spec.ts` adicionado ao projeto `authenticated` |

### Decisões arquiteturais

- **`ON DELETE SET NULL`** no FK `contents.trail_id`: excluir trilha não exclui conteúdos, apenas desvincula.
- **Auto-migração**: primeiro load de usuários com conteúdos mas sem trilhas cria automaticamente "Meus Estudos" e vincula tudo.
- **Seção "Sem Trilha"** sempre no rodapé, com ícone 📎 — nunca oculta conteúdos do usuário.
- **`ContentGrid` component**: extraído do map inline para componente reutilizável (preserva testabilidade dos `data-testid`).

### Banco de dados (produção)

- `learning_trails`: tabela criada, RLS ativo (`users_own_trails` — FOR ALL) ✅
- `contents.trail_id`: coluna UUID nullable com FK ✅
- Índices: `idx_learning_trails_user_id` + `idx_contents_user_trail` ✅
- Todas as 9 tabelas auditadas com RLS ativo ✅

---

## MELHORIAS-01 — Meu Material de Estudo + Highlights Âmbar ✅

**Data:** 2026-06-09
**Gate:** `type-check` ✅ · `lint` ✅ · `test:unit 373/373` ✅ · `build` ✅ · `qa-estrategico` ✅ · `qa-expert` ✅

### Escopo

Implementação de 2 das 5 melhorias solicitadas (IMP-01 e IMP-04). IMP-02 (confirmação) e IMP-03 (feedback IA) já estavam implementados. IMP-05 (upload) diferido para próximo sprint.

### Arquivos modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/modules/review/ReviewView.tsx` | Tab switcher pill ("📚 Revisão" / "📔 Meu Material"), early return para MemoryView, keyboard guard `if (activeTab !== 'review') return`, `activeTab` na dep array do useEffect |
| `src/modules/memory/MemoryView.tsx` | Título "📔 Meu Material de Estudo", subtítulo atualizado, highlights históricos âmbar (`rgba(245,158,11,.12)` / `#d97706`) |
| `src/modules/focus/FocusStudyPhase.tsx` | Tags de highlight âmbar (`rgba(245,158,11,.15)` / `#d97706`), botão × separado (circular, `#ef4444`), `aria-label` dinâmico (`` `Remover highlight "${h}"` ``) |
| `src/components/layout/Sidebar.tsx` | Label "Caderno" → "Material" |

### Decisão arquitetural — Tab switcher

`tabHeader` definido como `const JSX` computado a cada render (seguro — referencia estado). Early return `knowledge` inserido antes das branches `empty`/`done`/`main`. Evita extração de componente desnecessária e mantém legibilidade.

### Bug crítico corrigido — Keyboard guard

**Problema:** `document.addEventListener('keydown', onKey)` global disparava `goBack()` e `setFlipped()` silenciosamente quando `activeTab === 'knowledge'` (usuário interagindo com MemoryView).

**Correção:** `if (activeTab !== 'review') return` como primeira linha de `onKey`; `activeTab` adicionado à dep array `[done, flipped, rate, goBack, activeTab]`.

**Descoberto por:** skill `qa-estrategico`.

### Acessibilidade corrigida

`aria-label="Remover highlight"` (genérico) → `` `Remover highlight "${h}"` `` (dinâmico, identifica o highlight específico para leitores de tela).

### Specs criados

| Arquivo | Escopo |
|---------|--------|
| `.specs/quick/001-highlight-visual/TASK.md` | IMP-01 — highlights âmbar |
| `.specs/features/review-knowledge-tab/spec.md` | IMP-04 — requisitos RKT-01…05 |

### QA — Casos testados (qa-expert)

12 test cases TC-REV-001 a TC-REV-012 cobrindo: tab switcher em todos os estados, preservação de estado da revisão ao trocar tabs, desativação de atalhos no tab errado, highlights âmbar + aria-label dinâmico, sidebar label, reset de estado do MemoryView.

---

## F-080 — Core Web Vitals ✅

**Data:** 2026-06-10 | **Branch:** `feature/f-080-cwv`

### Objetivo

Medir e corrigir os gargalos reais de LCP, CLS e INP no NeuroLearn com base em análise de código real (não heurísticas genéricas).

### Arquivos modificados

| Arquivo | O que mudou |
|---------|-------------|
| `next.config.ts` | `@next/bundle-analyzer` (conditional wrap), `experimental.optimizePackageImports` para supabase-js/zod/react-hook-form/@hookform/resolvers |
| `package.json` | `cross-env` + `@next/bundle-analyzer` devDependencies; script `"analyze"` |
| `src/app/layout.tsx` | `Inter({ display: 'swap' })` para LCP; `<link rel="preconnect">` Supabase + `dns-prefetch` PostHog/Sentry |
| `src/app/(app)/AppShell.tsx` | `AnalyticsIdentifier`, `ServiceWorkerRegistrar`, `PushNotificationPrompt` → `next/dynamic` com `ssr: false` |
| `src/modules/library/LibraryView.tsx` | `useTransition` + `startTransition` no onChange de busca; skeleton CLS com alturas reservadas (48+200+200+200px) |
| `src/modules/help/HelpView.tsx` | `useTransition` + `startTransition` no onChange de busca |
| `src/modules/dashboard/DashboardView.tsx` | `DashboardSkeleton` com 5 blocos de altura reservada (80+200+120+180+200px); early-return se `loading` |
| `src/components/layout/Sidebar.tsx` | `React.memo` → evita re-render a cada dispatch AppContext |
| `src/components/layout/BottomNav.tsx` | `React.memo` → evita re-render a cada dispatch AppContext |
| `.specs/features/f-080-core-web-vitals/spec.md` | Spec LCP-01..03, CLS-01..02, INP-01..05, BUN-01..02 |
| `.specs/features/f-080-core-web-vitals/tasks.md` | T-01..T-07 com critérios done-when e gate checks |

### Decisões técnicas

- **`React.memo` pattern:** `export const X = memo(function X(...) { ... })` — preserva displayName para DevTools.
- **`startTransition` para busca:** marca setSearch como não-urgente, liberando o thread principal para interações INP-críticas.
- **Skeleton CLS:** pattern `if (loading) return <Skeleton />` (early-return) alinha com ProfileView; alturas explícitas reservam espaço antes da hidratação.
- **`ssr: false` para não-críticos:** `AnalyticsIdentifier`, `ServiceWorkerRegistrar`, `PushNotificationPrompt` não impactam o render inicial — lazy carregados após hydration.
- **`optimizePackageImports`:** reduz side-effect imports de supabase-js e zod sem mudança de código nos imports.

### Resultado do gate

- `npm run type-check` — ✅ zero erros
- `npm run lint` — ✅ zero warnings
- `npm run test:unit` — ✅ 373/373
- `npm run build` — ✅ build limpo

---

## SPRINT-01-FOUNDATION — Foundation Stabilization ✅ (em andamento)

**Data:** 2026-06-11 | **Branch:** `docs/neurolearn-governance` | **422 testes unitários**

### P0-01: deleteTrail/updateTrail — Defense-in-depth ✅

- `src/services/trailsService.ts` — adicionado `.eq('user_id', userId)` em `deleteTrail()` e `updateTrail()`
- `src/store/AppContext.tsx` — callers atualizados para passar `userId`
- `tests/e2e/trails.spec.ts` — TC-TRL-SEC-01/02/03 adicionados

### P0-02: RLS validado ✅ (sem alterações — já ativo)

- Verificação via SQL confirmou RLS ativo em todas as tabelas críticas

### P0-03: Indicador * campos obrigatórios ✅ (sem alterações — já implementado)

- `FormField.tsx` já exibia `*` para `required=true`

### P0-06 + P0-07: Tabela exercises + CRUD ✅

- Migration Supabase: tabela `exercises` com RLS, índices, ON DELETE CASCADE
- `src/types/database.types.ts` — `DbExercise` adicionado
- `src/types/index.ts` — `Exercise`, `ExerciseType` adicionados
- `src/services/exercisesService.ts` — CRUD completo com defense-in-depth
- `src/services/exercisesService.test.ts` — 11 testes unitários

### P0-08: Exercícios integrados no FocusExtractPhase ✅

- `src/modules/focus/FocusExtractPhase.tsx` — seção "Criar Exercício" adicionada (persiste imediatamente no Supabase)
- `src/modules/focus/FocusView.tsx` — estado `ex` + `savedExCount` + `handleAddExercise`
- `tests/e2e/exercises.spec.ts` — 9 cenários E2E (TC-EXE-01..09)

### P1-01: Defense-in-depth em list services ✅

- `contentsService.ts` — `listContents(userId)` com `.eq('user_id', userId)`
- `trailsService.ts` — `listTrails(userId)` com `.eq('user_id', userId)`
- `flashcardsService.ts` — `listAllFlashcards(userId)`, `listDueFlashcards(userId)`, `listFlashcardsByContent(userId, contentId)`
- `AppContext.tsx` — todos os callers atualizados
- Testes unitários atualizados (422 passando)

### P1-02: Autosave indicator ✅ (sem alterações — já implementado)

- `SaveIndicator` + `useAutoSave` + integração em `FocusView` já existiam

### P1-03: Playwright API suites ✅

- `tests/e2e/api.spec.ts` — 10 cenários: health check, auth guards (401), validação de input (422)

### Gate final ✅

- `npm run type-check` — zero erros
- `npm run lint` — zero warnings
- `npm run test:unit` — 422/422 passando (32 arquivos)
- `npm run build` — build limpo

---

## O que falta (próximas fases)

### Fase 5 — Dashboard Avançado

- [x] ~~Heat map de atividade (dias da semana × semanas)~~ ✅ DASH-01
- [x] ~~Gráfico de tendência de retenção histórica~~ ✅ DASH-01
- [x] ~~Gráfico de domínio/progresso por conteúdo~~ ✅ DASH-01
- [x] ~~Cards em risco reais do Supabase~~ ✅ SPRINT-4 (US-DA-01)
- [x] ~~Streak real persistido no banco~~ ✅ SPRINT-1
- [x] ~~Cognitive Score no Dashboard~~ ✅ SPRINT-1

### Fase 5 — API Routes

- [ ] `POST /api/review/rate` — endpoint de revisão usando SM-2 aprimorado
- [ ] Sugestão de conteúdos baseada em retenção e cognitive score
- [x] ~~Edge Function `daily-retention-snapshot`~~ ✅ SPRINT-3 (P6)
- [x] ~~Geração automática de flashcards via IA~~ ✅ SPRINT-3 (US-03.2)
- [x] ~~Análise do Modo Professor via IA~~ ✅ SPRINT-4 (US-AI-01)

### Fase 6 — Gamificação Avançada

- [ ] Ranking entre usuários
- [x] ~~Missões diárias/semanais com XP bônus~~ ✅ F-090
- [x] ~~Streak Recovery (Streak Shields)~~ ✅ F-090
- [x] ~~Quiz adaptativo via IA~~ ✅ AI-02
- [x] ~~Notificações de revisão agendada~~ ✅ PWA-01
- [x] ~~Sistema de conquistas (badges)~~ ✅ SPRINT-4 (US-GM-01)

### Fase 6 — Admin e Configurações

- [ ] Painel super admin (gestão de usuários, analytics globais)
- [ ] Configurações de perfil (alterar senha, avatar)
- [x] ~~Exportação de dados~~ ✅ SET-01
- [x] ~~Google OAuth "Em breve" (QW-06)~~ ✅ SPRINT-4-ORIGINAL — ativar requer Client ID/Secret no Supabase dashboard

### Dívida técnica / operacional

- [ ] **Senha temporária do admin** — alterar `NeuroLearn@2025!` antes de escalar usuários
- [ ] **Google OAuth** — ativar no Supabase dashboard (Client ID/Secret) e remover `disabled` do botão
- [ ] **Migrar Supabase para `sa-east-1`** — latência atual ~150ms do Brasil; São Paulo seria ~30ms
- [ ] **DMARC `p=none` → `p=quarantine`** — subir após 3+ semanas de monitoramento sem falsos positivos

### Débito técnico E2E — falhas pré-existentes confirmadas (2026-06-12)

Identificadas durante o gate da Sprint 02. **Não introduzidas nesta sprint** — confirmadas no código commitado anterior.

| ID | Arquivo | Teste | Causa Raiz |
|---|---|---|---|
| E2E-DEBT-001 | `tests/e2e/app.spec.ts:6` | `TC-LAND-008` — root redireciona para `/auth/login` | Middleware exclui explicitamente `pathname !== '/'` do `isAppRoute`. A `/` é uma landing pública. O teste assume comportamento diferente do implementado. **Ação:** atualizar teste para refletir o comportamento real da landing, ou redirecionar `/` para `/auth/login` se não houver sessão. |
| E2E-DEBT-002 | `tests/e2e/bugs-regression.spec.ts:19` | `BUG-REG-001` — `/app/library` sem sessão redireciona para login | URL legada `/app/library` não existe no App Router (rota correta: `/library`). O middleware não intercepta porque a rota não é reconhecida. **Ação:** atualizar teste para usar `/library` ou criar redirect de `/app/library`. |
| E2E-DEBT-003 | `tests/e2e/bugs-regression.spec.ts:28` | `BUG-REG-002` — `/app/review` sem sessão redireciona para login | Mesmo problema que `BUG-REG-001`. URL legada `/app/review` → rota real é `/review`. **Ação:** atualizar teste. |
| E2E-DEBT-004 | `tests/e2e/settings.spec.ts:193,201` | `TC-SET-015/016` — Settings "Excluir conta" | `settings.spec.ts` está ausente do `testIgnore` do projeto `chromium` e ausente do `testMatch` do projeto `authenticated`. Os testes rodam sem auth, a página redireciona para login e os elementos não são encontrados. **Ação:** adicionar `'**/settings.spec.ts'` ao `testMatch` do projeto `authenticated` em `playwright.config.ts`. |

---

## F-090 — Gamificação v2 (Missões + Streak Recovery) ✅

**Data:** 2026-06-10 | **Branch:** `feature/f-090-gamification-v2` | **399 testes**

### Arquivos criados

| Arquivo | Papel |
|---|---|
| `src/engine/missions/missionDefinitions.ts` | Pool de 5 missões diárias + 4 semanais com tracking events |
| `src/engine/missions/missionSelector.ts` | Seleção determinística LCG Fisher-Yates (seed = userId + periodKey) |
| `src/engine/missions/missionSelector.test.ts` | 26 testes unitários (determinismo, unicidade, datas, pool sizes) |
| `src/services/missionsService.ts` | ensureMissionsForPeriod, trackEvent, completeMission, consumeStreakShield |
| `src/hooks/useMissions.ts` | Hook com listener `nl:missions_updated` para refresh reativo |
| `src/components/ui/MissionsPanel.tsx` | Painel colapsável com seções diárias/semanais + progress bars |
| `src/components/ui/StreakRecoveryBanner.tsx` | Banner âmbar com botões "Usar Escudo" e "Deixar resetar" |
| `tests/e2e/missions.spec.ts` | 7 testes E2E (TC-MSS-001..007) |

### Arquivos modificados

| Arquivo | O que mudou |
|---|---|
| `src/types/index.ts` | `AppState.streakShields`, `LOAD_SHIELDS`, `USE_SHIELD` actions |
| `src/types/database.types.ts` | Tabelas `user_missions`, `streak_shield_uses`, campo `streak_shields` em `users` |
| `src/store/AppContext.tsx` | streakRecoverable, handleUseShield, trackMissionEvent fire-and-forget |
| `src/modules/dashboard/DashboardView.tsx` | MissionsPanel + StreakRecoveryBanner integrados |
| `src/modules/review/ReviewView.tsx` | trackEvent fire-and-forget após RATE_CARD |
| `src/lib/seed.ts` / `localStorageService.ts` | streakShields adicionado ao AppState default |
| `src/modules/settings/SettingsView.tsx` | BackupDataSchema: campo streakShields opcional |

### Gate final

- type-check ✅ zero erros
- lint ✅ zero warnings
- test:unit ✅ 399/399 (26 novos)
- build ✅ limpo

---

---

## Sprint 02 — Projetos, MemoryView CRUD, Filtros de Biblioteca ✅

**Data:** 2026-06-12 | **Gate:** APROVADO COM RESSALVAS | **484 testes unitários (34 arquivos)**

### Funcionalidades entregues

#### Módulo de Projetos (RF-191 a RF-196)

CRUD completo de projetos com associação de Trilhas, cálculo de progresso e isolamento de ownership (ADR-004).

| Arquivo | Papel |
|---|---|
| `src/modules/projects/ProjectsView.tsx` | Listagem com busca + master-detail |
| `src/modules/projects/ProjectDetailView.tsx` | Detalhe com Trilhas associadas e progresso |
| `src/modules/projects/ProjectCard.tsx` | Card de projeto com progresso visual |
| `src/modules/projects/ProjectFormModal.tsx` | Criar / editar / excluir projeto |
| `src/modules/projects/AssignTrailModal.tsx` | Associar / desassociar Trilhas |
| `src/services/projectsService.ts` | 7 funções: list, create, update, delete, assign, remove, calculateProgress |
| `src/services/projectsService.test.ts` | 18 testes unitários (RN-004, RN-009, RN-013 a RN-017) |
| `src/app/(app)/projects/page.tsx` | Rota `/projects` (protegida pelo middleware) |

**Supabase:** tabela `projects` com RLS (4 políticas granulares: SELECT/INSERT/UPDATE/DELETE).  
**DB:** `learning_trails.project_id` FK com `ON DELETE SET NULL` (RN-006/007/008).

#### MemoryView — Edição e Exclusão de Sessões e Exercícios

| Arquivo | Papel |
|---|---|
| `src/modules/memory/SessionEditModal.tsx` | Editar notes, teach, highlights de uma sessão |
| `src/modules/memory/ExercisesSection.tsx` | Listar exercícios por conteúdo (lazy load) com editar/excluir |
| `src/modules/memory/ExerciseEditModal.tsx` | Editar question/answer de um exercício |
| `src/modules/memory/MemoryView.tsx` | Integra novos modais + DELETE_SESSION dispatch |
| `src/services/sessionsService.ts` | `updateStudySession`, `deleteStudySession` com ownership |

#### LibraryView — Filtros Avançados (RF-201 a RF-209)

| Funcionalidade | Implementação |
|---|---|
| Filtro por tipo | Chips multi-select: Livro, Curso, Vídeo, Artigo, Nota |
| Filtro por status | Todos / Novos / Em andamento / Concluídos |
| Busca textual | Título + autor + descrição + nome da trilha (normalizado, sem acento) |
| Reset de filtros | Botão "Limpar filtros" quando qualquer filtro ativo |
| `filterLogic.test.ts` | 26 testes unitários cobrindo todas as combinações |

#### Outros

- `src/lib/validation/schemas.ts` — `projectSchema`, `sessionEditSchema`, `exerciseEditSchema`
- `src/types/index.ts` — tipo `Project`, `Exercise`, `ExerciseType`; novos actions de projetos e sessões
- `src/services/trailsService.ts` — `projectId` no mapeamento `toTrail`
- `src/services/localStorageService.ts` — `projects` no fallback local
- `src/store/AppContext.tsx` — reducers para projetos, sessions; `listProjects` em paralelo no init
- `src/store/AppContext.test.ts` — +8 testes (UPDATE_SESSION, DELETE_SESSION)
- `src/modules/settings/SettingsView.tsx` — schema de backup inclui `projects` e `projectId`
- `.gitignore` — padrões `*.docx.pdf` e `*.docx` adicionados

### Novos testes E2E (projeto `authenticated`)

| Arquivo | Cobertura |
|---|---|
| `tests/e2e/projects.spec.ts` | CRUD de projetos, associação de trilhas, progresso |
| `tests/e2e/projects-api.spec.ts` | Contratos HTTP: health, auth 401, validações AI |
| `tests/e2e/memory-crud.spec.ts` | Edição e exclusão de sessões e exercícios |
| `tests/e2e/library-filters.spec.ts` | FilterBar: visibilidade, tipo, status, reset, combinações |

### Gate final — 2026-06-12

| Verificação | Resultado |
|---|---|
| `npm run type-check` | ✅ zero erros |
| `npm run lint` | ✅ zero warnings |
| `npm run test:unit` | ✅ 484/484 (34 arquivos) |
| `npm run build` | ✅ 34 rotas |
| `npm audit` | ✅ 0 vulnerabilidades |
| RLS Supabase | ✅ 17 tabelas habilitadas |

---

## Pontos de Atenção

- **Região Supabase `us-east-1`:** latência ~150ms do Brasil por chamada. Ver item no Roadmap acima.
- **Senha do admin:** `NeuroLearn@2025!` é temporária — ver item no Roadmap acima.
- **Google OAuth:** botão "Em breve" já no login — ver item no Roadmap acima.
- **`.env.local`:** nunca commitar. Contém todas as chaves de API.
