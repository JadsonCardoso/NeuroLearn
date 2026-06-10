# Feature Spec — Observabilidade

**ID:** F-033
**Status:** 🔜 Planned (v1.3 parcial, v2.0 completo)
**Complexidade:** Média (v1.3) / Grande (v2.0)

## Overview

Observabilidade em 3 dimensões: erros técnicos (Sentry), comportamento do produto (PostHog) e eventos cognitivos (tabela interna). O diferencial competitivo do NeuroLearn é medir o que importa: retenção real, não pageviews.

---

## Requirements

### R-033-01 — Error tracking com Sentry (v1.3)

**Instalação:**

```bash
npx @sentry/wizard@latest -i nextjs
```

**Configuração obrigatória:**

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% das transações
  replaysSessionSampleRate: 0.05, // 5% das sessões
  replaysOnErrorSampleRate: 1.0, // 100% das sessões com erro
  integrations: [Sentry.replayIntegration()],
})
```

**Alertas obrigatórios:**
| Evento | Threshold | Canal |
|--------|-----------|-------|
| Error rate > 1% | p95 em 5min | Email |
| SM-2 calculation error | Qualquer ocorrência | Email + Slack |
| Auth failure spike | > 20/min | Email |
| API latency > 3s | p95 | Email |

**Done when:** Primeiro erro em produção aparece no Sentry com stack trace completo e user context.

---

### R-033-02 — Product Analytics com PostHog (v1.3)

**Instalação:**

```typescript
// app/providers.tsx
import posthog from 'posthog-js'
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  capture_pageview: false, // capturar manualmente para SPAs
  person_profiles: 'identified_only', // LGPD: só perfis autenticados
})
```

**Eventos de produto a capturar:**

| Evento                    | Quando capturar             | Propriedades                              |
| ------------------------- | --------------------------- | ----------------------------------------- |
| `session_started`         | Início da Sessão de Foco    | content_id, content_type                  |
| `session_completed`       | Finalizar sessão 3 fases    | duration, cards_created, teach_word_count |
| `review_completed`        | Após avaliar card           | quality, mastery, response_time_ms        |
| `active_learning_saved`   | Salvar no Aprendizado Ativo | mode, word_count, xp_gained               |
| `skill_leveled_up`        | Level up na Árvore          | skill_name, old_level, new_level          |
| `ai_flashcards_generated` | Usar IA para gerar cards    | cards_count, content_type                 |
| `teach_analysis_viewed`   | Ver feedback da IA          | clarity_score, coverage_score             |

**Funnels críticos a monitorar:**

1. Signup → Primeiro conteúdo adicionado → Primeira sessão completa
2. Dashboard aberto → Revisão iniciada → Todos os cards revisados
3. Modo Professor → Texto salvo com > 50 palavras

**Done when:** Funnel "signup → primeira sessão completa" visível no PostHog com dados reais.

---

### R-033-03 — Eventos cognitivos (tabela interna)

**Diferencial:** PostHog captura comportamento de produto; a tabela `cognitive_events` captura o estado cognitivo do usuário — mais granular e privado (não sai para terceiros).

**Eventos cognitivos obrigatórios:**

```typescript
type CognitiveEventType =
  | 'review_completed' // card revisado
  | 'retention_milestone' // retenção atingiu 75%, 90%
  | 'forgetting_risk_alert' // card caiu abaixo de 50%
  | 'streak_extended' // streak incrementou
  | 'streak_broken' // streak resetou
  | 'skill_mastered' // skill atingiu nível 3+
  | 'teach_quality_high' // Modo Professor com score > 80
  | 'active_recall_high' // resposta rápida (< 3s) na revisão
  | 'consistency_7d' // 7 dias consecutivos de prática
  | 'weekly_summary' // resumo semanal gerado
```

**Done when:** Dashboard mostra gráfico de eventos cognitivos da última semana.

---

### R-033-04 — Core Web Vitals (v2.0)

**Metas obrigatórias:**

| Métrica                         | Meta    | Ferramenta de medição |
| ------------------------------- | ------- | --------------------- |
| LCP (Largest Contentful Paint)  | < 2.5s  | Vercel Analytics      |
| INP (Interaction to Next Paint) | < 200ms | Vercel Analytics      |
| CLS (Cumulative Layout Shift)   | < 0.1   | Vercel Analytics      |
| TTFB (Time to First Byte)       | < 600ms | Vercel Analytics      |

**Done when:** Vercel Analytics mostra ≥90% das visitas dentro das metas do "Good" threshold.

---

### R-033-05 — Dashboard de observabilidade interno (v2.0)

**Página `/admin/observability` (role = admin):**

| Seção              | Dados                                              |
| ------------------ | -------------------------------------------------- |
| Saúde do sistema   | Error rate, latência API, uptime                   |
| Engajamento        | DAU/MAU, sessões/dia, revisões/dia                 |
| Retenção cognitiva | Retenção média da plataforma, distribuição mastery |
| IA usage           | Chamadas/dia, custo estimado, cache hit rate       |
| Eventos críticos   | Últimas 24h de erros, streaks quebrados, alertas   |

**Done when:** Admin vê dashboard sem precisar acessar ferramentas externas.

---

## Tabela de eventos (cognitive_events) — ver database-schema/spec.md

## Não inclui

- Grafana / OpenTelemetry (v3.0 — necessário quando sair do Supabase managed)
- Real User Monitoring avançado (v2.0+)
- A/B testing formal (v2.0 via PostHog Experiments)
