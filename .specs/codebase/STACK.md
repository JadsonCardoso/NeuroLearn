# Tech Stack

**Analyzed:** 2026-06-09  
**Updated:** 2026-06-09 — Reflete o package.json atual (v2.0)

---

## Stack Atual — v2.0 (Next.js 15 + Supabase)

### Frontend

| Tecnologia   | Versão   | Uso                                         |
| ------------ | -------- | ------------------------------------------- |
| Next.js      | ^15.3.3  | App Router, SSR/SSG, API Routes, Middleware |
| React        | ^19.0.0  | UI, hooks, Context                          |
| React DOM    | ^19.0.0  | Renderer                                    |
| TypeScript   | ^5.7.0   | Tipagem estrita, strict mode                |
| TailwindCSS  | ^3.4.17  | Utility-first styling                       |
| PostCSS      | ^8.5.15  | Processing Tailwind                         |
| Autoprefixer | ^10.4.20 | CSS vendor prefixes                         |

### Formulários & Validação

| Tecnologia          | Versão  | Uso                                  |
| ------------------- | ------- | ------------------------------------ |
| React Hook Form     | ^7.77.0 | Formulários performáticos            |
| @hookform/resolvers | ^5.4.0  | Integração com Zod                   |
| Zod                 | ^4.4.3  | Schemas de validação client + server |

### Backend / BaaS

| Tecnologia            | Versão   | Uso                                    |
| --------------------- | -------- | -------------------------------------- |
| @supabase/supabase-js | ^2.107.0 | PostgreSQL client, Realtime            |
| @supabase/ssr         | ^0.10.3  | Server-side auth (cookies, middleware) |

### IA

| Tecnologia | Versão  | Uso                                                    |
| ---------- | ------- | ------------------------------------------------------ |
| openai     | ^6.42.0 | GPT-4o-mini para geração de flashcards, quiz, coaching |

### Push Notifications

| Tecnologia | Versão | Uso                                     |
| ---------- | ------ | --------------------------------------- |
| web-push   | ^3.6.7 | VAPID keys, envio de push notifications |

### Observabilidade

| Tecnologia     | Versão   | Uso                                         |
| -------------- | -------- | ------------------------------------------- |
| @sentry/nextjs | ^10.56.0 | Error tracking, Session Replay, performance |
| posthog-js     | ^1.382.0 | Product analytics, eventos cognitivos       |

---

## Dev Dependencies

| Tecnologia                      | Versão  | Uso                                              |
| ------------------------------- | ------- | ------------------------------------------------ |
| Vitest                          | ^4.1.8  | Testes unitários                                 |
| @vitest/coverage-v8             | ^4.1.8  | Coverage reports                                 |
| @playwright/test                | ^1.60.0 | Testes E2E                                       |
| @testing-library/react          | ^16.3.2 | Render de componentes em testes                  |
| @testing-library/user-event     | ^14.6.1 | Simulação de eventos de usuário                  |
| @testing-library/jest-dom       | ^6.9.1  | Matchers DOM                                     |
| jsdom                           | ^29.1.1 | DOM virtual para Vitest                          |
| eslint                          | ^9.0.0  | Linting                                          |
| eslint-config-next              | ^15.3.3 | Regras Next.js                                   |
| eslint-config-prettier          | ^10.1.8 | Desativa regras ESLint conflitantes com Prettier |
| prettier                        | ^3.4.2  | Formatação de código                             |
| husky                           | ^9.1.7  | Git hooks (pre-commit, commit-msg, pre-push)     |
| lint-staged                     | ^17.0.7 | Lint + format apenas arquivos staged             |
| @commitlint/cli                 | ^21.0.2 | Valida mensagens de commit                       |
| @commitlint/config-conventional | ^21.0.2 | Regras Conventional Commits                      |
| docx                            | ^9.7.1  | Geração de DOCX (gerar-doc.js)                   |
| pdfkit                          | ^0.18.0 | Geração de PDF (gerar-pdf.js)                    |

---

## Infraestrutura

| Serviço        | Uso                                                   |
| -------------- | ----------------------------------------------------- |
| Vercel         | Deploy Next.js, Edge Network, CI/CD automático        |
| Vercel Cron    | Job diário `/api/cron/retention-snapshot` (03:00 UTC) |
| Supabase Cloud | PostgreSQL, Auth, RLS, Storage                        |
| GitHub         | Source control                                        |

---

## Scripts Disponíveis

```bash
npm run dev          # Servidor dev na porta 3003
npm run dev:clean    # Dev com cache .next limpo (após build ou erros 500)
npm run build        # Build de produção
npm run start        # Start servidor produção porta 3003
npm run lint         # ESLint
npm run type-check   # tsc --noEmit (zero erros exigido)
npm run test:unit    # Vitest (28 arquivos de teste, 369+ testes)
npm run prepare      # Instala hooks Husky (roda automaticamente no npm install)
npm run test:e2e     # Playwright (testes autenticados e não-autenticados)
npm run generate-doc # Gera DOCX a partir de docs/**/*.md
npm run generate-pdf # Gera PDF a partir de docs/**/*.md
```

---

## Variáveis de Ambiente

### Client-side (NEXT*PUBLIC*\*)

| Variável                        | Uso                                      |
| ------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL do projeto Supabase                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key pública                         |
| `NEXT_PUBLIC_SENTRY_DSN`        | DSN do Sentry                            |
| `NEXT_PUBLIC_POSTHOG_KEY`       | Key do PostHog                           |
| `NEXT_PUBLIC_POSTHOG_HOST`      | Host do PostHog                          |
| `NEXT_PUBLIC_SITE_URL`          | URL canônica (`https://neurolearn.tech`) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`  | Public key para Web Push                 |

### Server-side (nunca expostas ao cliente)

| Variável                    | Uso                                                |
| --------------------------- | -------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations (push/notify, user delete, crons) |
| `OPENAI_API_KEY`            | GPT-4o-mini                                        |
| `SENTRY_AUTH_TOKEN`         | Source maps upload                                 |
| `SENTRY_ORG`                | Org slug no Sentry                                 |
| `SENTRY_PROJECT`            | Project slug no Sentry                             |
| `CRON_SECRET`               | Autenticação dos jobs Vercel Cron                  |
| `VAPID_PRIVATE_KEY`         | Assinar push notifications                         |
| `VAPID_EMAIL`               | Contato VAPID                                      |

---

## Browsers Suportados

| Browser       | Versão mínima |
| ------------- | ------------- |
| Chrome        | 90+           |
| Edge          | 90+           |
| Firefox       | 88+           |
| Safari        | 14+           |
| Mobile Chrome | 90+           |
| Mobile Safari | 14+           |
