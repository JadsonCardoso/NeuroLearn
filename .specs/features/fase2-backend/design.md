# Design — Fase 2: Backend e Persistência Real

**Status:** Revisado  
**Data:** 2026-06-05

---

## Diagrama de Camadas

```
┌─────────────────────────────────────────────────────┐
│  Next.js App (/(app)/*)  — Client Components         │
│  Módulos: dashboard, library, focus, review...       │
└──────────────────┬──────────────────────────────────┘
                   │ dispatch(action) / useQuery
┌──────────────────▼──────────────────────────────────┐
│  src/store/AppContext.tsx  (React Context + Reducer) │
│  Passa a chamar services em vez de localStorage      │
└──────────────────┬──────────────────────────────────┘
                   │ async calls
┌──────────────────▼──────────────────────────────────┐
│  src/services/*Service.ts  (Service Layer)           │
│  contentsService | flashcardsService | skillsService │
│  reviewService | sessionsService | retentionService  │
│  cognitiveEventsService                              │
└──────────────────┬──────────────────────────────────┘
                   │ supabase.from(table)
┌──────────────────▼──────────────────────────────────┐
│  src/lib/supabase/client.ts  (Supabase JS Client)    │
│  src/lib/supabase/server.ts  (SSR Server Client)     │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS / PostgREST / Auth JWT
┌──────────────────▼──────────────────────────────────┐
│  Supabase Cloud                                      │
│  PostgreSQL + Auth + RLS + Storage                  │
└─────────────────────────────────────────────────────┘
```

---

## Schema PostgreSQL

### Extensões necessárias

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Tabela: users (profile público)

```sql
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  total_xp    INTEGER NOT NULL DEFAULT 0,
  streak      INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Tabela: contents

```sql
CREATE TABLE public.contents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('book','course','video','article','note')),
  author      TEXT,
  description TEXT,
  progress    INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  color       TEXT NOT NULL DEFAULT '#7c3aed',
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_contents_user_id ON public.contents(user_id);
```

### Tabela: flashcards

```sql
CREATE TABLE public.flashcards (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_id   UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  front        TEXT NOT NULL,
  back         TEXT NOT NULL,
  ef           REAL NOT NULL DEFAULT 2.5,
  interval     INTEGER NOT NULL DEFAULT 1,
  repetitions  INTEGER NOT NULL DEFAULT 0,
  next_review  DATE NOT NULL DEFAULT CURRENT_DATE,
  last_review  DATE,
  mastery      INTEGER NOT NULL DEFAULT 0 CHECK (mastery BETWEEN 0 AND 100),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_flashcards_user_id ON public.flashcards(user_id);
CREATE INDEX idx_flashcards_content_id ON public.flashcards(content_id);
CREATE INDEX idx_flashcards_next_review ON public.flashcards(user_id, next_review);
```

### Tabela: review_cycles (histórico SM-2)

```sql
CREATE TABLE public.review_cycles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  quality      INTEGER NOT NULL CHECK (quality BETWEEN 1 AND 4),
  ef_before    REAL NOT NULL,
  ef_after     REAL NOT NULL,
  interval_before INTEGER NOT NULL,
  interval_after  INTEGER NOT NULL,
  xp_earned    INTEGER NOT NULL DEFAULT 0,
  reviewed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_review_cycles_user_id ON public.review_cycles(user_id);
CREATE INDEX idx_review_cycles_flashcard_id ON public.review_cycles(flashcard_id);
```

### Tabela: study_sessions (sessões Pomodoro)

```sql
CREATE TABLE public.study_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_id  UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  duration    INTEGER NOT NULL,  -- segundos
  cards_created INTEGER NOT NULL DEFAULT 0,
  xp_earned   INTEGER NOT NULL DEFAULT 0,
  mode        TEXT,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at    TIMESTAMPTZ
);
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_content_id ON public.study_sessions(content_id);
```

### Tabela: skills (catálogo global)

```sql
CREATE TABLE public.skills (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name    TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  color   TEXT NOT NULL DEFAULT '#7c3aed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Tabela: user_skills

```sql
CREATE TABLE public.user_skills (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  level    INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  xp       INTEGER NOT NULL DEFAULT 0,
  max_xp   INTEGER NOT NULL DEFAULT 100,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);
CREATE INDEX idx_user_skills_user_id ON public.user_skills(user_id);
```

### Tabela: retention_metrics (snapshots diários)

```sql
CREATE TABLE public.retention_metrics (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  retention    REAL NOT NULL CHECK (retention BETWEEN 0 AND 1),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(flashcard_id, snapshot_date)
);
CREATE INDEX idx_retention_metrics_user_id ON public.retention_metrics(user_id, snapshot_date);
```

### Tabela: cognitive_events (log para futura IA)

```sql
CREATE TABLE public.cognitive_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,   -- 'review', 'session_start', 'session_end', 'skill_gained', etc.
  payload    JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cognitive_events_user_id ON public.cognitive_events(user_id, occurred_at DESC);
CREATE INDEX idx_cognitive_events_type ON public.cognitive_events(user_id, event_type);
```

---

## Row Level Security

### Padrão para todas as tabelas de usuário

```sql
ALTER TABLE public.<tabela> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<tabela>_select_own" ON public.<tabela>
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "<tabela>_insert_own" ON public.<tabela>
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "<tabela>_update_own" ON public.<tabela>
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "<tabela>_delete_own" ON public.<tabela>
  FOR DELETE USING (auth.uid() = user_id);
```

### Skills globais (catálogo)

```sql
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills_public_read" ON public.skills FOR SELECT USING (true);
-- Write: apenas via service_role (migrations/seed)
```

### cognitive_events e retention_metrics: insert-only para o dono

```sql
CREATE POLICY "cognitive_events_insert_own" ON public.cognitive_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Sem UPDATE/DELETE — são imutáveis por design
```

---

## Trigger: auto-criar profile em auth.users

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Estrutura de arquivos

```
src/
├── lib/
│   └── supabase/
│       ├── client.ts          # createBrowserClient (singleton)
│       └── server.ts          # createServerClient (SSR, cookies)
├── services/
│   ├── contentsService.ts
│   ├── flashcardsService.ts
│   ├── reviewService.ts
│   ├── sessionsService.ts
│   ├── skillsService.ts
│   ├── retentionService.ts
│   └── cognitiveEventsService.ts
├── types/
│   ├── index.ts               # tipos de domínio (existente)
│   └── database.types.ts      # gerado pelo Supabase CLI
├── app/
│   ├── auth/
│   │   ├── login/page.tsx     # Email + senha + magic link + Google
│   │   ├── signup/page.tsx    # Cadastro
│   │   └── callback/route.ts  # OAuth callback handler
│   └── (app)/
│       └── layout.tsx         # ← adicionar verificação de sessão
└── middleware.ts               # Proteger rotas /(app)/*
```

---

## Decisões arquiteturais

### A — Supabase SSR com @supabase/ssr

Usar `@supabase/ssr` (não o legacy `@supabase/auth-helpers-nextjs`) para criar clientes separados:

- `client.ts` → `createBrowserClient` para componentes client
- `server.ts` → `createServerClient` com cookies do Next.js para middleware e server components

### B — Middleware para proteção de rotas

`middleware.ts` na raiz checa o token JWT em cada request para `/(app)/*`. Se inválido/ausente,
redireciona para `/auth/login`. Evita flash de conteúdo protegido.

### C — Store permanece síncrono no cliente

O `AppContext` continua com `useReducer`. A mudança é que as actions assíncronas (que antes eram
síncronas no localStorage) agora chamam services antes de fazer dispatch. Padrão: optimistic update
local → confirmar com backend.

### D — Tipos do Supabase como fonte da verdade

`database.types.ts` é gerado pelo CLI (`supabase gen types`). Os tipos de domínio em `types/index.ts`
são mapeados a partir desses types, não o contrário.

### E — cognitive_events é append-only

Nenhuma row de `cognitive_events` é deletada ou atualizada. Isso garante trilha auditável e
compatibilidade futura com modelos de IA que precisam de histórico completo.
