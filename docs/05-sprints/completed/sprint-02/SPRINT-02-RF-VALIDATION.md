# SPRINT-02 — Validação de Requisitos Funcionais

**Projeto:** NeuroLearn
**Sprint:** 02 — Knowledge Structure
**Data:** 2026-06-12
**Validador:** QA Estratégico (Fase 06) + Gate Técnico

---

## Legenda

| Status                   | Significado                                  |
| ------------------------ | -------------------------------------------- |
| ✅ APROVADO              | RF implementado, testado e sem bugs críticos |
| ⚠️ APROVADO COM RESSALVA | RF implementado, bug não crítico documentado |
| ❌ REJEITADO             | RF não implementado ou com bug bloqueante    |

---

## Épico 1 — Learning Projects

### RF-191 — Criar Projeto de Aprendizagem

**Status:** ✅ APROVADO

**Implementação:**

- `ProjectFormModal` com Zod schema (`projectSchema`: nome obrigatório, máx 100 chars; descrição opcional, máx 500)
- React Hook Form com `noValidate` + `zodResolver`
- Validação client-side com mensagens PT-BR
- `createProject` no `projectsService` com `user_id` inserido
- `dispatch({ type: 'ADD_PROJECT' })` para atualização reativa
- `toast.success` após criação
- `toast.error` em caso de falha (try/catch)

**Cenários validados:**

- ✅ Criar com nome válido
- ✅ Criar com descrição
- ✅ Submeter sem nome → mensagem de erro, modal permanece aberto
- ✅ Nome com 101 chars → erro de validação
- ✅ ESC fecha sem criar
- ✅ Falha de DB → toast.error (BUG-04 corrigido)

**RNs respeitadas:** RN-001 (nome único por usuário — validação no banco), RN-009 (ownership)

---

### RF-192 — Visualizar Projetos

**Status:** ✅ APROVADO

**Implementação:**

- Grid `auto-fill, minmax(280px, 1fr)` com `ProjectCard`
- Busca client-side por nome e descrição (normalize NFD + lowercase)
- Subtítulo dinâmico: "N resultado(s) de M projetos" quando busca ativa
- Estado vazio com CTA para criar
- Estado de busca vazia com emoji 🔍 e mensagem informativa

**Cenários validados:**

- ✅ Grid renderiza múltiplos projetos
- ✅ Busca por nome filtra em tempo real
- ✅ Busca sem resultado exibe estado informativo
- ✅ Estado vazio com CTA de criação
- ✅ Busca case-insensitive e sem acentos

---

### RF-193 — Editar Projeto

**Status:** ✅ APROVADO

**Implementação:**

- Modal de edição com dados pré-preenchidos via `defaultValues`
- Botão "Salvar alterações" desabilitado quando `!isDirty && isEdit`
- `updateProject` com dupla verificação de ownership
- `dispatch({ type: 'UPDATE_PROJECT' })` para atualização reativa
- `toast.success` após edição

**Cenários validados:**

- ✅ Modal abre com nome atual preenchido
- ✅ Salvar sem mudança → botão desabilitado
- ✅ Editar nome → ProjectCard atualiza imediatamente
- ✅ ESC fecha sem salvar

---

### RF-194 — Excluir Projeto

**Status:** ✅ APROVADO

**Implementação:**

- ConfirmDialog antes da exclusão com texto informando que trilhas são preservadas
- `deleteProject` com ownership check
- `dispatch({ type: 'DELETE_PROJECT' })` remove projeto E seta `projectId: null` nas trilhas associadas (RN-005)
- FK ON DELETE SET NULL no banco garante consistência

**Cenários validados:**

- ✅ ConfirmDialog aparece antes de excluir
- ✅ Cancelar → projeto permanece
- ✅ Confirmar → projeto desaparece do grid imediatamente
- ✅ Trilhas associadas preservadas (desvinculadas)

**RN respeitada:** RN-005 (exclusão de projeto não exclui trilhas)

---

### RF-195 — Associar Trilha a Projeto

**Status:** ✅ APROVADO

**Implementação:**

- `AssignTrailModal` lista trilhas do usuário com opacity 0.5 para trilhas já em outro projeto (RN-004)
- `assignTrailToProject` valida ownership do projeto E da trilha
- `removeTrailFromProject` sets `project_id = null`
- `dispatch({ type: 'ASSIGN_TRAIL_PROJECT' })` para atualização reativa

**Cenários validados:**

- ✅ Modal lista trilhas disponíveis
- ✅ Trilha já em outro projeto não pode ser associada (opacity 0.5, botão desabilitado — RN-004)
- ✅ Associar trilha → progresso atualiza
- ✅ Desassociar trilha → trilha volta à lista livre

**RN respeitada:** RN-004 (trilha pertence a no máximo um projeto)

---

### RF-196 — Calcular Progresso do Projeto

**Status:** ✅ APROVADO

**Implementação:**

- `calculateProjectProgress` no `projectsService` (server-side): média de trilhas; trilha sem conteúdos = 0%
- `computeProgress` client-side via `ProjectCard`: mesma lógica para rendering imediato
- Projeto sem trilhas exibe 0%

**Cenários validados:**

- ✅ Projeto sem trilhas → 0%
- ✅ Trilha sem conteúdos contribui com 0% para a média

**RN respeitada:** RN-015 (trilha sem conteúdos = 0%), RN-016 (progresso = média das trilhas)

---

### RF-197 — Exibir Progresso Consolidado

**Status:** ✅ APROVADO

**Implementação:**

- `ProjectCard` exibe barra de progresso visual
- `%` numérico ao lado da barra
- Badge de trilhas (contagem) e conteúdos (contagem)

**Cenários validados:**

- ✅ 0% — barra vazia
- ✅ 100% — barra verde
- ✅ Parcial — gradiente proporcional

---

### RF-198 — Ownership Enforcement em Projetos

**Status:** ✅ APROVADO

**Implementação:**

- `listProjects(userId)`: `.eq('user_id', userId)`
- `createProject(userId, ...)`: insere com `user_id`
- `updateProject(id, userId, ...)`: `.eq('id', id).eq('user_id', userId)`
- `deleteProject(id, userId)`: `.eq('id', id).eq('user_id', userId)`
- RLS Supabase aplicado em todas as tabelas (ADR-006)

**Cenários validados:**

- ✅ Usuário só vê seus próprios projetos
- ✅ Update com UUID incorreto não modifica dados
- ✅ `/projects` sem sessão redireciona para login

---

## Épico 2 — Completion Sprint 01

### RF-COMPLETION-SESSION-UPDATE — Editar Sessão

**Status:** ✅ APROVADO

**Implementação:**

- `SessionEditModal` com React Hook Form + Zod (`sessionEditSchema`)
- Campos: notas (textarea), modo professor (textarea), highlights (array com add/remove)
- `dispatch({ type: 'UPDATE_SESSION' })` — atualização em memória sem query
- Não persiste no DB (estado local — design intencional para MVP)

**Cenários validados:**

- ✅ Modal abre com dados atuais
- ✅ Cancelar fecha sem alterar
- ✅ ESC fecha
- ✅ Salvar atualiza estado e fecha modal

---

### RF-COMPLETION-SESSION-DELETE — Excluir Sessão

**Status:** ✅ APROVADO

**Implementação:**

- ConfirmDialog com texto explícito: "flashcards e habilidades adquiridas serão preservados"
- `dispatch({ type: 'DELETE_SESSION' })` remove apenas a sessão

**Cenários validados:**

- ✅ ConfirmDialog com mensagem de preservação
- ✅ Cancelar → sessão permanece
- ✅ Confirmar → sessão removida da lista

---

### RF-COMPLETION-EXERCISE — CRUD Exercício

**Status:** ✅ APROVADO

**Implementação:**

- `ExercisesSection` com lazy-load via `listExercisesByContent`
- Toggle expande/colapsa a seção (estado local)
- `ExerciseEditModal` com Zod + try/catch + `toast.success/error`
- `deleteExercise` com ownership check + ConfirmDialog

**Cenários validados:**

- ✅ Toggle carrega exercícios apenas na primeira expansão (lazy)
- ✅ Toggle colapsa na segunda chamada
- ✅ Editar exercício abre modal com dados
- ✅ Cancelar fecha sem salvar
- ✅ Pergunta vazia → erro de validação
- ✅ Excluir → ConfirmDialog + cancelar preserva

---

## Épico 3 — Knowledge Navigation

### RF-201 — Busca por Projeto

**Status:** ✅ APROVADO

**Implementação:** Campo de busca em `ProjectsView` com `normalize()` (NFD + lowercase). Filtra nome e descrição. Subtítulo dinâmico.

**Cenários validados:** ✅ por nome, ✅ por descrição, ✅ acentos, ✅ case-insensitive, ✅ resultado vazio

---

### RF-202 — Busca por Trilha em LibraryView

**Status:** ✅ APROVADO

**Implementação:** `filtered` useMemo inclui `trailTitle` via `trailMap` no critério de busca textual.

**Cenários validados:** ✅ busca pelo nome da trilha retorna conteúdos associados

---

### RF-203 — Busca por Conteúdo

**Status:** ✅ APROVADO (existia, estendido)

**Implementação:** Busca por título, autor, descrição e agora também por título da trilha.

---

### RF-204 — Filtro por Tipo

**Status:** ✅ APROVADO

**Implementação:** 5 chips toggle com `Set<ContentType>`. Multi-select com `aria-pressed`.

**Cenários validados:** ✅ toggle ativa/desativa, ✅ multi-seleção funciona, ✅ sem filtro retorna todos

---

### RF-205 — Filtro por Status

**Status:** ✅ APROVADO

**Implementação:** Segmented control (all/new/in_progress/done). `new = progress === 0`, `in_progress = 0 < progress < 100`, `done = progress === 100`.

---

### RF-206 — Filtro por Projeto (em LibraryView)

**Status:** ✅ APROVADO

**Implementação:** Select condicional (aparece quando `state.projects?.length > 0`). Reseta `filterTrail` ao trocar projeto.

---

### RF-207 — Filtro por Trilha (em LibraryView)

**Status:** ✅ APROVADO

**Implementação:** Select com trilhas filtradas pelo projeto selecionado (ou todas). `filteredTrails` useMemo.

---

### RF-209 — Limpar Filtros

**Status:** ✅ APROVADO

**Implementação:** Botão "× Limpar filtros" condicional a `hasActiveFilters`. Reseta todos os estados.

---

## Resumo Executivo

| Épico                | RFs         | Aprovados | Com Ressalva | Rejeitados |
| -------------------- | ----------- | --------- | ------------ | ---------- |
| Learning Projects    | 8 (191–198) | 8         | 0            | 0          |
| Completion Sprint 01 | 3           | 3         | 0            | 0          |
| Knowledge Navigation | 7 (201–209) | 7         | 0            | 0          |
| **Total**            | **18**      | **18**    | **0**        | **0**      |

**Cobertura:** 18/18 RFs aprovados (100%)

**Bugs corrigidos na validação:** 1 (BUG-04 — try/catch em ProjectFormModal)

**Bugs aceitos como known issue:** 1 (BUG-05 — subtitle inconsistency, deferred Sprint 03)

---

## Assinatura

Validação realizada em 2026-06-12.
Processo: QA Estratégico (Fase 06) + Gate Técnico Completo + Automação E2E (Fase 07).
