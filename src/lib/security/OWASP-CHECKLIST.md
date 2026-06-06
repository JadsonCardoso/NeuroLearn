# OWASP Top 10 — Checklist NeuroLearn

> Atualizado: 2026-06-06 | Fase 4 — Segurança da Plataforma

## Legenda
- ✅ Mitigado
- 🔄 Parcialmente mitigado
- ⚠️ Pendente (próxima fase)
- N/A Não aplicável ao contexto atual

---

## A01 — Broken Access Control ✅

| Controle | Status | Implementação |
|----------|--------|---------------|
| Autenticação em rotas protegidas | ✅ | `middleware.ts` + `(app)/layout.tsx` dupla camada |
| Redirecionamento sem sessão | ✅ | Middleware redireciona para `/auth/login` |
| RBAC para rotas admin | ✅ | `middleware.ts` bloqueia `/api/admin/*` para não-admins |
| RLS no banco de dados | ✅ | Supabase RLS ativo em todas as tabelas (`auth.uid() = user_id`) |
| Isolamento de dados por usuário | ✅ | Todas as queries filtram por `user_id` via RLS |

---

## A02 — Cryptographic Failures ✅

| Controle | Status | Implementação |
|----------|--------|---------------|
| Senhas hasheadas | ✅ | Supabase usa bcrypt (padrão Supabase Auth) |
| Tokens JWT assinados | ✅ | Supabase Auth — RS256 |
| Cookies httpOnly | ✅ | `@supabase/ssr` define cookies httpOnly por padrão |
| HTTPS forçado | ✅ | HSTS em produção (`next.config.ts`) |
| Secrets no `.env.local` | ✅ | Nunca commitados; `.gitignore` inclui `.env*` |

---

## A03 — Injection ✅

| Controle | Status | Implementação |
|----------|--------|---------------|
| SQL Injection | ✅ | Supabase client usa queries parametrizadas nativamente |
| XSS via inputs | ✅ | `escapeHtml()` + `stripHtml()` em `sanitize.ts` |
| Validação de inputs | ✅ | Schemas Zod em `validation.ts` |
| Path traversal em uploads | ✅ | `sanitizeFileName()` em `sanitize.ts` |
| Sanitização de strings | ✅ | `sanitizeString()` em `validation.ts` |

---

## A04 — Insecure Design 🔄

| Controle | Status | Implementação |
|----------|--------|---------------|
| Rate limiting em auth | ✅ | `rateLimit.ts` — 5 req/15min por IP |
| Proteção brute force | ✅ | Middleware retorna 429 + `Retry-After` |
| LGPD consentimento | ✅ | `ConsentBanner.tsx` |
| Minimização de dados | 🔄 | Não coletamos dados além do necessário (documentado) |
| Threat modeling documentado | 🔄 | Este checklist cobre os riscos principais |

---

## A05 — Security Misconfiguration ✅

| Controle | Status | Implementação |
|----------|--------|---------------|
| Security headers | ✅ | `next.config.ts`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| CSP configurado | ✅ | Restringe scripts, frames, form-action |
| `frame-ancestors 'none'` | ✅ | Previne clickjacking |
| Verbose errors em produção | ✅ | Next.js oculta stack traces em produção |
| Portas desnecessárias | N/A | Hospedagem gerenciada (Vercel/Supabase) |

---

## A06 — Vulnerable and Outdated Components 🔄

| Controle | Status | Implementação |
|----------|--------|---------------|
| Dependencies atualizadas | 🔄 | `npm audit` sem issues críticos no momento |
| Monitoramento de vulnerabilidades | ⚠️ | Recomendado: Dependabot / Snyk |
| Remoção de dependências não usadas | 🔄 | A verificar a cada release |

---

## A07 — Identification and Authentication Failures ✅

| Controle | Status | Implementação |
|----------|--------|---------------|
| Limite de tentativas de login | ✅ | Rate limiting 5/15min em `/auth/*` |
| Senhas fortes obrigatórias | ✅ | Mínimo 6 chars (Zod schema) |
| Magic Link disponível | ✅ | Alternativa sem senha via Supabase |
| Google OAuth | ✅ | Configurado via Supabase Auth |
| Sessão invalidada no logout | ✅ | `supabase.auth.signOut()` limpa cookies |
| Tokens de sessão httpOnly | ✅ | `@supabase/ssr` default |

---

## A08 — Software and Data Integrity Failures 🔄

| Controle | Status | Implementação |
|----------|--------|---------------|
| CSP previne scripts externos | ✅ | `script-src 'self'` no CSP |
| Sem CDN de terceiros sem SRI | ✅ | Todos os assets são self-hosted |
| Verificação de integridade de uploads | ⚠️ | Pendente: feature de uploads não implementada |
| MIME type validation | ✅ | `isValidMimeType()` em `sanitize.ts` |

---

## A09 — Security Logging and Monitoring Failures 🔄

| Controle | Status | Implementação |
|----------|--------|---------------|
| Log de eventos de segurança | ✅ | `logger.ts` — eventos estruturados JSON |
| Log de tentativas de login falhas | ✅ | `auth.login.failure` via logger |
| Log de rate limit excedido | ✅ | `rate_limit.exceeded` no middleware |
| Log de violação RBAC | ✅ | `rbac.violation` no middleware |
| Alertas em produção | ⚠️ | Recomendado: Sentry / Datadog |
| Audit trail no banco | ⚠️ | Próxima fase: Supabase Edge Function logs |

---

## A10 — Server-Side Request Forgery (SSRF) N/A

O NeuroLearn não faz requisições HTTP a URLs controladas pelo usuário.
Quando APIs externas forem adicionadas (ex: geração de flashcards via Anthropic),
revisar este item com uma allowlist de domínios permitidos.

---

## Itens para próximas fases

- [ ] Dependabot ou Snyk para alertas automáticos de vulnerabilidades
- [ ] Audit trail persistido no Supabase (Fase 5)
- [ ] Validação de uploads com MIME + tamanho (quando feature existir)
- [ ] Nonces CSP por request (elimina `unsafe-inline`)
- [ ] LGPD: endpoint de exportação de dados (`GET /api/user/export`)
- [ ] 2FA opcional via Supabase Auth TOTP
