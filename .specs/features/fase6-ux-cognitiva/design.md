# Design — Fase 6: UX Cognitiva

## Escala tipográfica

```css
--text-xs: 10px; /* metadados, timestamps */
--text-sm: 11px; /* labels secundários */
--text-base: 13px; /* body padrão */
--text-md: 14px; /* subtítulos */
--text-lg: 16px; /* títulos de seção */
--text-xl: 20px; /* títulos de página */
--text-2xl: 24px; /* métricas destacadas */
--text-3xl: 32px; /* números grandes */
```

## Escala de espaçamento

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

## Cores semânticas (mesmos valores dark/light)

```css
--color-primary: #7c3aed;
--color-primary-dim: rgba(124, 58, 237, 0.12);
--color-primary-text: #a78bfa;
--color-success: #10b981;
--color-success-dim: rgba(16, 185, 129, 0.12);
--color-warning: #f59e0b;
--color-warning-dim: rgba(245, 158, 11, 0.12);
--color-danger: #ef4444;
--color-danger-dim: rgba(239, 68, 68, 0.12);
--color-info: #06b6d4;
--color-info-dim: rgba(6, 182, 212, 0.12);
```

## Raios e motion

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 20px;
--radius-full: 9999px;

--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 400ms;
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
```

## Toast — estrutura

```
┌──────────────────────────────────────────┐
│  [●] Ação completada com sucesso        [×]│
└──────────────────────────────────────────┘
```

- Posição: `fixed bottom-4 right-4`
- Stack vertical (mais recente por cima)
- Width: 320px
- Border-left: 4px solid var(--color-{type})
- Shimmer de progresso na base (4s TTL)

## Toast — arquitetura

```
ToastProvider (context)
  └── ToastContainer (renderiza lista de toasts)
        └── ToastItem (item individual)

useToast() → { toast }
  toast.success(msg)
  toast.error(msg)
  toast.info(msg)
  toast.warning(msg)
```

Context em `src/store/ToastContext.tsx`.
ToastContainer injetado no `src/app/(app)/layout.tsx`.

## EmptyState — variantes visuais

```
        [ÍCONE 48px]
        Título curto
        Descrição opcional mais longa
        [Botão de ação]      ← opcional
```

Background: `var(--card2)`, border: dashed `var(--border2)`, border-radius: `var(--radius-lg)`.

## Skeleton — shimmer

```css
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}
background: linear-gradient(90deg, var(--card2) 25%, var(--border2) 50%, var(--card2) 75%);
background-size: 200% 100%;
animation: shimmer 1.4s ease infinite;
```

## Sidebar Mobile

```
Desktop (>=768px):        Mobile (<768px):
┌──────────┬──────────┐   ┌──────────────────┐
│ Sidebar  │  main    │   │ [☰] NeuroLearn   │
│  220px   │          │   │──────────────────│
│          │          │   │       main       │
│          │          │   │                  │
└──────────┴──────────┘   └──────────────────┘

                          Quando aberto:
                          ┌────────┬──────────┐
                          │Sidebar │  overlay  │
                          │        │  bg-50%   │
                          └────────┴──────────┘
```

Estado: `sidebarOpen: boolean` gerenciado em `(app)/layout.tsx` via useState + passado ao Sidebar como prop.

## PageHeader — estrutura

```
┌─────────────────────────────────────────────┐
│ [ícone] Título da Página         [ação btn] │
│         Subtítulo opcional                  │
└─────────────────────────────────────────────┘
```

## Dashboard — nova hierarquia cognitiva

```
1. PageHeader (saudação + data)
2. CTA Principal — "X cards para revisar" (destaque máximo se > 0)
3. Stats Row (4 métricas)
4. Grid 2fr/1fr:
   Left:  Reviews pendentes | Calendário
   Right: Retenção Ring | Em progresso | Habilidades
```

## Arquivos a criar/modificar

```
globals.css                         ← tokens estendidos
src/store/ToastContext.tsx           ← context + provider
src/hooks/useToast.tsx               ← hook público
src/components/ui/Toast.tsx          ← UI dos toasts
src/components/ui/EmptyState.tsx     ← empty states
src/components/ui/Skeleton.tsx       ← loading skeletons
src/components/ui/PageHeader.tsx     ← page header
src/components/layout/Sidebar.tsx    ← mobile responsivo
src/app/(app)/layout.tsx             ← ToastContainer + mobile wrapper
src/modules/dashboard/DashboardView.tsx ← hierarquia cognitiva
```
