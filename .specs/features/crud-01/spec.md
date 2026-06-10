# CRUD-01 — Padronização Completa de CRUD, Feedback Global e Sincronização de Estado

**Status:** In progress  
**Prioridade:** Alta  
**Escopo:** Large — múltiplos arquivos, decisões arquiteturais, sem ambiguidade

---

## Contexto

Auditoria revelou inconsistências críticas no ciclo de vida das entidades do NeuroLearn:

- Flashcard sem DELETE (usuário não pode corrigir cards malformados)
- Toast system implementado mas nunca integrado às mutações
- Nenhuma operação exibe feedback visual de sucesso ou erro
- Confirmações de delete usam `window.confirm()` (UX pobre, inconsistente)
- Sem tratamento visual de erros — falhas Supabase são silenciosas
- Sem modal de edição para conteúdos ou flashcards

---

## Arquitetura existente relevante

- **AppContext.tsx** — reducer centralizado + side effects Supabase (padrão: dispatch otimista → service)
- **ToastContext.tsx** — sistema de toast completo, MAX 3, animações, duration por tipo
- **useToast.tsx** — hook pronto mas nunca importado em nenhum módulo
- **Services** — functions puras Supabase por entidade em `src/services/`
- **Sem React Query** — estado puro Redux-like, sem cache layer
- **Padrão de modal** — useState + overlay fixed + ESC key (estabelecido em LibraryView/SkillsView)

---

## Requisitos

### CR-01 — Toast em todas as mutações AppContext

Toda operação bem-sucedida deve emitir toast success.  
Toda falha deve emitir toast error com mensagem amigável.  
O toast não deve bloquear o fluxo.

**Ações a cobrir:**

- ADD_CONTENT → "Conteúdo adicionado com sucesso."
- DELETE_CONTENT → "Conteúdo removido."
- ADD_CARDS → "Flashcards criados com sucesso."
- RATE_CARD → (sem toast — ação frequente, geraria ruído)
- ADD_SKILL → "Habilidade adicionada."
- DELETE_SKILL → "Habilidade removida."
- FINISH_SESSION → "Sessão concluída! +{xp} XP"
- EARN_XP → (sem toast — interno)
- Qualquer erro → "Não foi possível concluir a operação."

### CR-02 — Error handling visual em AppContext

O bloco de dispatch deve ter try/catch por action.  
Erros Supabase devem disparar toast error.  
Estado otimista deve ser revertido (rollback) em caso de falha nas ações destrutivas.

### CR-03 — ConfirmDialog component reutilizável

Substituir `window.confirm()` em LibraryView e SkillsView.  
Componente: `src/components/ui/ConfirmDialog.tsx`

Props:

- `open: boolean`
- `title: string`
- `description: string`
- `confirmLabel?: string` (default: "Confirmar")
- `cancelLabel?: string` (default: "Cancelar")
- `variant?: 'danger' | 'warning'` (default: danger)
- `loading?: boolean`
- `onConfirm: () => void`
- `onCancel: () => void`

UX: overlay + ESC close + foco no botão confirmar + aria-dialog.

### CR-04 — Flashcard DELETE

Adicionar `deleteFlashcard(id)` em `flashcardsService.ts`.  
Adicionar action `DELETE_CARD` em types e reducer.  
Adicionar dispatch side effect em AppContext.  
Adicionar UI de delete em LibraryView (lista de cards do conteúdo) com ConfirmDialog.

### CR-05 — Edit Content

Adicionar `updateContent(id, {title, type, author, description})` em `contentsService.ts`.  
Adicionar action `UPDATE_CONTENT` em types e reducer.  
Adicionar dispatch side effect em AppContext.  
Adicionar modal de edição em LibraryView com formulário validado (Zod, reutiliza contentSchema).

### CR-06 — Edit Flashcard

Adicionar `updateFlashcard(id, {front, back})` em `flashcardsService.ts`.  
Adicionar action `UPDATE_CARD` em types e reducer.  
Adicionar dispatch side effect em AppContext.  
Adicionar modal de edição de card com formulário validado.

---

## Fora de escopo (documentado como decisão de design)

- **study_sessions READ**: tabela é append-only de analytics, sem UI de histórico planejada nesta fase
- **review_cycles READ/UPDATE/DELETE**: log puro, imutável por design
- **retention_metrics READ/UPDATE/DELETE**: histórico de retenção, consumido apenas via engine
- **cognitive_events CRUD**: log de eventos, nunca exposto na UI
- **skills globais UPDATE/DELETE**: catálogo compartilhado entre usuários, imutável por design

---

## Critério de conclusão

- [ ] `useToast` integrado no AppContext — toast em todas as ações listadas
- [ ] Try/catch com toast error em todo dispatch side effect
- [ ] `ConfirmDialog` criado e usado em LibraryView e SkillsView
- [ ] `deleteFlashcard` service + action + UI funcionando
- [ ] `updateContent` service + action + modal funcionando
- [ ] `updateFlashcard` service + action + modal funcionando
- [ ] type-check limpo, lint limpo, testes unitários passando
- [ ] Build de produção limpo
