# COGNITIVE-UX-EVOLUTION-01 — Evolução Cognitiva e Segurança de Dados

**Data:** 2026-06-10
**Status:** Em planejamento
**Versão alvo:** v2.1 → v2.2

---

## Contexto

O NeuroLearn armazena memória cognitiva do usuário — pensamentos, reflexões, aprendizado e flashcards. Hoje, o maior risco emocional e funcional do produto é a **perda acidental e irreversível de dados**. Paralelamente, a experiência ainda não transmite total sensação de controle e organização do aprendizado.

Este spec cobre as evoluções de maior impacto emocional e funcional que transformam o produto de "organizador de conteúdos" para "sistema de evolução cognitiva segura".

---

## Fases

| Fase | ID | Escopo | Prioridade | Esforço |
|------|----|--------|------------|---------|
| 1 — Soft Delete + Undo | α | AppContext + LibraryView + ContentDrawer | P0 | Médio |
| 2 — Ordenação dentro de trilha | β | AppContext + LibraryView + @dnd-kit/sortable | P1 | Grande |
| 3 — Escalabilidade (Gap B) | γ | React Query + virtualização | P2 | Muito grande |
| 4 — Backend hybrid metrics | δ | `/api/review/rate` + cálculo SM-2 server-side | P3 | Grande |

> Fases γ e δ são **roadmap** neste spec — sem implementação agora.

---

## FASE 1 — Soft Delete + Undo Toast (Gap α)

### Problema

Excluir um conteúdo hoje:
1. Abre ConfirmDialog (boa proteção contra clique acidental)
2. Ao confirmar → `DELETE_CONTENT` é despachado **imediatamente e irreversivelmente**
3. Isso deleta o conteúdo + todos os flashcards associados
4. Não há como desfazer

O usuário não sente **segurança emocional** sobre seus dados.

### Regras

| ID | Regra |
|----|-------|
| α-R01 | Ao confirmar exclusão de conteúdo, **não despachar DELETE_CONTENT imediatamente** |
| α-R02 | Mostrar toast de ação com "Conteúdo removido — Desfazer" com barra de progresso de 5s |
| α-R03 | Se o usuário clicar em "Desfazer" dentro de 5s → cancelar a exclusão (nenhuma ação no state) |
| α-R04 | Se o timer expirar sem ação → disparar `DELETE_CONTENT` no state/backend |
| α-R05 | Remover o item da lista **visualmente** durante o período de undo (optimistic removal) |
| α-R06 | Se o usuário navegar para outra página durante o período de undo → confirmar exclusão imediatamente |
| α-R07 | Ao excluir via ContentDrawer (botão remover no drawer) → mesma lógica de undo |
| α-R08 | Ao excluir trilha → NÃO mostrar undo toast (comportamento correto já existe: conteúdos vão para Inbox) |
| α-R09 | Apenas um undo pendente por vez (se o usuário excluir um segundo conteúdo, o primeiro é confirmado) |
| α-R10 | Cards de flashcard NÃO precisam de undo individual (exclusão de card via drawer continua com ConfirmDialog) |

### Componentes impactados

- `src/store/AppContext.tsx` — adicionar estado `pendingDelete: { content: Content; timer: ReturnType<typeof setTimeout> } | null`
- `src/modules/library/LibraryView.tsx` — `handleDeleteContent` e `handleDrawerDelete` passam a usar lógica de undo
- `src/components/ui/ContentDrawer.tsx` — botão remover usa lógica de undo
- `src/components/ui/Toast.tsx` — verificar se suporta ações (botão Desfazer) ou criar `ActionToast`
- `src/hooks/useToast.ts` — verificar se há suporte a `action` callback

### Critério de aceite

- [ ] Excluir conteúdo mostra toast por 5s com "Desfazer"
- [ ] Clicar "Desfazer" cancela a exclusão e restaura o item na lista
- [ ] Deixar o toast expirar confirma a exclusão (backend + state)
- [ ] Duas exclusões seguidas: a primeira é confirmada ao iniciar a segunda
- [ ] Excluir trilha NÃO mostra undo toast; conteúdos associados ficam em "Sem trilha"

---

## FASE 2 — Ordenação dentro de trilha via DnD (Gap β)

### Problema

Hoje o DnD permite mover conteúdos **entre trilhas**, mas não permite:
- Definir **sequência de estudo** dentro de uma trilha
- Criar **jornada cognitiva ordenada**

O campo `order` não existe no modelo `Content`. Os conteúdos aparecem na ordem de criação.

### Regras

| ID | Regra |
|----|--------|
| β-R01 | `Content` ganha campo opcional `order: number` (default: índice de inserção) |
| β-R02 | Dentro de cada seção de trilha, os conteúdos são exibidos ordenados por `order` ASC |
| β-R03 | Arrastar um conteúdo **dentro da mesma seção** reordena os itens da trilha |
| β-R04 | Arrastar um conteúdo **entre trilhas** mantém o comportamento atual (ASSIGN_CONTENT_TRAIL) |
| β-R05 | Ao soltar, despachar `REORDER_TRAIL_CONTENTS` com array de `{ id, order }` atualizado |
| β-R06 | Persistência: os novos valores de `order` devem ser salvos no Supabase |
| β-R07 | Conteúdos sem trilha (Inbox Cognitiva) também podem ser reordenados entre si |
| β-R08 | Ao adicionar novo conteúdo a uma trilha, recebe `order = max(existentes) + 1` |
| β-R09 | Visual de drag: card levemente opaco + sombra elevada durante o arrasto |
| β-R10 | Touch-friendly: funcionar em mobile (pointer events) |

### Decisões técnicas

| Decisão | Escolhida | Motivo |
|---------|-----------|--------|
| Biblioteca DnD para sorting | `@dnd-kit/sortable` | Já temos @dnd-kit/core; sortable é addon oficial |
| Persistência de `order` | Supabase + localStorage | Supabase é fonte da verdade; otimista no cliente |
| Schema migration | Adicionar coluna `order INTEGER DEFAULT 0` à tabela `contents` | Backward compatible (default 0) |
| Algoritmo de reordenação | Array index direto (0, 1, 2...) | Simples; sem gaps |

### Componentes impactados

- `src/types/index.ts` — `Content.order?: number`
- `src/store/AppContext.tsx` — `REORDER_TRAIL_CONTENTS` action
- `src/modules/library/LibraryView.tsx` — substituir `useDraggable` por `SortableContext` dentro de cada trilha
- `src/services/contentsService.ts` — novo método `updateContentOrders(updates: { id, order }[])`
- Supabase migration — `ALTER TABLE contents ADD COLUMN order INTEGER DEFAULT 0`

### Critério de aceite

- [ ] Conteúdos exibidos em ordem crescente por `order` dentro de cada trilha
- [ ] Arrastar e soltar dentro da trilha reordena visualmente + persiste
- [ ] Arrastar entre trilhas continua funcionando (move + desassocia trailId)
- [ ] Novo conteúdo adicionado a trilha aparece no final
- [ ] Funciona em mobile (touch)

---

## FASE 3 — Escalabilidade (Gap B) — ROADMAP

> **Não implementar nesta sprint.** Adicionar ao ROADMAP como F-110.

| Item | Complexidade | Quando |
|------|-------------|--------|
| React Query (cache, refetch, optimistic updates) | Muito grande | Após > 200 conteúdos/usuário |
| Virtualização de listas (react-virtual) | Grande | Após > 100 itens visíveis |
| Lazy loading de módulos | Médio | Após LCP > 2.5s |
| Infinite scroll na biblioteca | Médio | Junto com virtualização |

---

## FASE 4 — Backend Hybrid Metrics (F-031) — ROADMAP

> **Não implementar nesta sprint.** Já listado no ROADMAP como F-031.

| Item | Complexidade | Quando |
|------|-------------|--------|
| `POST /api/review/rate` — SM-2 server-side | Grande | Antes de lançar multi-usuário em escala |
| Jobs de recomputação de retenção | Grande | Junto com F-031 |
| Analytics server-side (por usuário) | Grande | Junto com F-031 |

---

## Riscos

| ID | Risco | Probabilidade | Impacto | Mitigação |
|----|-------|--------------|---------|-----------|
| α-RISK-01 | Timer de undo não sendo cancelado corretamente ao desmontar componente | Média | Alto (memory leak) | Cleanup no useEffect |
| α-RISK-02 | Múltiplos undos em rápida sucessão criando estado inconsistente | Baixa | Médio | α-R09 (apenas 1 undo pendente) |
| β-RISK-01 | Supabase migration quebrar dados existentes | Baixa | Alto | DEFAULT 0 backward-compatible |
| β-RISK-02 | `order` ficar dessincronizado entre múltiplos dispositivos | Média | Médio | Supabase é fonte da verdade; reload ao focar |

---

## Dependências externas

| Fase | Dependência | Status |
|------|-------------|--------|
| β | `@dnd-kit/sortable` (npm) | Não instalado |
| β | Supabase migration (ALTER TABLE contents) | Pendente |
| α | Toast com action callback | Verificar implementação atual |
