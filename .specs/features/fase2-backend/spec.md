# Spec — Fase 2: Backend e Persistência Real

**Status:** Especificado  
**Data:** 2026-06-05  
**Escopo:** Large/Complex

---

## Contexto

O NeuroLearn v2 (Fase 1) roda localmente com localStorage. Essa fase substitui a camada de
persistência por Supabase (PostgreSQL), adiciona autenticação real (email/senha, magic link,
OAuth Google) e implementa segurança multi-tenant com Row Level Security.

Nenhuma regra de negócio cognitiva muda. O SM-2 e o modelo de retenção permanecem em `src/engine/`.
O que muda é: de onde os dados vêm e para onde vão.

---

## Requisitos

### R-F2-01 — Schema PostgreSQL completo

O banco deve ter 9 tabelas com relacionamentos corretos, UUIDs, timestamps e índices:

- `users` — extensão do `auth.users` do Supabase (profile público)
- `contents` — conteúdos de aprendizagem por usuário
- `flashcards` — cards com metadados SM-2 por conteúdo
- `review_cycles` — histórico de cada revisão individual de um card
- `study_sessions` — sessões de foco (Pomodoro) por conteúdo
- `skills` — catálogo global de habilidades (seed)
- `user_skills` — habilidades adquiridas por usuário com XP e nível
- `retention_metrics` — snapshot diário de retenção por card (para analytics)
- `cognitive_events` — log de eventos cognitivos (para futura IA)

**Critério:** Todas as tabelas existem, FK constraints corretas, índices nos campos de query frequente.

---

### R-F2-02 — Row Level Security (RLS)

Todas as tabelas de dados de usuário devem ter RLS habilitado e policies que garantem:

- Usuário só lê/escreve seus próprios dados (`auth.uid() = user_id`)
- Skills globais (catálogo) são leitura pública, escrita apenas admin
- `cognitive_events` e `retention_metrics` são insert-only pelo usuário dono

**Critério:** Nenhuma query sem `user_id` retorna dados de outro usuário.

---

### R-F2-03 — Autenticação

Implementar os seguintes fluxos de auth via Supabase Auth:

- Email + senha (signup, login, recuperação de senha)
- Magic link (login sem senha)
- OAuth Google

Rotas protegidas: todos os módulos em `/(app)/` exigem sessão ativa. Sem sessão → redirect para `/auth/login`.

**Critério:** Usuário não autenticado é bloqueado em qualquer rota `/(app)/`.

---

### R-F2-04 — Migração de dados localStorage → Supabase

No primeiro login após migração, se existir `nl_v2` no localStorage, oferecer ao usuário a opção
de importar os dados locais para a conta. Após importação bem-sucedida, limpar localStorage.

**Critério:** Dados migrados aparecem corretamente na UI após importação.

---

### R-F2-05 — Services desacoplados

Criar camada de services em `src/services/` com interface clara:

- `contentsService.ts` — CRUD de conteúdos
- `flashcardsService.ts` — CRUD + update SM-2 fields
- `reviewService.ts` — registrar ciclo de revisão
- `sessionsService.ts` — registrar sessões de foco
- `skillsService.ts` — skills globais + user_skills
- `retentionService.ts` — snapshot de retenção
- `cognitiveEventsService.ts` — log de eventos

Cada service expõe funções assíncronas tipadas. Nenhum component chama o Supabase client diretamente.

**Critério:** `import { supabase }` não aparece fora de `src/services/` e `src/lib/supabase/`.

---

### R-F2-06 — Tipagem TypeScript

Gerar tipos TypeScript a partir do schema do Supabase (`database.types.ts`). Os types de domínio
existentes em `src/types/index.ts` devem ser compatíveis ou estendidos com os tipos do banco.

**Critério:** `npm run build` passa sem erros de tipo relacionados ao Supabase.

---

### R-F2-07 — Variáveis de ambiente

Configurar `.env.local` (gitignored) com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Criar `.env.example` documentado no repositório.

**Critério:** App não quebra com env vars ausentes — exibe erro amigável em vez de crash.

---

### R-F2-08 — Proteção multi-tenant

O design do schema deve garantir que é estruturalmente impossível (via RLS + FK) que um usuário
acesse dados de outro, mesmo com queries maliciosas via frontend.

**Critério:** RLS policies testadas manualmente com dois usuários distintos no Supabase Studio.

---

## Fora do escopo desta fase

- IA / Cognitive Engine
- Analytics avançado (PostHog, Sentry)
- Deploy em produção (Vercel)
- Multi-tenant organizacional (empresas/times)
- Notificações push / email de revisão
- Exportação de dados (LGPD)
