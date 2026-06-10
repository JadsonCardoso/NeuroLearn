# Feature Spec — Segurança, RBAC e LGPD

**ID:** F-040
**Status:** 🔜 Planned (v2.0)
**Complexidade:** Grande
**Depende de:** F-021 (Auth), F-022 (Database)

## Overview

Segurança tratada como requisito de negócio. O NeuroLearn processa dados cognitivos sensíveis: histórico de aprendizagem, comportamento, conteúdos privados e (v2.0) gravações de áudio. Compliance LGPD obrigatório antes do lançamento público.

---

## Requirements

### R-040-01 — RBAC completo

**Perfis e matrizes de acesso:**

| Recurso                     | student      | mentor         | admin | ai_service |
| --------------------------- | ------------ | -------------- | ----- | ---------- |
| Próprios conteúdos          | CRUD         | —              | R     | R          |
| Próprios flashcards         | CRUD         | —              | R     | R          |
| Dados de alunos vinculados  | —            | R              | R     | R          |
| Todos os dados (admin)      | —            | —              | CRUD  | —          |
| Eventos cognitivos          | R (próprios) | R (vinculados) | CRUD  | R (todos)  |
| Configurações da plataforma | —            | —              | CRUD  | —          |
| Dados de IA                 | —            | —              | R     | CRUD       |

**Implementação:** RLS no PostgreSQL + middleware Next.js verificando role do JWT.

**Done when:** Teste de autorização: student não consegue ver dados de outro student via API direta.

---

### R-040-02 — Segurança de APIs

**Headers obrigatórios (next.config.js):**

```javascript
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'",
  },
]
```

**Validação de payload (Zod):**

```typescript
// Toda API route valida input antes de processar
const ReviewSchema = z.object({
  flashcard_id: z.string().uuid(),
  quality: z.number().int().min(1).max(4),
  response_time_ms: z.number().int().min(0).max(300000).optional(),
})
```

**Rate limiting:**

- Login: 5 tentativas/min (Supabase Auth built-in)
- APIs gerais: 100 req/min por usuário (Supabase Edge throttle)
- Upload: 10 req/min por usuário

**Proteção contra:**

- SQL Injection: Prisma/Supabase parameterized queries
- XSS: React escaping automático + CSP
- CSRF: SameSite cookies + PKCE
- Path Traversal: validação de nome de arquivo em uploads

**Done when:** OWASP Top 10 básico coberto. Nenhuma query string direto no PostgreSQL.

---

### R-040-03 — Upload seguro

**Tipos permitidos:**
| Tipo | MIME aceito | Tamanho máximo |
|------|------------|----------------|
| PDF | application/pdf | 10MB |
| Imagem | image/jpeg, image/png, image/webp | 5MB |
| Áudio | audio/mpeg, audio/wav, audio/ogg | 25MB |

**Pipeline de validação:**

```
1. Verificar MIME type (não só extensão)
2. Verificar tamanho máximo
3. Sanitizar nome do arquivo (remover path traversal)
4. Gerar UUID como nome no storage (não usar nome original)
5. Armazenar em Supabase Storage (bucket privado)
6. Registrar no banco: user_id, original_name, stored_name, mime_type
```

**Scan antivírus:** Supabase Storage Scan (via integração CLAMAV) — v2.1

**Done when:** Upload de arquivo com extensão .exe falha na validação MIME; nome do arquivo no storage é UUID opaco.

---

### R-040-04 — LGPD Compliance

**Princípios implementados:**

| Princípio LGPD | Implementação                                                |
| -------------- | ------------------------------------------------------------ |
| Coleta mínima  | Coletar apenas dados necessários para o ciclo cognitivo      |
| Consentimento  | Banner de consentimento no cadastro + documentação clara     |
| Transparência  | Página de Privacidade + explicação do uso de cada dado       |
| Acesso         | `GET /api/user/data` retorna todos os dados em JSON          |
| Portabilidade  | `GET /api/user/export` gera arquivo completo para download   |
| Retificação    | `PATCH /api/user/profile` para atualizar dados               |
| Exclusão       | `DELETE /api/user` — soft delete + anonimização em 30 dias   |
| Segurança      | Criptografia em trânsito (HTTPS/TLS) + em repouso (Supabase) |

**Soft delete + anonimização:**

```sql
-- Ao solicitar exclusão: marcar deleted_at
UPDATE users SET deleted_at = NOW() WHERE id = $1;

-- Job diário: anonimizar registros deleted há > 30 dias
UPDATE users SET
  email = 'deleted_' || id || '@anon.com',
  name = 'Usuário Excluído',
  area = NULL,
  goal = NULL
WHERE deleted_at < NOW() - INTERVAL '30 days'
  AND email NOT LIKE 'deleted_%';
```

**Done when:** Usuário consegue exportar, retificar e excluir seus dados via interface. Processo de exclusão auditado.

---

### R-040-05 — Gestão de Secrets

| Secret                    | Armazenamento                 | Rotação             |
| ------------------------- | ----------------------------- | ------------------- |
| Supabase URL + anon key   | Vercel env vars               | Manual (não expira) |
| Supabase service role key | Vercel env vars (server only) | A cada 90 dias      |
| OpenAI/Anthropic API key  | Vercel env vars (server only) | A cada 60 dias      |
| JWT secret                | Supabase managed              | Automático          |

**Regra:** Nenhuma chave secreta em código-fonte ou logs. `NEXT_PUBLIC_*` apenas para valores não-secretos.

---

### R-040-06 — Audit Logs

```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  action      TEXT NOT NULL,  -- 'login', 'export_data', 'delete_account', etc.
  resource    TEXT,
  ip_address  INET,
  user_agent  TEXT,
  result      TEXT CHECK (result IN ('success', 'failure', 'blocked')),
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
-- Nunca deletar audit logs (imutável por LGPD)
-- Retenção: 5 anos
```

**Eventos auditados obrigatoriamente:** login, logout, export_data, delete_account, upload_file, role_change, admin_access.

**Done when:** Todos os eventos críticos aparecem na tabela; admin pode consultar logs via Supabase Dashboard.

---

## Não inclui

- Pen test formal (contratar especialista externo antes do launch público)
- WAF (Web Application Firewall) — v2.0 com Cloudflare
- DLP (Data Loss Prevention) — v3.0
