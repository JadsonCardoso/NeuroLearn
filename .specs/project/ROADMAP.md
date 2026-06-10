# Roadmap

**Updated:** 2026-06-05 (revisado com Estratégia Técnica da Plataforma)

---

## v1.0 — MVP Local ✅ COMPLETO

SPA single-file, client-side only. Todos os módulos core entregues.

| Módulo                            | Status  | Spec                             |
| --------------------------------- | ------- | -------------------------------- |
| Dashboard com métricas SM-2       | ✅ Done | features/dashboard/spec.md       |
| Biblioteca de conhecimento        | ✅ Done | features/library/spec.md         |
| Sessão de Foco (Pomodoro 3 fases) | ✅ Done | features/focus-session/spec.md   |
| Revisão Inteligente (SM-2)        | ✅ Done | features/smart-review/spec.md    |
| Aprendizado Ativo (3 modos)       | ✅ Done | features/active-learning/spec.md |
| Árvore de Habilidades             | ✅ Done | features/skill-tree/spec.md      |
| Central de Ajuda interativa       | ✅ Done | features/help/spec.md            |
| Dark/Light Mode                   | ✅ Done | features/dark-light-mode/spec.md |
| Landing page marketing            | ✅ Done | —                                |
| Documentação PDF + DOCX           | ✅ Done | —                                |

---

## v1.1 — Robustez e Dados 🔜 PRÓXIMO

**Objetivo:** Proteger dados do usuário e estabilizar o produto atual antes da migração.
**Estimativa:** 1–2 semanas

| Feature                               | ID    | Prioridade | Complexidade | Spec                              |
| ------------------------------------- | ----- | ---------- | ------------ | --------------------------------- |
| Export/Import JSON de dados           | F-011 | P0         | Pequena      | features/export-import/spec.md ✅ |
| Validação de schema no load()         | F-012 | P0         | Pequena      | features/settings/spec.md ✅      |
| Pinning de versão CDN (React/Babel)   | F-013 | P0         | Mínima       | quick fix — 1 linha               |
| Configurações (reset, limpar dados)   | F-014 | P1         | Pequena      | features/settings/spec.md ✅      |
| Testes unitários (sm2, calcRetention) | F-015 | P0         | Média        | A especificar                     |
| react.production.min.js               | F-016 | P2         | Mínima       | quick fix — 1 URL                 |

**Gate:** Antes de avançar para v1.2, Export/Import e Testes unitários devem estar implementados.

---

## v1.2 — Migração Técnica 🏗️

**Objetivo:** Migrar da SPA single-file para stack moderna (Next.js + Supabase).
**Estimativa:** 3–5 semanas
**Spec detalhada:** features/migration/spec.md ✅

| Feature                                     | ID    | Prioridade | Complexidade | Spec                                |
| ------------------------------------------- | ----- | ---------- | ------------ | ----------------------------------- |
| Setup Next.js 14 + TypeScript + TailwindCSS | F-020 | P0         | Grande       | features/migration/spec.md          |
| Integração Supabase (Auth + PostgreSQL)     | F-021 | P0         | Grande       | features/auth/spec.md ✅            |
| Modelagem PostgreSQL (10 entidades)         | F-022 | P0         | Grande       | features/database-schema/spec.md ✅ |
| Migrar dados localStorage → Supabase        | F-023 | P0         | Média        | features/migration/spec.md          |
| Deploy Vercel + Supabase Cloud              | F-024 | P1         | Média        | features/migration/spec.md          |
| Design System com TailwindCSS               | F-025 | P1         | Média        | A especificar                       |

**Gate:** Auth funcionando + todos os dados no PostgreSQL + app deployado no Vercel.

---

## v1.3 — Motor Cognitivo 🧠

**Objetivo:** Mover os algoritmos para o backend, torná-los adaptativos e iniciar observabilidade.
**Estimativa:** 3–4 semanas
**Spec detalhada:** features/cognitive-engine/spec.md ✅

| Feature                                | ID    | Prioridade | Complexidade | Spec                              |
| -------------------------------------- | ----- | ---------- | ------------ | --------------------------------- |
| Motor SM-2 no backend (Edge Functions) | F-030 | P0         | Grande       | features/cognitive-engine/spec.md |
| API de revisões espaçadas              | F-031 | P0         | Média        | features/cognitive-engine/spec.md |
| Dashboard de analytics cognitivo       | F-032 | P1         | Grande       | features/cognitive-engine/spec.md |
| Eventos cognitivos (PostHog)           | F-033 | P1         | Média        | features/observability/spec.md ✅ |
| Error tracking (Sentry)                | F-034 | P1         | Pequena      | features/observability/spec.md    |
| Mobile-first responsivo                | F-035 | P1         | Grande       | A especificar                     |

---

## v2.0 — Plataforma Cognitiva 🚀

**Objetivo:** Plataforma completa com IA, segurança, LGPD e escalabilidade.
**Estimativa:** 2–4 meses
**Specs detalhadas:** auth, security, ai-integration, pwa-offline, seo-blog

| Feature                                    | ID    | Prioridade | Complexidade | Spec                               |
| ------------------------------------------ | ----- | ---------- | ------------ | ---------------------------------- |
| RBAC (aluno / mentor / admin / IA)         | F-040 | P0         | Grande       | features/security/spec.md ✅       |
| LGPD compliance                            | F-041 | P0         | Grande       | features/security/spec.md          |
| Segurança APIs (rate limiting, audit logs) | F-042 | P0         | Grande       | features/security/spec.md          |
| Upload seguro (PDF, áudio, imagens)        | F-043 | P1         | Grande       | features/security/spec.md          |
| IA: geração de flashcards                  | F-050 | P0         | Grande       | features/ai-integration/spec.md ✅ |
| IA: análise do Modo Professor              | F-051 | P1         | Grande       | features/ai-integration/spec.md    |
| IA: detecção de lacunas cognitivas         | F-052 | P1         | Muito grande | features/ai-integration/spec.md    |
| PWA + Service Worker                       | F-060 | P1         | Grande       | features/pwa-offline/spec.md ✅    |
| Notificações push de revisão               | F-061 | P1         | Média        | features/pwa-offline/spec.md       |
| SEO: páginas indexáveis + meta tags        | F-070 | P1         | Média        | features/seo-blog/spec.md ✅       |
| Blog educacional (neurociência/memória)    | F-071 | P2         | Grande       | features/seo-blog/spec.md          |
| Core Web Vitals (LCP/CLS/INP)              | F-080 | P1         | Média        | features/observability/spec.md     |

---

## Decisões técnicas definidas

| Decisão            | Opção escolhida                | Alternativas descartadas            |
| ------------------ | ------------------------------ | ----------------------------------- |
| Frontend framework | Next.js 14 + TypeScript        | Vite SPA, Remix                     |
| CSS approach       | TailwindCSS                    | CSS Modules, styled-components      |
| Backend/BaaS       | Supabase                       | Firebase, PocketBase, NestJS custom |
| Database           | PostgreSQL (via Supabase)      | MongoDB, SQLite                     |
| Auth               | Supabase Auth                  | Auth0, NextAuth, custom JWT         |
| Deploy             | Vercel + Supabase Cloud        | AWS, Railway, Render                |
| IA provider        | OpenAI / Anthropic (a definir) | Gemini, open-source LLM             |
| Observabilidade    | Sentry + PostHog               | Datadog, Mixpanel                   |

---

## Critérios de saída por versão

| Versão | Critério de saída                                                           |
| ------ | --------------------------------------------------------------------------- |
| v1.1   | Export/Import funcional + sm2() testado + 0 bugs críticos                   |
| v1.2   | Auth funcionando + 100% dados em PostgreSQL + deploy no ar                  |
| v1.3   | Motor cognitivo no backend + PostHog capturando eventos + mobile responsivo |
| v2.0   | RBAC completo + LGPD auditado + IA gerando flashcards + PWA instalável      |
