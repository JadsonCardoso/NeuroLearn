-- ============================================================
-- LEARNING-STRUCTURE-01 — Fase 1 (LS-01-A)
-- Trilhas de Aprendizado: hierarquia sobre contents
-- Aplicar via Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. Tabela learning_trails ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.learning_trails (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  type        TEXT NOT NULL DEFAULT 'free'
              CHECK (type IN ('course','book','article','free','certification','research','tech')),
  color       TEXT NOT NULL DEFAULT '#7c3aed',
  icon_emoji  TEXT NOT NULL DEFAULT '📚',
  goal        TEXT,
  skill_id    UUID REFERENCES public.skills(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. RLS em learning_trails ─────────────────────────────────

ALTER TABLE public.learning_trails ENABLE ROW LEVEL SECURITY;

-- Usuário só acessa, cria, edita e exclui suas próprias trilhas
CREATE POLICY "users_own_trails"
  ON public.learning_trails
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 3. Índice em learning_trails ──────────────────────────────

CREATE INDEX IF NOT EXISTS idx_learning_trails_user_id
  ON public.learning_trails(user_id);

-- ── 4. Coluna trail_id em contents ────────────────────────────

ALTER TABLE public.contents
  ADD COLUMN IF NOT EXISTS trail_id UUID
  REFERENCES public.learning_trails(id) ON DELETE SET NULL;

-- Índice composto para queries filtradas por usuário + trilha
CREATE INDEX IF NOT EXISTS idx_contents_user_trail
  ON public.contents(user_id, trail_id);

-- ── 5. Verificar RLS nas tabelas existentes ───────────────────
-- (confirmar que já estão ativas — não recria se já existe)

-- contents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contents' AND policyname = 'users_own_contents'
  ) THEN
    ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "users_own_contents"
      ON public.contents FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- flashcards
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'flashcards' AND policyname = 'users_own_flashcards'
  ) THEN
    ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "users_own_flashcards"
      ON public.flashcards FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- study_sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'study_sessions' AND policyname = 'users_own_sessions'
  ) THEN
    ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "users_own_sessions"
      ON public.study_sessions FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- user_skills
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_skills' AND policyname = 'users_own_skills'
  ) THEN
    ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "users_own_skills"
      ON public.user_skills FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- review_cycles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'review_cycles' AND policyname = 'users_own_review_cycles'
  ) THEN
    ALTER TABLE public.review_cycles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "users_own_review_cycles"
      ON public.review_cycles FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- retention_metrics
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'retention_metrics' AND policyname = 'users_own_retention'
  ) THEN
    ALTER TABLE public.retention_metrics ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "users_own_retention"
      ON public.retention_metrics FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- session_drafts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'session_drafts' AND policyname = 'users_own_drafts'
  ) THEN
    ALTER TABLE public.session_drafts ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "users_own_drafts"
      ON public.session_drafts FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- cognitive_events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cognitive_events' AND policyname = 'users_own_cognitive_events'
  ) THEN
    ALTER TABLE public.cognitive_events ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "users_own_cognitive_events"
      ON public.cognitive_events FOR ALL
      USING  (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
