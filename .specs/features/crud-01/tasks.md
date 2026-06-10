# CRUD-01 — Tasks

## Ordem de execução

As tarefas são sequenciais — cada uma depende da anterior ou de infraestrutura estável.

---

## T-01 — Toast integration no AppContext

**O quê:** Importar `useToast` no AppContext e disparar toasts em todas as mutations.  
**Onde:** `src/store/AppContext.tsx`  
**Depende de:** nada (ToastContext já existe)  
**Feito quando:** Todas as ações CR-01 emitem toast. try/catch com toast error em cada case.

**Ações a cobrir:**

- ADD_CONTENT → success "Conteúdo adicionado com sucesso."
- DELETE_CONTENT → success "Conteúdo removido."
- ADD_CARDS → success "Flashcards criados! ({n} cards)"
- ADD_SKILL → success "Habilidade adicionada."
- DELETE_SKILL → success "Habilidade removida."
- FINISH_SESSION → success "Sessão concluída! +{xp} XP"
- Qualquer erro no catch → error "Não foi possível concluir a operação. Tente novamente."

**Gate:** `npm run type-check && npm run lint`

---

## T-02 — ConfirmDialog component

**O quê:** Componente reutilizável de confirmação destrutiva.  
**Onde:** `src/components/ui/ConfirmDialog.tsx`  
**Depende de:** nada  
**Feito quando:** Renderiza overlay com título, descrição, botões Cancelar/Confirmar. Suporta `loading` state. ESC fecha. aria-dialog. Variant danger (vermelho) e warning (âmbar).

**Gate:** `npm run type-check && npm run lint`

---

## T-03 — Substituir window.confirm em LibraryView e SkillsView

**O quê:** Trocar `if (confirm(...))` pelo `<ConfirmDialog>` em ambos os módulos.  
**Onde:** `src/modules/library/LibraryView.tsx`, `src/modules/skills/SkillsView.tsx`  
**Depende de:** T-02  
**Feito quando:** Nenhum `window.confirm` existe nos dois arquivos. ConfirmDialog aparece ao clicar delete. Loading state durante a operação.

**Gate:** `npm run type-check && npm run lint`

---

## T-04 — Flashcard DELETE (service + action + reducer)

**O quê:** Implementar a operação de delete de flashcard na camada de dados e estado.  
**Onde:**

- `src/services/flashcardsService.ts` → `deleteFlashcard(id)`
- `src/types/index.ts` → action `DELETE_CARD`
- `src/store/AppContext.tsx` → reducer case + dispatch side effect com toast

**Depende de:** T-01  
**Feito quando:** `dispatch({ type: 'DELETE_CARD', payload: id })` remove o card do estado e do Supabase. Toast success/error.

**Gate:** `npm run type-check && npm run test:unit`

---

## T-05 — Edit Content (service + action + reducer)

**O quê:** Implementar edição de conteúdo na camada de dados e estado.  
**Onde:**

- `src/services/contentsService.ts` → `updateContent(id, data)`
- `src/types/index.ts` → action `UPDATE_CONTENT`
- `src/store/AppContext.tsx` → reducer case + dispatch side effect com toast

**Depende de:** T-01  
**Feito quando:** `dispatch({ type: 'UPDATE_CONTENT', payload: {...} })` atualiza o estado e Supabase. Toast "Conteúdo atualizado com sucesso."

**Gate:** `npm run type-check && npm run test:unit`

---

## T-06 — Edit Flashcard (service + action + reducer)

**O quê:** Implementar edição de front/back de flashcard na camada de dados e estado.  
**Onde:**

- `src/services/flashcardsService.ts` → `updateFlashcard(id, {front, back})`
- `src/types/index.ts` → action `UPDATE_CARD`
- `src/store/AppContext.tsx` → reducer case + dispatch side effect com toast

**Depende de:** T-01  
**Feito quando:** `dispatch({ type: 'UPDATE_CARD', payload: {...} })` atualiza estado e Supabase. Toast "Flashcard atualizado."

**Gate:** `npm run type-check && npm run test:unit`

---

## T-07 — UI: Delete e Edit de flashcards em LibraryView

**O quê:** Adicionar ações de editar e deletar cards na lista de flashcards de um conteúdo.  
**Onde:** `src/modules/library/LibraryView.tsx` (ou subcomponente)  
**Depende de:** T-03, T-04, T-06  
**Feito quando:** Cada card exibe botões Edit/Delete. Delete usa ConfirmDialog. Edit abre modal com formulário validado (Zod). Loading state em ambas.

**Gate:** `npm run type-check && npm run lint`

---

## T-08 — UI: Modal de edição de conteúdo em LibraryView

**O quê:** Adicionar botão "Editar" em cada conteúdo, abrindo modal com formulário.  
**Onde:** `src/modules/library/LibraryView.tsx`  
**Depende de:** T-05  
**Feito quando:** Modal de edição abre pré-populado com dados atuais. Salva via `UPDATE_CONTENT`. Toast success/error. Loading state.

**Gate:** `npm run type-check && npm run lint`

---

## T-09 — Testes unitários

**O quê:** Testes para as novas funções de service.  
**Onde:** `src/services/flashcardsService.test.ts`, `src/services/contentsService.test.ts`  
**Depende de:** T-04, T-05, T-06  
**Feito quando:** Testes cobrem delete, updateContent, updateFlashcard com casos válidos, inválidos e erro de rede simulado.

**Gate:** `npm run test:unit` — todos passando

---

## T-10 — Gate final

**O quê:** Validação completa antes de commit.  
**Feito quando:** `npm run type-check && npm run lint && npm run test:unit && npm run build` — tudo limpo.

---

## Resumo de arquivos modificados

| Arquivo                                  | Tipo            | Tasks                  |
| ---------------------------------------- | --------------- | ---------------------- |
| `src/store/AppContext.tsx`               | Modificar       | T-01, T-04, T-05, T-06 |
| `src/components/ui/ConfirmDialog.tsx`    | Criar           | T-02                   |
| `src/modules/library/LibraryView.tsx`    | Modificar       | T-03, T-07, T-08       |
| `src/modules/skills/SkillsView.tsx`      | Modificar       | T-03                   |
| `src/services/flashcardsService.ts`      | Modificar       | T-04, T-06             |
| `src/services/contentsService.ts`        | Modificar       | T-05                   |
| `src/types/index.ts`                     | Modificar       | T-04, T-05, T-06       |
| `src/services/flashcardsService.test.ts` | Criar/Modificar | T-09                   |
| `src/services/contentsService.test.ts`   | Criar/Modificar | T-09                   |
