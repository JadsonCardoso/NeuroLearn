# Feature Spec — Fase 4: Segurança da Plataforma

**ID:** F-040
**Status:** 🚧 In Progress
**Complexidade:** Complex
**Depende de:** F-031 (Fase 3 ✅)

## Contexto atual (o que existe)

- `middleware.ts` — só faz auth redirect, sem rate limiting, sem headers de segurança
- `next.config.ts` — vazio, sem security headers
- Nenhuma API route existe (`src/app/api/` vazio)
- Auth via Supabase SSR (JWT httpOnly cookies — seguro por padrão)
- Sem validação de inputs além dos atributos HTML nativos
- Sem LGPD / consentimento
- Sem RBAC além da checagem de sessão existente

## Out of scope desta fase

- Antivírus em uploads (feature de upload não existe ainda)
- Rate limiting distribuído com Redis/Upstash (sem infraestrutura configurada)
- Database audit trail via Edge Functions (próxima fase)
- Google OAuth PKCE hardening (Supabase já gerencia)
- SRI (Subresource Integrity) — sem CDN de terceiros críticos

---

## Requirements

### SEC-001 — HTTP Security Headers

Adicionar em `next.config.ts` via `headers()`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` (permissivo-seguro — ver design)
- `Strict-Transport-Security` apenas em produção (not localhost)
- `X-DNS-Prefetch-Control: off`

**Done when:** `npm run build` passa e headers aparecem nas respostas.

---

### SEC-002 — Rate Limiting (Edge-compatible)

Arquivo: `src/lib/security/rateLimit.ts`

- In-memory Map com TTL (edge runtime compatible, sem Node.js APIs)
- 5 tentativas por IP em janela de 15 minutos para rotas `/auth/*`
- Retorna `{ allowed: boolean, retryAfterMs: number }`
- Limpeza periódica de entradas expiradas (evita memory leak)
- Nota no código: substituir por Upstash Redis em produção multi-instância

**Done when:** Testes unitários cobrem: primeira tentativa, limite exato, janela reset, múltiplos IPs.

---

### SEC-003 — Validação de Inputs (Zod)

Arquivo: `src/lib/security/validation.ts`

Schemas:

- `loginSchema`: email (email válido, max 254 chars), password (min 6, max 128)
- `signupSchema`: name (min 2, max 100, letras/espaços), email, password
- `contentSchema`: title (min 1, max 200), type (enum), author (max 100), desc (max 2000)
- `flashcardSchema`: front (min 1, max 1000), back (min 1, max 1000)

Exporta também `sanitizeString(s: string): string` — trim + colapsa espaços múltiplos.

**Done when:** Testes cobrem campos válidos, inválidos e edge cases (empty, overflow).

---

### SEC-004 — Sanitização HTML

Arquivo: `src/lib/security/sanitize.ts`

Funções:

- `stripHtml(input: string): string` — remove tags HTML
- `escapeHtml(input: string): string` — entidades HTML (&lt; &gt; &amp; &quot; &#x27;)
- `sanitizeFileName(name: string): string` — remove path traversal (`../`), chars especiais
- `isValidMimeType(mime: string, allowed: string[]): boolean` — whitelist MIME

Nota: no frontend, usar `innerText` ao invés de `innerHTML` evita XSS sem DOMPurify.

**Done when:** Testes cobrem XSS strings, path traversal, MIME whitelist.

---

### SEC-005 — RBAC Helpers

Arquivo: `src/lib/security/rbac.ts`

```ts
type UserRole = 'user' | 'admin' | 'super_admin'

function hasRole(userRole: UserRole, required: UserRole): boolean
function isAdmin(userRole: UserRole): boolean
function isSuperAdmin(userRole: UserRole): boolean
function requireRole(userRole: UserRole, required: UserRole): void // throws SecurityError
```

Hierarquia: `super_admin > admin > user`

**Done when:** Testes cobrem todos os níveis e negações.

---

### SEC-006 — Security Logger

Arquivo: `src/lib/security/logger.ts`

```ts
type SecurityEvent =
  | 'auth.login.success'
  | 'auth.login.failure'
  | 'auth.signup'
  | 'auth.logout'
  | 'rate_limit.exceeded'
  | 'rbac.violation'
  | 'session.invalid'
  | 'data.deletion'

function logSecurityEvent(event: SecurityEvent, meta?: Record<string, unknown>): void
```

Formato: JSON estruturado com timestamp, evento, meta. Em produção, substituir por serviço real.

---

### SEC-007 — Middleware Enriquecido

Arquivo: `middleware.ts`

Adicionar ao middleware existente (sem quebrar lógica de auth):

1. Rate limiting em `/auth/*` (usa SEC-002)
2. Resposta `429 Too Many Requests` com header `Retry-After` quando bloqueado
3. Log de `rate_limit.exceeded` (usa SEC-006)
4. Log de `session.invalid` quando rota protegida acessada sem sessão
5. Bloqueio de rotas `/api/admin/*` para roles não-admin (RBAC)

**Done when:** Build passa. Rate limit retorna 429 corretamente no teste E2E.

---

### SEC-008 — LGPD: Consent Banner

Arquivo: `src/components/lgpd/ConsentBanner.tsx`

- Aparece na primeira visita (controla via localStorage `nl_lgpd_consent`)
- Opções: "Aceitar" / "Somente necessários"
- Texto: lista cookies usados (auth, localStorage de aprendizagem)
- Link para `/privacy` (política de privacidade)
- Após aceitar/rejeitar: salva `{ consent: 'accepted'|'minimal', date: ISO }` no localStorage
- Design: banner fixo no rodapé, design consistente com o resto do app

**Done when:** Aparece na primeira visita, não aparece após aceitar, persiste entre reloads.

---

### SEC-009 — LGPD: Exclusão de Dados

Arquivo: `src/app/api/user/delete/route.ts`

- `DELETE /api/user/delete` — requer sessão ativa
- Deleta em ordem: `review_cycles`, `retention_snapshots`, `cognitive_events`, `study_sessions`, `user_skills`, `flashcards`, `contents`, `users` (tabela pública), auth user (via service role)
- Retorna `{ success: true }` ou `{ error: string }`
- Usa `SUPABASE_SERVICE_ROLE_KEY` para `auth.admin.deleteUser()`

**Done when:** Endpoint existe e retorna 401 sem sessão.

---

### SEC-010 — OWASP Checklist

Arquivo: `src/lib/security/OWASP-CHECKLIST.md`

Mapear os OWASP Top 10 para o estado atual + mitigações implementadas.

---

### SEC-011 — Testes de Segurança

Testes unitários Vitest para: validation.ts, sanitize.ts, rbac.ts, rateLimit.ts
Cobertura mínima: ≥ 80% nas funções de security.
