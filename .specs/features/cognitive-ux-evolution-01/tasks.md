# COGNITIVE-UX-EVOLUTION-01 — Tasks

**Updated:** 2026-06-10
**Gate:** `npm run type-check && npm run lint && npm run test:unit && npm run build`

---

## FASE 1 — Soft Delete + Undo Toast (Gap α)

### T-α-01 — Auditar sistema de Toast atual

**O que:** Ler `src/components/ui/Toast.tsx` e `src/hooks/useToast.ts` para verificar se suportam `action: { label, onClick }`.

**Onde:** `src/components/ui/Toast.tsx`, `src/hooks/useToast.ts`

**Critério de done:**
- [ ] Confirmado se Toast suporta callback de ação
- [ ] Decidido: estender Toast existente vs. criar ActionToast

**Estimativa:** 15 min

---

### T-α-02 — Estender Toast com suporte a ação (se necessário)

**Depende de:** T-α-01

**O que:** Adicionar prop opcional `action?: { label: string; onClick: () => void }` ao Toast. Exibir barra de progresso de ~5s.

**Onde:** `src/components/ui/Toast.tsx`, `src/hooks/useToast.ts`, `src/store/ToastContext.tsx`

**Critério de done:**
- [ ] Toast aceita `action` callback
- [ ] Botão "Desfazer" visível no toast de exclusão
- [ ] Barra de progresso de 5s visível
- [ ] `type-check` zero erros

---

### T-α-03 — Implementar lógica de undo em LibraryView

**Depende de:** T-α-02

**O que:**
1. Remover chamada direta ao `ConfirmDialog → handleDeleteContent` (manter ConfirmDialog)
2. Após confirmar no ConfirmDialog: remover item **visualmente** da lista (optimistic) + iniciar timer 5s
3. Timer expira → `dispatch({ type: 'DELETE_CONTENT', payload: id })`
4. "Desfazer" clicado → cancelar timer + restaurar item na lista

**Onde:** `src/modules/library/LibraryView.tsx`

**Critério de done:**
- [ ] Item desaparece da lista ao confirmar exclusão
- [ ] Toast "Desfazer" aparece por 5s
- [ ] Clicar "Desfazer" restaura o item
- [ ] Após 5s sem ação, DELETE_CONTENT é despachado
- [ ] Segundo DELETE antes do undo confirma o primeiro
- [ ] `type-check` + `lint` zero erros

---

### T-α-04 — Aplicar mesma lógica ao ContentDrawer

**Depende de:** T-α-02

**O que:** Botão remover no `ContentDrawer` dispara mesma lógica de undo (fechar drawer + undo toast).

**Onde:** `src/components/ui/ContentDrawer.tsx`

**Critério de done:**
- [ ] Remover via ContentDrawer fecha o drawer e exibe toast de undo
- [ ] Clicar "Desfazer" reabre visualmente o item (não precisa reabrir drawer automaticamente)
- [ ] `type-check` zero erros

---

### T-α-05 — Testes unitários do mecanismo de undo

**Depende de:** T-α-03

**O que:** Escrever testes Vitest para a lógica do timer de undo. Não testa UI — testa a lógica de estado.

**Onde:** `src/__tests__/softDelete.test.ts` (ou próximo ao módulo)

**Critério de done:**
- [ ] Teste: timer expira → DELETE_CONTENT despachado
- [ ] Teste: undo cancelado → DELETE_CONTENT NÃO despachado
- [ ] Teste: segundo delete confirma o primeiro
- [ ] `test:unit` 100% passando

---

### T-α-06 — Gate e commit Fase 1

**Depende de:** T-α-01..T-α-05

**O que:** Executar gate completo, corrigir problemas, commitar.

**Gate:**
```bash
npm run type-check && npm run lint && npm run test:unit && npm run build
```

---

## FASE 2 — Ordenação dentro de trilha (Gap β)

### T-β-01 — Schema Supabase + tipo TypeScript

**O que:**
1. Migration Supabase: `ALTER TABLE contents ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;`
2. Atualizar `src/types/index.ts`: `Content.order?: number`
3. Atualizar serviço de contents para incluir `order` no SELECT

**Onde:** Supabase MCP + `src/types/index.ts` + `src/services/contentsService.ts`

**Critério de done:**
- [ ] Migration aplicada sem erro
- [ ] `Content.order?: number` no tipo
- [ ] `type-check` zero erros

---

### T-β-02 — Nova action `REORDER_TRAIL_CONTENTS`

**Depende de:** T-β-01

**O que:**
1. Adicionar ao `AppAction`: `{ type: 'REORDER_TRAIL_CONTENTS'; payload: { id: string; order: number }[] }`
2. Implementar no reducer: atualiza `order` dos conteúdos listados
3. Implementar no `useSync` (AppContext async): chama `updateContentOrders(payload)` no Supabase

**Onde:** `src/types/index.ts`, `src/store/AppContext.tsx`

**Critério de done:**
- [ ] Reducer atualiza `order` corretamente
- [ ] Teste unitário: verifica que reducer aplica os novos orders
- [ ] `type-check` zero erros

---

### T-β-03 — Instalar @dnd-kit/sortable

**Depende de:** T-β-01

**O que:** `npm install @dnd-kit/sortable`

**Critério de done:**
- [ ] Instalado e listado em `package.json`
- [ ] `npm run build` sem erros

---

### T-β-04 — Implementar sorting na LibraryView

**Depende de:** T-β-02, T-β-03

**O que:**
1. Dentro de cada `DroppableTrailSection`, envolver com `SortableContext` + `arrayMove` do @dnd-kit/sortable
2. `DraggableCard` usa `useSortable` (em vez de apenas `useDraggable`) para permitir reordenação
3. `handleDragEnd` diferencia: mesmo `trailId` → `REORDER_TRAIL_CONTENTS`; trailId diferente → `ASSIGN_CONTENT_TRAIL`
4. Conteúdos exibidos ordenados por `order` dentro de cada seção

**Onde:** `src/modules/library/LibraryView.tsx`

**Critério de done:**
- [ ] Arrastar dentro da mesma trilha reordena
- [ ] Arrastar entre trilhas ainda funciona
- [ ] Ordem é persistida (REORDER_TRAIL_CONTENTS é despachado)
- [ ] `type-check` + `lint` zero erros

---

### T-β-05 — Serviço Supabase para `updateContentOrders`

**Depende de:** T-β-01

**O que:** Implementar em `src/services/contentsService.ts` função que faz batch update dos `order` values.

**Onde:** `src/services/contentsService.ts`

**Critério de done:**
- [ ] `updateContentOrders(updates: { id: string; order: number }[])` funcional
- [ ] Atualização em batch (múltiplos upserts ou loop)
- [ ] `type-check` zero erros

---

### T-β-06 — Testes unitários do reducer REORDER_TRAIL_CONTENTS

**Depende de:** T-β-02

**O que:** Testes Vitest para o novo reducer.

**Onde:** `src/store/AppContext.test.ts`

**Critério de done:**
- [ ] Teste: reordena conteúdos corretamente
- [ ] Teste: não altera conteúdos de outra trilha
- [ ] `test:unit` 100% passando

---

### T-β-07 — Gate e commit Fase 2

**Depende de:** T-β-01..T-β-06

**O que:** Gate completo + commit.

**Gate:**
```bash
npm run type-check && npm run lint && npm run test:unit && npm run build
```

---

## Resumo de dependências

```
T-α-01
  └─ T-α-02
       ├─ T-α-03 ─── T-α-05
       └─ T-α-04
  (todos) ─── T-α-06

T-β-01
  ├─ T-β-02 ─── T-β-06
  │     └─ T-β-04
  ├─ T-β-03 ─── T-β-04
  └─ T-β-05
  (todos) ─── T-β-07
```

---

## Status

| Task | Status |
|------|--------|
| T-α-01 | ⬜ Pendente |
| T-α-02 | ⬜ Pendente |
| T-α-03 | ⬜ Pendente |
| T-α-04 | ⬜ Pendente |
| T-α-05 | ⬜ Pendente |
| T-α-06 | ⬜ Pendente |
| T-β-01 | ⬜ Pendente |
| T-β-02 | ⬜ Pendente |
| T-β-03 | ⬜ Pendente |
| T-β-04 | ⬜ Pendente |
| T-β-05 | ⬜ Pendente |
| T-β-06 | ⬜ Pendente |
| T-β-07 | ⬜ Pendente |
