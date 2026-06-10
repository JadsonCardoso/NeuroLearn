# Architecture

**Pattern:** Next.js 15 App Router — SSR + Client Components + API Routes  
**Updated:** 2026-06-09 (auditoria completa pós-HOTFIX-CONSOLE-01)

---

## High-Level Structure

```
neurolearn.tech
├── Landing page (/)           → Server Component, SEO, OG tags
├── Auth (/auth/*)             → Magic Link (Supabase), callback PKCE
├── App (/dashboard, /library, ...)  → Client Components, proteção via middleware
└── API (/api/*)               → Route Handlers (ai, cron, push, user, sentry-tunnel)
```

---

## Camadas de Arquitetura

```
┌─────────────────────────────────────────────┐
│  Pages (app/)                               │
│  Next.js pages — Server Components           │
│  Renderizam módulos, passam metadata        │
├─────────────────────────────────────────────┤
│  Modules (modules/)                         │
│  Feature views — Client Components          │
│  Lógica de apresentação da feature          │
├─────────────────────────────────────────────┤
│  Components/UI (components/ui/)             │
│  Átomos reutilizáveis — sem contexto externo│
├─────────────────────────────────────────────┤
│  Store (store/)                             │
│  AppContext + useReducer                    │
│  Estado global + side effects async        │
├─────────────────────────────────────────────┤
│  Services (services/)                       │
│  Data access layer — Supabase queries       │
├─────────────────────────────────────────────┤
│  Engine (engine/)                           │
│  Algoritmos cognitivos puros (zero I/O)     │
├─────────────────────────────────────────────┤
│  Lib (lib/)                                 │
│  Infraestrutura: Supabase client, AI, Sec.  │
└─────────────────────────────────────────────┘
```

---

## Fluxo de Autenticação

```
Usuário → /auth/login (Magic Link)
  → supabase.auth.signInWithOtp()
    → email com link → usuário clica
      → /auth/callback?code=PKCE_TOKEN
        → exchangeCodeForSession(code)
          → session JWT no cookie
            → redirect → /dashboard

Middleware (src/middleware.ts):
  → A cada request em /app/*
    → getUser() via cookie
      → sem sessão → redirect /auth/login
      → com sessão → allow request
```

---

## Estado Global (AppContext)

```typescript
interface AppState {
  contents: Content[] // conteúdos do usuário
  cards: FlashCard[] // todos os flashcards (filtrar por cid na UI)
  skills: Skill[] // habilidades e XP
  sessions: StudySession[] // últimas 30 sessões (carregado do Supabase)
  streak: number // dias consecutivos
  lastStudyDate: string // ISO date string
  totalXp: number // XP total acumulado
}
```

**13 action types:**  
LOAD_STATE | ADD_CONTENT | UPDATE_CONTENT | DELETE_CONTENT | UPDATE_CONTENT_PROGRESS |  
ADD_CARDS | DELETE_CARD | UPDATE_CARD | RATE_CARD |  
ADD_SKILL | DELETE_SKILL | GAIN_XP |  
FINISH_SESSION | EARN_XP | UPDATE_STREAK

**Pattern de acesso:** Apenas via `useAppData()` hook.  
**Side effects:** Dispatch override assíncrono persiste mudanças no Supabase após update do estado local.

---

## Algoritmos Cognitivos (engine/)

**Princípio:** Funções puras — zero I/O, zero side effects, 100% testável.

```
engine/
├── spaced-repetition/
│   ├── sm2.ts           → SM-2 aprimorado com bônus tempo de resposta
│   └── scheduling.ts    → fila de cards due para revisão
├── retention/
│   ├── retentionModel.ts  → R = e^(-t/S), Ebbinghaus exponential decay
│   └── forgettingRisk.ts  → risco de esquecimento por card
├── mastery/
│   ├── masteryScore.ts   → score 0-100 de domínio (mastery × retenção)
│   └── levelUp.ts        → calculateLevelUp() — pure function
├── cognitive-score/
│   └── cognitiveScore.ts → 35% retenção + 30% mastery + 20% consistência + 15% ativo
├── active-learning/
│   └── activeLearningScore.ts → Pirâmide de Glasser
├── skill-evolution/
│   └── skillProgression.ts → velocity, daysToLevelUp, trend
└── achievements/
    └── index.ts          → lógica de badges/conquistas
```

---

## API Routes (app/api/)

| Route                          | Método      | Auth    | Propósito                   |
| ------------------------------ | ----------- | ------- | --------------------------- |
| `/api/ai/generate-flashcards`  | POST        | JWT     | GPT-4o-mini → cards         |
| `/api/ai/generate-quiz`        | POST        | JWT     | GPT-4o-mini → distratores   |
| `/api/ai/analyze-teaching`     | POST        | JWT     | GPT-4o-mini → análise texto |
| `/api/ai/cognitive-coach`      | POST        | JWT     | GPT-4o-mini → coaching      |
| `/api/cron/retention-snapshot` | GET         | Bearer  | Job diário 03h UTC          |
| `/api/push/subscribe`          | POST/DELETE | JWT     | Web Push subscriptions      |
| `/api/push/notify`             | POST        | Backend | Envia push notifications    |
| `/api/user/delete`             | DELETE      | JWT     | GDPR data deletion          |
| `/api/health`                  | GET         | —       | Uptime monitoring           |
| `/api/sentry-tunnel`           | POST        | —       | CSP proxy para Sentry       |
| `/api/waitlist`                | POST        | —       | Cadastro waitlist           |

---

## Segurança

### Content Security Policy (next.config.ts)

- `script-src`: self + PostHog CDN (us/eu-assets.i.posthog.com)
- `connect-src`: self + Supabase + Sentry + PostHog
- `worker-src`: self + blob: (PostHog Session Replay, PWA Service Worker)
- `frame-src`: none
- Sentry usa tunnel `/api/sentry-tunnel` para contornar adblockers

### Supabase RLS

- Todas as tabelas têm RLS ativo
- Policies: `auth.uid() = user_id` (isolamento por usuário)
- Super admin: função `SECURITY DEFINER get_my_role()` (sem recursão)

### Rate Limiting

- In-memory Map por IP (dev/single-instance)
- `TODO (ARCHITECTURE-REFINE-02)`: Migrar para Upstash Redis em produção multi-instance

### Headers de Segurança

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` (produção only)
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## Deploy (Vercel)

```
GitHub push → Vercel CI → next build → deploy Edge Network
  ↓
vercel.json
  ├── crons:
  │   ├── /api/cron/retention-snapshot → 0 3 * * * (03h UTC)
  │   └── /api/push/notify → 0 8 * * * (08h UTC)
  └── (sem headers — CSP via next.config.ts)
```

---

## PWA

- Manifest: `public/manifest.webmanifest`
- Service Worker: `public/sw.js` (cache-first shell, network-first API)
- Push: VAPID keys, `/api/push/subscribe` e `/api/push/notify`
- Instalável em Android, iOS (via Add to Home Screen) e Desktop

---

## Observabilidade

- **Sentry**: Client-side via `instrumentation-client.ts` (tunnel + ignoreErrors configurados)
- **PostHog**: Via `PostHogProvider` + `AnalyticsIdentifier` + `analyticsService`
- **Cognitive Events**: Tabela `cognitive_events` no Supabase para analytics de produto

---

## Regras de Dependência (nunca violar)

```
pages → modules → components/ui         ✅
pages → store (via hooks)               ✅
modules → store (via useAppData)        ✅
modules → services                      ❌ (usar via store/dispatch)
services → lib/supabase                 ✅
engine/* → zero dependências externas   ✅ (funções puras)
components/ui → zero contextos externos ✅ (apenas props)
```
