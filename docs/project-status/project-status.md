# NeuroLearn — Status do Projeto

**Versão:** 2.1  
**Última atualização:** 2026-06-08  
**Status geral:** MVP em desenvolvimento ativo — Fases 1–4 + UX-01 + QA-01 + Sprints 1–4 + OBS-01 concluídas

---

## Visão Geral

O NeuroLearn é uma plataforma cognitiva de aprendizagem baseada em neurociência. Seu objetivo é transformar consumo passivo de conteúdo em retenção de longo prazo, desenvolvimento de habilidades e consolidação cognitiva através de revisão espaçada, aprendizado ativo e gamificação inteligente.

**Posicionamento:** "Sistema Operacional de Aprendizagem" — o usuário não sente que está apenas estudando, sente que está evoluindo cognitivamente.

### Progresso do MVP

| Componente | Status | Progresso |
|---|---|---|
| Infraestrutura (Next.js 15 + Supabase) | ✅ Concluído | 100% |
| Autenticação (Magic Link) | ✅ Concluído | 100% |
| Biblioteca de Conteúdo | ✅ Concluído | 100% |
| Cognitive Engine (algoritmos) | ✅ Concluído | 100% |
| Sistema de Revisão Espaçada (SM-2) | ✅ Concluído | 100% |
| Sessão de Foco | ✅ Concluído | 70% |
| Flashcards | ✅ Concluído | 100% |
| Skill Tree | ✅ Concluído | 80% |
| Dashboard Cognitivo | 🔄 Parcial | 50% |
| Segurança (OWASP + LGPD) | ✅ Concluído | 100% |
| Sistema de Validação UX | ✅ Concluído | 100% |
| Infraestrutura de Testes | ✅ Concluído | 100% |
| Observabilidade (Sentry + PostHog) | ✅ Concluído | 100% |
| IA (Geração de Flashcards + Coach + Quiz + Análise) | ✅ Concluído | 100% |
| Gamificação (Conquistas) | ✅ Concluído | 40% |
| Dashboard com métricas reais | ✅ Concluído | 100% |
| Configurações + Export/Import JSON | ✅ Concluído | 100% |
| PWA (Instalável + Push Notifications) | ✅ Concluído | 100% |

---

## Stack Atual

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 15.3.3 |
| UI Library | React | 19 |
| Linguagem | TypeScript | 5.7 (strict) |
| Estilização | TailwindCSS | 3.4 |
| Backend/Auth | Supabase | latest |
| Banco de Dados | PostgreSQL | via Supabase |
| Validação | Zod | 4.4.3 |
| Formulários | React Hook Form | latest |
| Testes Unitários | Vitest | 4.1.8 |
| Testes E2E | Playwright | 1.60.0 |
| Error Tracking | Sentry | 10.x |
| Product Analytics | PostHog | latest |
| Test Utilities | @testing-library/react | latest |
| Linter | ESLint + Next.js config | 9 |
| Porta Dev | localhost | 3003 |

---

## Funcionalidades Implementadas

### Fase 1 — Infraestrutura e Migração

- Migração de SPA monolítica (index.html + React CDN) para Next.js 15 App Router
- TypeScript strict (zero `any`)
- TailwindCSS com design system dark/light via CSS custom properties
- Estrutura de pastas modular: `app/`, `components/`, `modules/`, `engine/`, `services/`, `store/`, `hooks/`, `lib/`, `types/`
- Sistema de temas dark/light com flash-prevention (script inline no `<head>`)
- Landing page em `public/landing.html`
- Super admin configurado

### Fase 2 — Integração Supabase

- Auth via Magic Link com callback em `/auth/callback`
- Middleware Next.js protegendo todas as rotas `/app/*`
- Schema completo com 9 tabelas + RLS ativo em todas
- Trigger `on_auth_user_created` para criação automática de perfil
- AppContext com carregamento paralelo de 4 queries no mount
- Fallback para localStorage (modo offline/dev)
- API Route `DELETE /api/user/delete` para conformidade LGPD
- Banner de consentimento LGPD

### Fase 3 — Cognitive Engine

6 módulos de algoritmos cognitivos com 76 testes unitários:

| Módulo | Algoritmo |
|---|---|
| SM-2 aprimorado | `EF_new = max(1.3, EF + 0.1 − (5−q)(0.08+(5−q)×0.02)) + bônus responseTime` |
| Modelo de Retenção | Ebbinghaus: `R(t) = 100 × e^(−t/S)`, `S = intervalDays × easeFactor` |
| Risco de Esquecimento | high: R<40 ou vencido; medium: R<65 ou vence<1d; low: demais |
| Fila de Revisão | Ordena por risco (high→medium→low), desempate por nextReview |
| Mastery Score | `base(mastery) × min(1, R/100)` → 0–100 por card e por conteúdo |
| Skill Evolution | velocity = avg(XP últimos 7d), daysToLevelUp, trend por metades |
| Active Learning | Pirâmide de Glasser: notas×10% + destaques×20% + ensino×30% + recall×40% |
| Cognitive Score | `retention×0.35 + mastery×0.30 + consistency×0.20 + activeLearning×0.15` |

### Fase 4 — Segurança

- HTTP Security Headers: CSP, HSTS, X-Frame-Options:DENY, X-Content-Type-Options
- Rate Limiting: 5 req/15min por IP em `/auth/*`
- Validação de inputs: schemas Zod para todos os formulários
- Sanitização: stripHtml, escapeHtml, sanitizeFileName, isValidMimeType
- RBAC: hierarquia `user → admin → super_admin`, middleware em `/api/admin/*`
- Security Logger: JSON estruturado, sanitização de campos sensíveis
- LGPD: banner de consentimento + exclusão completa de dados via API

### UX-01 — Sistema Global de Validação

- Componentes: `FormField`, `FormError`, `FormHint`, `LoadingButton`
- Formulários refatorados: Login, Signup, AddContentModal
- React Hook Form + zodResolver em todos os formulários
- `novalidate` em todos os forms (sem popup nativo do browser)
- Mensagens de erro em PT-BR com `role="alert"`
- `setFocus` no primeiro campo com erro
- `aria-describedby` conectando campos a erros e hints
- Labels com asterisco (*) para campos obrigatórios

### QA-01 — Engenharia de Qualidade

- 260 testes unitários passando (21 arquivos Vitest)
- 7 specs Playwright (multi-project: setup / chromium / authenticated)
- Testing Library + jsdom para testes de componentes
- Mock pattern para Supabase (builder chain)
- Page Objects: LibraryPage, ReviewPage
- Auth E2E via Supabase Admin API → storageState
- Thresholds de cobertura: 80% statements/functions/lines, 70% branches

---

## Funcionalidades Pendentes

### Dashboard Real (Fase 5 — prioritária)
- [ ] Métricas de retenção lidas do Supabase (não apenas localStorage)
- [ ] Usar `calcCognitiveScore`, `calcRetention`, `buildReviewQueue` no DashboardView
- [ ] Cards "em risco" baseados em `forgettingRisk`
- [ ] Gráfico de progresso por conteúdo
- [ ] Streak real persistido no banco
- [ ] Leaderboard básico

### API Routes + Edge Functions (Fase 5)
- [ ] `POST /api/review/rate` — endpoint de revisão usando SM-2 aprimorado
- [ ] Edge Function `daily-retention-snapshot` — snapshot diário de retenção
- [ ] Geração automática de flashcards via Anthropic API
- [ ] Sugestão de conteúdos baseada em retenção e cognitive score

### Gamificação Avançada (Fase 6)
- [ ] Sistema de conquistas (badges) por marcos cognitivos
- [ ] Missões diárias e semanais
- [ ] Ranking entre usuários
- [ ] Notificações de revisão agendada

### Painel Admin e Configurações (Fase 7)
- [ ] Painel super admin (gestão de usuários, analytics globais)
- [ ] Configurações de perfil (avatar, preferências)
- [ ] Exportação de dados pessoais (LGPD)
- [ ] Google OAuth ativo no dashboard Supabase

---

## Status por Camada

### Frontend

| Item | Status | Observação |
|---|---|---|
| Roteamento (App Router) | ✅ | Middleware protegendo `/app/*` |
| Autenticação UI | ✅ | Login + Signup com Magic Link |
| Biblioteca | ✅ | CRUD + modal com validação |
| Sessão de Foco | 🔄 | Falta highlights e timer Pomodoro real |
| Revisão (Flashcards SM-2) | ✅ | Interface de revisão funcional |
| Dashboard | 🔄 | Métricas parcialmente reais |
| Skills | ✅ | CRUD + cálculo de progressão |
| Tema dark/light | ✅ | Flash-prevention implementado |
| Acessibilidade | ✅ | Labels, aria-*, role=alert, keyboard nav |
| Responsividade | 🔄 | Desktop prioritário; mobile parcial |

### Backend (Supabase)

| Item | Status | Observação |
|---|---|---|
| Auth (Magic Link) | ✅ | Rate limit free tier pode ocorrer |
| RLS em todas as tabelas | ✅ | `auth.uid() = user_id` |
| Schema de 9 tabelas | ✅ | Migrações aplicadas |
| Trigger de criação de usuário | ✅ | `on_auth_user_created` |
| Edge Functions | 🔜 | `daily-retention-snapshot` pendente |
| Google OAuth | 🔜 | Código pronto; falta Client ID/Secret |
| Backups | 🔜 | Dependente do plano Supabase |

### Cognitive Engine

| Módulo | Status | Testes |
|---|---|---|
| SM-2 aprimorado | ✅ | 17 testes |
| Retention Model | ✅ | 10 testes |
| Forgetting Risk | ✅ | 8 testes |
| Scheduling (fila de revisão) | ✅ | 8 testes |
| Mastery Score | ✅ | 9 testes |
| Skill Evolution | ✅ | 7 testes |
| Active Learning Score | ✅ | 8 testes |
| Cognitive Score | ✅ | 9 testes |

### IA

| Item | Status | Observação |
|---|---|---|
| Cliente OpenAI configurado | ✅ | `OPENAI_API_KEY` em `.env.local` |
| Cliente Anthropic configurado | ✅ | `ANTHROPIC_API_KEY` em `.env.local` |
| Prompts estruturados | ✅ | `src/lib/ai/prompts.ts` |
| Geração de flashcards | 🔜 | API route pendente |
| Geração de quizzes | 🔜 | Fase 2 |
| Resumo de conteúdo | 🔜 | Fase 2 |

### Segurança

| Item | Status | Referência |
|---|---|---|
| A01 Broken Access Control | ✅ | Middleware + RLS + RBAC |
| A02 Cryptographic Failures | ✅ | Supabase bcrypt/RS256 + HSTS |
| A03 Injection | ✅ | Zod + escapeHtml + Supabase parametrizado |
| A04 Insecure Design | ✅ | Rate limiting + LGPD consent |
| A05 Security Misconfiguration | ✅ | Security headers completos |
| A06 Vulnerable Components | 🔄 | npm audit ok; Dependabot pendente |
| A07 Auth Failures | ✅ | Rate limiting + Supabase Auth |
| A08 Data Integrity | 🔄 | CSP + MIME validation implementados |
| A09 Security Logging | 🔄 | Logger implementado; Sentry pendente |
| A10 SSRF | N/A | Sem requests a URLs de usuário |

### Testes

| Tipo | Quantidade | Comando |
|---|---|---|
| Unitários (Vitest) | 260 passando | `npm run test:unit` |
| E2E (Playwright) | 7 specs (3 projetos) | `npm run test:e2e` |
| Cobertura | threshold 80% | `npm run test:coverage` |

---

## Bugs Conhecidos

| ID | Descrição | Impacto | Status |
|---|---|---|---|
| BUG-AUTH-01 | Rate limit Supabase free tier no Magic Link (>3 emails/hora) | Médio | Mitigado (config ajustada) |
| BUG-MOBILE-01 | Layout mobile parcialmente responsivo em algumas telas | Baixo | Backlog |
| BUG-DASH-01 | Dashboard exibe métricas parcialmente do localStorage em vez do Supabase | Médio | Fase 5 |
| BUG-FOCUS-01 | Sessão de Foco não persiste highlights no banco | Alto | Fase 5 |

---

## Roadmap por Fase

### Fase 5 — Dashboard Real e API Routes (próxima)
**Objetivo:** Conectar o Cognitive Engine ao Supabase e exibir métricas reais.

Entregas previstas:
- Dashboard com métricas de retenção reais
- `POST /api/review/rate` usando SM-2
- Edge Function de snapshot diário
- Geração de flashcards via IA
- Streak real no banco

### Fase 6 — Gamificação Avançada
**Objetivo:** Aumentar engajamento com mecânicas inteligentes de progressão.

Entregas previstas:
- Sistema de badges por marcos cognitivos
- Missões diárias e semanais
- Ranking entre usuários
- Notificações de revisão

### Fase 7 — Admin e Configurações
**Objetivo:** Ferramentas de gestão e personalização.

Entregas previstas:
- Painel super admin
- Configurações de perfil
- Exportação de dados (LGPD)
- Google OAuth

### Fase 8 — IA Adaptativa (visão de longo prazo)
**Objetivo:** Personalização profunda baseada em comportamento cognitivo.

Entregas previstas:
- Currículo adaptativo por risco de esquecimento
- Geração dinâmica de quizzes contextuais
- Detecção automática de lacunas de conhecimento
- Second brain cognitiva

---

## Decisões Arquiteturais Importantes

| Decisão | Motivo |
|---|---|
| Next.js App Router em vez de Pages Router | Server components, layouts aninhados, melhor performance |
| Supabase em vez de backend próprio | Velocidade de desenvolvimento no MVP; migração para NestJS planejada na Fase 8 |
| localStorage como fallback | Garantir funcionamento offline e em desenvolvimento sem Supabase |
| Zod v4 com `.refine()` para email | `.email()` deprecado no Zod v4; regex garante validação consistente |
| `node` como ambiente padrão no Vitest | Algoritmos puros não precisam de DOM; jsdom somente onde necessário |
| Supabase Admin API para auth E2E | Magic Link não pode ser clicado automaticamente; `admin.generateLink` resolve |
| Porta 3003 em vez de 3000 | Evitar conflito com outras aplicações locais |

---

## Próximos Passos (priorizados)

1. **Fase 5 — Dashboard Real:** conectar `calcCognitiveScore` e `buildReviewQueue` ao DashboardView
2. **Fase 5 — API Route de Revisão:** `POST /api/review/rate` com SM-2 aprimorado
3. **Fase 5 — Geração de Flashcards IA:** endpoint usando Anthropic API
4. **Fase 5 — Sessão de Foco:** highlights persistidos no banco + timer Pomodoro real
5. **Fase 6 — Gamificação:** badges e missões diárias
6. **Fase 7 — Google OAuth:** ativar no dashboard Supabase

---

## Pontos de Atenção

- **Região Supabase `us-east-1`:** latência ~150ms do Brasil. Considerar migrar para `sa-east-1` em produção.
- **Senha do admin:** `NeuroLearn@2025!` é temporária — alterar antes de expor o app.
- **`.env.local`:** nunca commitar. Contém todas as chaves de API.
- **`SERVICE_ROLE_KEY`:** apenas no backend (Node.js). Nunca expor ao browser.
- **Google OAuth:** configurado no código mas precisa de Client ID/Secret no dashboard Supabase para ativar.
