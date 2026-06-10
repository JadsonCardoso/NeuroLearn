# Feature Spec — Modelagem do Banco de Dados (PostgreSQL)

**ID:** F-022
**Status:** 🔜 Planned (v1.2)
**Complexidade:** Grande
**Depende de:** F-021 (Auth)

## Overview

Modelagem completa do PostgreSQL para o NeuroLearn. 10 entidades centrais cobrindo o ciclo cognitivo completo. RLS em todas as tabelas. Índices para queries críticas de performance.

---

## Entidades e Schema

### 1. users

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  email       TEXT NOT NULL UNIQUE,
  name        TEXT,
  role        TEXT DEFAULT 'student',
  area        TEXT,
  goal        TEXT,
  total_xp    INTEGER DEFAULT 0,
  streak      INTEGER DEFAULT 0,
  last_study  DATE,
  timezone    TEXT DEFAULT 'America/Sao_Paulo',
  settings    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);
```

---

### 2. contents (Biblioteca)

```sql
CREATE TABLE contents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  type        TEXT CHECK (type IN ('book','course','video','article','note')),
  author      TEXT,
  description TEXT,
  url         TEXT,
  color       TEXT DEFAULT '#7c3aed',
  progress    INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  tags        TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);
CREATE INDEX idx_contents_user ON contents(user_id) WHERE archived_at IS NULL;
```

---

### 3. flashcards

```sql
CREATE TABLE flashcards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id      UUID REFERENCES contents(id) ON DELETE SET NULL,
  front           TEXT NOT NULL,
  back            TEXT NOT NULL,
  -- SM-2 fields
  ease_factor     DECIMAL(3,2) DEFAULT 2.50,
  interval_days   INTEGER DEFAULT 1,
  repetitions     INTEGER DEFAULT 0,
  mastery         TEXT DEFAULT 'new' CHECK (mastery IN ('new','learning','review','strong')),
  -- Scheduling
  next_review     TIMESTAMPTZ DEFAULT NOW(),
  last_review     TIMESTAMPTZ,
  -- Metadata
  tags            TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_flashcards_user_due ON flashcards(user_id, next_review) WHERE mastery != 'archived';
CREATE INDEX idx_flashcards_content ON flashcards(content_id);
```

---

### 4. review_cycles (histórico de revisões)

```sql
CREATE TABLE review_cycles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id    UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  -- Resposta do usuário
  quality         INTEGER NOT NULL CHECK (quality BETWEEN 1 AND 4),
  -- Estado anterior (snapshot para análise)
  ef_before       DECIMAL(3,2),
  interval_before INTEGER,
  -- Estado após SM-2
  ef_after        DECIMAL(3,2),
  interval_after  INTEGER,
  -- Métricas cognitivas
  response_time_ms INTEGER,          -- tempo para responder
  retention_at_review DECIMAL(5,2),  -- retenção calculada no momento da revisão
  reviewed_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_review_cycles_user ON review_cycles(user_id, reviewed_at DESC);
CREATE INDEX idx_review_cycles_card ON review_cycles(flashcard_id, reviewed_at DESC);
```

---

### 5. study_sessions (Sessões de Foco)

```sql
CREATE TABLE study_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id      UUID REFERENCES contents(id) ON DELETE SET NULL,
  -- Dados da sessão
  duration_min    INTEGER NOT NULL DEFAULT 25,
  highlights      TEXT[],
  notes           TEXT,
  -- Modo Professor
  teach_text      TEXT,
  teach_word_count INTEGER GENERATED ALWAYS AS (
    array_length(string_to_array(trim(teach_text), ' '), 1)
  ) STORED,
  -- Cards criados nesta sessão
  cards_created   INTEGER DEFAULT 0,
  xp_gained       INTEGER DEFAULT 0,
  -- Timestamps
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sessions_user ON study_sessions(user_id, completed_at DESC);
```

---

### 6. skill_trees (Habilidades)

```sql
CREATE TABLE skill_trees (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT CHECK (category IN ('product','tech','soft','data','other')),
  color       TEXT DEFAULT '#7c3aed',
  level       INTEGER DEFAULT 0 CHECK (level BETWEEN 0 AND 5),
  xp          INTEGER DEFAULT 0,
  xp_max      INTEGER DEFAULT 200,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_skills_user ON skill_trees(user_id);
```

---

### 7. user_skills (XP ganho por habilidade por evento)

```sql
CREATE TABLE user_skill_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id    UUID NOT NULL REFERENCES skill_trees(id) ON DELETE CASCADE,
  xp_gained   INTEGER NOT NULL,
  source      TEXT CHECK (source IN ('review','session','active_learning','manual')),
  source_id   UUID,   -- ID da revisão ou sessão que gerou o XP
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 8. retention_metrics (Snapshot diário)

```sql
CREATE TABLE retention_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id    UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  retention_pct   DECIMAL(5,2) NOT NULL,  -- R = 100 * e^(-t/(interval*ef))
  days_since_review DECIMAL(10,4),
  snapshot_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(flashcard_id, snapshot_date)
);
CREATE INDEX idx_retention_user_date ON retention_metrics(user_id, snapshot_date DESC);
```

---

### 9. active_learning_sessions (Aprendizado Ativo)

```sql
CREATE TABLE active_learning_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id      UUID REFERENCES contents(id) ON DELETE SET NULL,
  mode            TEXT CHECK (mode IN ('teach','apply','quiz')),
  response_text   TEXT,
  word_count      INTEGER,
  xp_gained       INTEGER DEFAULT 0,
  -- IA analysis (v2.0)
  ai_quality_score DECIMAL(3,2),
  ai_feedback     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 10. cognitive_events (Observabilidade)

```sql
CREATE TABLE cognitive_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,  -- 'review_completed', 'session_started', 'skill_levelup', etc.
  event_data  JSONB DEFAULT '{}',
  session_id  UUID,           -- PostHog session ID
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cognitive_events_user ON cognitive_events(user_id, created_at DESC);
CREATE INDEX idx_cognitive_events_type ON cognitive_events(event_type, created_at DESC);
```

---

## Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_events ENABLE ROW LEVEL SECURITY;

-- Política padrão: usuário vê apenas seus dados
CREATE POLICY "own_data" ON contents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_data" ON flashcards FOR ALL USING (auth.uid() = user_id);
-- (repetir para todas as tabelas)
```

---

## Migrations (Prisma)

```
prisma/
├── schema.prisma       # schema completo com tipos
└── migrations/
    ├── 001_initial/    # tabelas core
    ├── 002_rls/        # políticas RLS
    ├── 003_indexes/    # índices de performance
    └── 004_seed/       # dados de seed para desenvolvimento
```

---

## Queries críticas de performance

| Query                         | Índice                      | Frequência   |
| ----------------------------- | --------------------------- | ------------ |
| Cards vencidos hoje           | `idx_flashcards_user_due`   | A cada login |
| Retention médio do usuário    | `idx_retention_user_date`   | Dashboard    |
| Histórico de revisões do card | `idx_review_cycles_card`    | Ao revisar   |
| Eventos cognitivos recentes   | `idx_cognitive_events_user` | Analytics    |

## Não inclui nesta fase

- Particionamento de tabelas (v3.0 — escala)
- Replicação de leitura (v3.0)
- Full-text search em flashcards (v1.3)
