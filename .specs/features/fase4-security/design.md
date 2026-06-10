# Design — Fase 4: Segurança da Plataforma

## Estrutura de arquivos

```
src/lib/security/
├── rateLimit.ts           ← rate limiter in-memory, edge-compatible
├── validation.ts          ← Zod schemas + sanitizeString
├── sanitize.ts            ← stripHtml, escapeHtml, sanitizeFileName, isValidMimeType
├── rbac.ts                ← hasRole, isAdmin, isSuperAdmin, requireRole
├── logger.ts              ← logSecurityEvent (structured JSON)
├── OWASP-CHECKLIST.md     ← OWASP Top 10 mapeado
└── __tests__/
    ├── validation.test.ts
    ├── sanitize.test.ts
    ├── rbac.test.ts
    └── rateLimit.test.ts

src/components/lgpd/
└── ConsentBanner.tsx      ← LGPD consent (Client Component)

src/app/api/user/
└── delete/route.ts        ← DELETE /api/user/delete

next.config.ts             ← security headers
middleware.ts              ← enhanced (rate limit + RBAC + logging)
```

## CSP Policy (permissivo-seguro para Next.js 15)

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:;
connect-src 'self'
  https://*.supabase.co
  wss://*.supabase.co
  https://accounts.google.com;
frame-src 'none';
frame-ancestors 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests;
```

**Nota:** `'unsafe-eval'` e `'unsafe-inline'` são necessários para Next.js App Router em dev/prod.
Futuro: implementar nonces por request para eliminar `'unsafe-inline'`.

## Rate Limit — arquitetura edge

```
Sem Redis → in-memory Map global no módulo
Funcionamento:
  key = "auth:{ip}"
  value = { count: number, resetAt: timestamp }

Limpeza: a cada N requests, varrer entries expiradas
Limite: 5 req / 15 min por IP para rotas /auth/*

Produção multi-instância: substituir por Upstash Redis
  npm install @upstash/ratelimit @upstash/redis
```

## RBAC — hierarquia de roles

```
super_admin → pode tudo
    ↓
admin → pode quase tudo (exceto alterar super_admin)
    ↓
user → acesso normal à plataforma
```

Implementação: role vem do `user.user_metadata.role` ou tabela `users.role`.
Middleware verifica role para rotas `/api/admin/*`.

## LGPD — fluxo de consentimento

```
1ª visita → ConsentBanner aparece
    ↓
Aceitar → nl_lgpd_consent = { consent: 'accepted', date }
Somente necessários → nl_lgpd_consent = { consent: 'minimal', date }
    ↓
Banner some → não reaparece
    ↓
"Exclusão de dados" → DELETE /api/user/delete → cascata no Supabase
```

## Sequência de exclusão de dados (LGPD)

```sql
-- Ordem de deleção (respeitar FK constraints)
DELETE FROM review_cycles      WHERE user_id = ?
DELETE FROM retention_snapshots WHERE user_id = ?
DELETE FROM cognitive_events   WHERE user_id = ?
DELETE FROM study_sessions     WHERE user_id = ?
DELETE FROM user_skills        WHERE user_id = ?
DELETE FROM flashcards         WHERE user_id = ?
DELETE FROM contents           WHERE user_id = ?
DELETE FROM users              WHERE id = ?
-- Por último: auth user (via service role)
auth.admin.deleteUser(userId)
```
