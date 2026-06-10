# NeuroLearn

**Vision:** Uma plataforma cognitiva orientada por neurociência, dados e inteligência adaptativa — que transforma qualquer conteúdo em memória consolidada, habilidade prática e evolução mensurável.

**For:** Profissionais de produto, tecnologia e áreas do conhecimento que estudam muito e retêm pouco. Também para equipes que precisam garantir aprendizado real no onboarding e treinamentos.

**Solves:** O gap entre consumo de conteúdo e retenção real. Não é um app de estudos — é um Sistema Operacional de Aprendizagem que sustenta ciclos cognitivos completos: Consumir → Recordar → Explicar → Aplicar → Revisar → Consolidar.

---

## Goals

### Produto

- **Retenção ≥75%** após 30 dias nos conteúdos estudados (vs. <10% sem o sistema)
- **North Star:** quantidade de habilidades consolidadas (nível ≥3) por usuário ativo por mês
- **Consistência:** streak médio ≥14 dias entre usuários que retornam ao app
- **Engajamento ativo:** ≥70% das sessões completam as 3 fases (Foco + Extração + Modo Professor)

### Plataforma (visão de longo prazo)

- Motor cognitivo adaptativo com IA — personaliza dificuldade, detecta lacunas, sugere reforço
- Plataforma segura e LGPD-compliant para dados cognitivos sensíveis
- Escalável para uso corporativo (onboarding, certificações, treinamentos técnicos)
- Observabilidade completa de eventos cognitivos (revisões, retenção, recuperação ativa)

---

## Tech Stack

### Atual — v1.0 (SPA local)

- **Framework:** React 18 via CDN
- **Language:** JavaScript + JSX (Babel Standalone, runtime)
- **Database:** localStorage (client-side only)
- **Styling:** CSS Custom Properties inline

### Target — v2.0 (Plataforma)

| Camada          | Tecnologia               | Motivo                                              |
| --------------- | ------------------------ | --------------------------------------------------- |
| Frontend        | Next.js 14+ + TypeScript | SSR, SEO, performance, tipagem                      |
| Styling         | TailwindCSS              | Utility-first, design system escalável              |
| Backend/BaaS    | Supabase                 | PostgreSQL, Auth, Realtime, Storage, Edge Functions |
| ORM             | Prisma                   | Type-safe queries, migrations versionadas           |
| Auth            | Supabase Auth            | JWT, OAuth, Magic Link, MFA                         |
| Motor cognitivo | Node.js (Edge Functions) | SM-2 + IA adaptativa                                |
| IA              | OpenAI / Anthropic API   | Geração de flashcards, análise de explicações       |
| Observabilidade | Sentry + PostHog         | Error tracking + product analytics                  |
| Infra           | Vercel + Supabase Cloud  | Deploy contínuo, escala global                      |

---

## Scope por versão

### v1.0 — MVP local ✅ COMPLETO

- SPA single-file com 8 módulos funcionais
- SM-2 + Ebbinghaus + Glasser implementados
- Dark/Light mode, localStorage persistence
- Landing page + Documentação PDF/DOCX

### v1.1 — Robustez (próximo sprint)

- Export/Import JSON de dados
- Validação de schema no load()
- Configurações e reset de dados
- Testes unitários dos algoritmos core

### v1.2 — Migração técnica

- Migrar para Next.js + TypeScript + TailwindCSS
- Integrar Supabase (Auth + PostgreSQL)
- Deploy em Vercel

### v1.3 — Motor Cognitivo

- Motor de retenção no backend
- Revisões adaptativas baseadas em comportamento
- Dashboard de analytics cognitivo

### v2.0 — Plataforma

- IA: geração de flashcards, análise de Modo Professor
- PWA + notificações push
- RBAC multi-perfil (aluno, mentor, admin)
- SEO + blog educacional
- Observabilidade completa (Sentry, PostHog)
- LGPD compliance

---

## Constraints

| Dimensão        | v1.x          | v2.0                                     |
| --------------- | ------------- | ---------------------------------------- |
| Runtime         | Browser only  | Browser + Node.js (Edge)                 |
| Auth            | Sem auth      | Supabase Auth obrigatório                |
| Dados           | localStorage  | PostgreSQL + RLS                         |
| Performance     | <3s load (4G) | LCP <2.5s, INP <200ms, CLS <0.1          |
| Segurança       | N/A           | RBAC + LGPD + rate limiting + audit logs |
| Disponibilidade | Arquivo local | 99.9% SLA (Vercel + Supabase)            |

---

## Princípios de Design da Plataforma

1. **Retenção primeiro** — toda decisão técnica prioriza a consolidação cognitiva do usuário
2. **Leveza cognitiva** — a interface reduz distrações, não adiciona ruído
3. **Segurança como requisito de negócio** — dados cognitivos são sensíveis
4. **Observabilidade nativa** — eventos cognitivos são rastreados desde o início
5. **IA como potencializador** — não substitui o aprendizado, amplifica a retenção
