# Feature Spec — Autenticação e Autorização

**ID:** F-021
**Status:** 🔜 Planned (v1.2)
**Complexidade:** Grande
**Depende de:** F-020 (migração Next.js)

## Overview

Implementar autenticação segura via Supabase Auth com suporte a múltiplos provedores. Incluir RBAC para os 4 perfis do produto. Preparar base de segurança para escalar para uso corporativo.

---

## Requirements

### R-021-01 — Provedores de autenticação

**Obrigatórios (v1.2):**

- Magic Link (email sem senha — menor fricção)
- Email + Senha

**Opcionais (v2.0):**

- OAuth Google
- OAuth GitHub

**Done when:** Usuário consegue criar conta e logar via Magic Link e Email/Senha.

---

### R-021-02 — Fluxo de autenticação (PKCE)

```
Cliente → GET /login
       → Supabase Auth (PKCE flow)
       → Callback URL: /auth/callback
       → Supabase valida code_verifier
       → Session cookie httpOnly set
       → Redirect → /dashboard
```

**Middleware Next.js:**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Verificar session em toda rota (auth)/*
  // Redirect para /login se não autenticado
  // Refresh token automático
}
```

**Done when:** Rota protegida redireciona para login; após login retorna à rota original.

---

### R-021-03 — Gestão de sessão

| Requisito                       | Implementação                                  |
| ------------------------------- | ---------------------------------------------- |
| Session duration                | 7 dias (refresh automático)                    |
| Refresh token                   | Rotação a cada uso                             |
| Logout                          | Invalidar session no Supabase + limpar cookies |
| Logout em todos os dispositivos | Via Supabase `signOut({ scope: 'global' })`    |
| Sessão expirada                 | Redirect para /login com mensagem              |

**Done when:** Session persiste entre reloads; logout limpa todos os tokens.

---

### R-021-04 — RBAC — Role-Based Access Control

**Perfis e permissões:**

| Role         | Acesso                                                    |
| ------------ | --------------------------------------------------------- |
| `student`    | Próprios dados: conteúdos, cards, sessões, habilidades    |
| `mentor`     | Dados dos alunos vinculados (read-only) + próprios dados  |
| `admin`      | Todos os dados da plataforma + configurações              |
| `ai_service` | API apenas para leitura de dados cognitivos (sem auth UI) |

**Implementação via Supabase:**

```sql
-- Coluna role na tabela users
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student'
  CHECK (role IN ('student', 'mentor', 'admin', 'ai_service'));

-- RLS policy exemplo
CREATE POLICY "student_own_data" ON flashcards
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "mentor_read_linked" ON flashcards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mentor_students
      WHERE mentor_id = auth.uid() AND student_id = flashcards.user_id
    )
  );
```

**Done when:** Student não acessa dados de outros; mentor vê apenas alunos vinculados.

---

### R-021-05 — Segurança da autenticação

| Requisito                    | Implementação                              |
| ---------------------------- | ------------------------------------------ |
| Rate limiting no login       | Supabase Auth built-in (5 tentativas/min)  |
| MFA opcional                 | TOTP via Supabase Auth                     |
| Detecção de IP suspeito      | Supabase Auth + logs Sentry                |
| Tokens nunca em localStorage | httpOnly cookies via Supabase SSR          |
| HTTPS obrigatório            | Enforced pelo Vercel                       |
| Headers de segurança         | next.config.js: CSP, HSTS, X-Frame-Options |

**Done when:** Teste de penetração básico não encontra tokens expostos no client.

---

### R-021-06 — Onboarding pós-cadastro

**Fluxo após primeiro login:**

1. Detectar se há dados no localStorage (usuário vindo do v1.0)
2. Se sim: oferecer migração de dados
3. Coletar: nome, objetivo de aprendizagem, área de atuação
4. Criar perfil inicial na tabela `users`
5. Redirect para Dashboard com dados do seed (se novo) ou migrados

**Done when:** Novo usuário tem perfil criado; usuário antigo migra dados sem perda.

---

## Schema da tabela users

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  email       TEXT NOT NULL UNIQUE,
  name        TEXT,
  role        TEXT DEFAULT 'student' CHECK (role IN ('student','mentor','admin','ai_service')),
  area        TEXT,                    -- área profissional
  goal        TEXT,                    -- objetivo de aprendizagem
  total_xp    INTEGER DEFAULT 0,
  streak      INTEGER DEFAULT 0,
  last_study  DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ              -- soft delete (LGPD)
);
```

## Não inclui

- SSO corporativo (SAML) — v3.0
- Biometria / passkeys — v2.5
- Admin UI completo — v2.0
