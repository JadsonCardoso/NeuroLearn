# Roadmap

**Updated:** 2026-06-10 (F-090 Gamificação v2 concluída)

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

## v1.1 — Robustez e Dados ✅ COMPLETO

| Feature                               | ID    | Status  |
| ------------------------------------- | ----- | ------- |
| Export/Import JSON de dados           | F-011 | ✅ Done (SET-01) |
| Validação de schema no load()         | F-012 | ✅ Done |
| Configurações (reset, limpar dados)   | F-014 | ✅ Done (SET-01) |
| Testes unitários (sm2, calcRetention) | F-015 | ✅ Done (373 testes Vitest) |

---

## v1.2 — Migração Técnica ✅ COMPLETO

| Feature                                     | ID    | Status  |
| ------------------------------------------- | ----- | ------- |
| Setup Next.js 15 + TypeScript + TailwindCSS | F-020 | ✅ Done (Fase 1) |
| Integração Supabase (Auth + PostgreSQL)     | F-021 | ✅ Done (Fase 2) |
| Modelagem PostgreSQL (10 entidades)         | F-022 | ✅ Done |
| Deploy Vercel + Supabase Cloud              | F-024 | ✅ Done (INFRA-01) |

---

## v1.3 — Motor Cognitivo ✅ COMPLETO

| Feature                                | ID    | Status  |
| -------------------------------------- | ----- | ------- |
| Motor SM-2 (frontend + engine/)        | F-030 | ✅ Done (Fase 3) |
| Dashboard de analytics cognitivo       | F-032 | ✅ Done (DASH-01) |
| Eventos cognitivos (PostHog)           | F-033 | ✅ Done (OBS-01) |
| Error tracking (Sentry)                | F-034 | ✅ Done (OBS-01) |
| Mobile-first responsivo                | F-035 | ✅ Done (SPRINT-4-ORIGINAL) |

---

## v2.0 — Plataforma Cognitiva ✅ COMPLETO

| Feature                                    | ID    | Status  |
| ------------------------------------------ | ----- | ------- |
| Segurança APIs (rate limiting, audit logs) | F-042 | ✅ Done (Fase 4) |
| LGPD compliance                            | F-041 | ✅ Done (Fase 4) |
| IA: geração de flashcards                  | F-050 | ✅ Done (SPRINT-3) |
| IA: análise do Modo Professor              | F-051 | ✅ Done (SPRINT-4) |
| IA: Quiz Adaptativo                        | F-052 | ✅ Done (AI-02) |
| PWA + Service Worker                       | F-060 | ✅ Done (PWA-01) |
| Notificações push de revisão               | F-061 | ✅ Done (PWA-01) |
| SEO: páginas indexáveis + meta tags        | F-070 | ✅ Done (FRENTE-1) |
| Core Web Vitals (LCP/CLS/INP)             | F-080 | ✅ Done (F-080) |
| Trilhas de aprendizado                     | —     | ✅ Done (LS-01-A + LS-01-B) |
| Perfil + metas de estudo                   | —     | ✅ Done (PROFILE-UPGRADE) |
| Gamificação v2 (missões + streak shields)  | F-090 | ✅ Done (F-090) |

---

## Blocker Ativo

| ID    | Blocker                                           | Impacto                                          | Resolução necessária                                                       |
| ----- | ------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- |
| B-002 | Sem definição de provider IA (OpenAI vs Anthropic) | Bloqueia spec de IA avançada (lacunas cognitivas) | Decisão técnica a tomar antes de F-100                                     |
| B-006 | E2E authenticated tests falhando (23 testes)      | CI/CD — testes de library, review e a11y não rodam em pipeline | Configurar `TEST_USER_EMAIL` + `SUPABASE_SERVICE_ROLE_KEY` no ambiente CI  |

---

## Dívida Técnica Pendente

| Item                          | Impacto  | Esforço | Observação                                                                 |
| ----------------------------- | -------- | ------- | -------------------------------------------------------------------------- |
| Google OAuth                  | Médio    | 30 min  | Botão "Em breve" já existe na UI — falta Client ID/Secret no Supabase Dashboard |
| DMARC `p=none` → `p=quarantine` | Baixo  | 5 min   | Prazo de 3 semanas de monitoramento já passou — pode ser feito agora       |
| Senha admin temporária        | Alto     | 5 min   | `NeuroLearn@2025!` deve ser trocada antes de escalar usuários              |
| Migração Supabase `sa-east-1` | Médio    | Alto    | Latência atual ~150ms do Brasil; São Paulo seria ~30ms — requer planning   |

---

## Próximos Passos — por Ordem de Impacto

### Curto prazo

| Prioridade | Feature                  | ID    | Complexidade | Motivação                                         |
| ---------- | ------------------------ | ----- | ------------ | ------------------------------------------------- |
| ~~P0~~     | ~~Gamificação v2~~       | F-090 | —            | ✅ Concluída 2026-06-10                            |
| P1         | Google OAuth             | —     | Mínima       | Reduz atrito no cadastro; botão já existe na UI   |
| P1         | Fix B-006 (CI/CD E2E)    | B-006 | Pequena      | Desbloqueia pipeline completo de testes           |

### Médio prazo

| Prioridade | Feature                                | ID    | Complexidade  | Motivação                                           |
| ---------- | -------------------------------------- | ----- | ------------- | --------------------------------------------------- |
| P0         | IA: detecção de lacunas cognitivas     | F-100 | Muito grande  | Diferencial cognitivo principal; requer B-002 resolvido |
| P1         | `POST /api/review/rate` (SM-2 backend) | F-031 | Média         | Move lógica de revisão para backend; desbloqueia analytics server-side |
| P2         | RBAC multi-tenant (professor → alunos) | F-040 | Grande        | Habilita uso corporativo e modo sala de aula        |

### Longo prazo

| Prioridade | Feature                         | ID    | Complexidade | Motivação                          |
| ---------- | ------------------------------- | ----- | ------------ | ---------------------------------- |
| P1         | Blog educacional (SEO)          | F-071 | Grande       | Aquisição orgânica                 |
| P1         | Escalabilidade (React Query + virtual) | F-110 | Muito grande | Após > 100 conteúdos/usuário |
| P2         | Migração Supabase `sa-east-1`   | —     | Alto         | Redução de latência para BR        |
| P3         | App mobile nativo (React Native)| I-002 | Muito grande | Após PWA validar demanda mobile    |

---

## Decisões técnicas definidas

| Decisão            | Opção escolhida                | Alternativas descartadas            |
| ------------------ | ------------------------------ | ----------------------------------- |
| Frontend framework | Next.js 15 + TypeScript        | Vite SPA, Remix                     |
| CSS approach       | CSS Custom Properties + Inline | TailwindCSS utilities (mantido como suporte) |
| Backend/BaaS       | Supabase                       | Firebase, PocketBase, NestJS custom |
| Database           | PostgreSQL (via Supabase)      | MongoDB, SQLite                     |
| Auth               | Supabase Auth (Magic Link)     | Auth0, NextAuth, custom JWT         |
| Deploy             | Vercel + Supabase Cloud        | AWS, Railway, Render                |
| IA provider        | Anthropic (claude-haiku-4-5)   | OpenAI GPT-4o-mini                  |
| Observabilidade    | Sentry + PostHog               | Datadog, Mixpanel                   |
| CI/CD              | Vercel (auto-deploy main)      | GitHub Actions dedicado             |

---

## Critérios de saída por versão

| Versão | Critério de saída                                                           | Status |
| ------ | --------------------------------------------------------------------------- | ------ |
| v1.1   | Export/Import funcional + sm2() testado + 0 bugs críticos                   | ✅     |
| v1.2   | Auth funcionando + 100% dados em PostgreSQL + deploy no ar                  | ✅     |
| v1.3   | Motor cognitivo + PostHog capturando eventos + mobile responsivo            | ✅     |
| v2.0   | LGPD auditado + IA gerando flashcards + PWA instalável + Core Web Vitals    | ✅     |
| v2.1   | Gamificação v2 ✅ + Google OAuth + CI/CD E2E + Soft Delete/Undo + Ordenação trilha | 🔁 Em progresso |
| v2.2   | IA: lacunas cognitivas + SM-2 backend + RBAC multi-tenant                   | 🔜     |
| v2.3   | Escalabilidade: React Query + virtualização + infinite scroll               | 🔜     |
