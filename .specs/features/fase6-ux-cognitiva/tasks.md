# Tasks — Fase 6: UX Cognitiva

**Total:** 9 tasks

---

## T01 — Tokens semânticos (globals.css)

**What:** Adicionar escala tipográfica, espaçamento, cores semânticas, raios e motion tokens
**Where:** `src/app/globals.css`
**Depends on:** —
**Done when:** Todos os tokens listados no design.md estão no `:root`; dark/light continuam funcionando
**Gate:** `npm run build` passa

---

## T02 — ToastContext + useToast

**What:** Context provider + hook `useToast()` com `toast.success/error/info/warning`
**Where:** `src/store/ToastContext.tsx`, `src/hooks/useToast.tsx`
**Depends on:** T01
**Done when:** Hook exporta as 4 funções; ToastProvider encapsula o estado
**Gate:** `npm run type-check` passa

---

## T03 — Toast UI component

**What:** `ToastItem` (item individual) + `ToastContainer` (renderiza lista)
**Where:** `src/components/ui/Toast.tsx`
**Depends on:** T01, T02
**Done when:** Toasts aparecem no canto inferior direito; auto-dismiss 4s; dismiss manual; animações entrada/saída
**Gate:** `npm run build` passa

---

## T04 — EmptyState component

**What:** Componente reutilizável para estados vazios
**Where:** `src/components/ui/EmptyState.tsx`
**Depends on:** T01
**Done when:** Props icon + title + description + action funcionam; visual com borda dashed
**Gate:** `npm run type-check` passa

---

## T05 — Skeleton component

**What:** Skeleton.Card, Skeleton.Text, Skeleton.Circle com shimmer animation
**Where:** `src/components/ui/Skeleton.tsx`
**Depends on:** T01
**Done when:** Três variantes funcionam; shimmer animation visível
**Gate:** `npm run type-check` passa

---

## T06 — PageHeader component

**What:** Header de página reutilizável com icon + title + subtitle + action slot
**Where:** `src/components/ui/PageHeader.tsx`
**Depends on:** T01
**Done when:** Componente aceita todas as props; visual consistente
**Gate:** `npm run type-check` passa

---

## T07 — Sidebar responsiva (mobile)

**What:** Sidebar colapsa em mobile; hamburger abre drawer com overlay
**Where:** `src/components/layout/Sidebar.tsx`, `src/app/(app)/layout.tsx`
**Depends on:** T01
**Done when:** < 768px: sidebar oculta por padrão, hamburger no topo funciona, overlay fecha ao clicar, fecha ao navegar
**Gate:** `npm run build` passa

---

## T08 — Dashboard hierarquia cognitiva

**What:** Dashboard usa PageHeader, EmptyState, tokens semânticos; CTA principal destacado
**Where:** `src/modules/dashboard/DashboardView.tsx`
**Depends on:** T01, T02, T04, T06
**Done when:** Dashboard usa novos componentes; saudação contextual (manhã/tarde/noite); hierarquia visual clara
**Gate:** `npm run build` passa

---

## T09 — Integração + validação final

**What:** Injetar ToastProvider + ToastContainer no layout; lint + type-check + build
**Where:** `src/app/(app)/layout.tsx`
**Depends on:** T02, T03, T07
**Done when:** Lint ✅ type-check ✅ build ✅ sem regressões
**Gate:** `npm run lint && npm run type-check && npm run build` todos passam
