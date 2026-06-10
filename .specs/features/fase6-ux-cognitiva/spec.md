# Spec — Fase 6: UX Cognitiva e Interface

**Status:** 🚧 In Progress
**Complexidade:** Large
**Princípio:** Leveza cognitiva. Foco. Clareza. Evolução visível.

---

## Auditoria do estado atual

| Área           | Problema encontrado                                      | Impacto                               |
| -------------- | -------------------------------------------------------- | ------------------------------------- |
| Tipografia     | 8+ tamanhos hardcoded (10–22px) sem escala               | Alto — inconsistência visual          |
| Tokens         | Sem semântica de cor (primary, success, warning, danger) | Alto — manutenção impossível          |
| Espaçamento    | Valores arbitrários em cada componente                   | Médio — layout inconsistente          |
| Toast/Feedback | Inexistente — usuário não sabe se ação funcionou         | Alto — UX quebrado                    |
| Empty states   | Emoji + texto, sem hierarquia                            | Médio — percepção de vazio = abandono |
| Loading        | Sem skeleton ou indicadores                              | Médio — sensação de app travado       |
| Sidebar mobile | Fixed 220px — layout quebrado em telas < 768px           | Alto — inacessível mobile             |
| Dashboard      | Sobrecarga cognitiva — tudo tem mesmo peso visual        | Alto — usuário não sabe o que fazer   |
| Página headers | Sem padrão — cada módulo faz diferente                   | Médio — falta de consistência         |

---

## Requisitos

### UX-F01 — Sistema de tokens semânticos

**Onde:** `src/app/globals.css`

**Tokens a adicionar:**

- Escala tipográfica: `--text-xs` (10px) → `--text-2xl` (24px)
- Escala de espaçamento: `--space-1` (4px) → `--space-16` (64px)
- Cores semânticas: `--color-primary`, `--color-primary-dim`, `--color-success`, `--color-warning`, `--color-danger`
- Animações: `--duration-fast` (150ms), `--duration-base` (250ms), `--duration-slow` (400ms)
- Raios: `--radius-sm` (6px), `--radius-md` (10px), `--radius-lg` (14px), `--radius-full` (9999px)

**Done when:** `globals.css` tem todos os tokens, sem quebrar estilos existentes.

---

### UX-F02 — Toast / Sistema de Feedback

**Onde:** `src/components/ui/Toast.tsx` + `src/hooks/useToast.tsx`

**Tipos:**

- `success` — ação completada com sucesso
- `error` — algo deu errado
- `info` — informação neutra
- `warning` — atenção necessária

**Comportamento:**

- Aparece no canto inferior direito
- Auto-dismiss em 4s
- Máximo 3 toasts simultâneos
- Dismiss manual com botão ×
- Animação slide-in + fade-out

**Done when:** Hook `useToast()` exporta `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()`.

---

### UX-F03 — EmptyState Component

**Onde:** `src/components/ui/EmptyState.tsx`

**Props:**

```typescript
interface EmptyStateProps {
  icon: string // emoji ou ícone
  title: string // máx 6 palavras
  description?: string // contexto do estado vazio
  action?: {
    label: string
    onClick: () => void
  }
}
```

**Usos:**

- Dashboard sem cards: "Nenhum card para revisar hoje"
- Library sem conteúdos: "Sua biblioteca está vazia"
- Review sem cards pendentes: "Em dia com as revisões"
- Skills sem habilidades: "Nenhuma habilidade adicionada"

**Done when:** Componente renderiza ícone + título + descrição + botão de ação opcional, com visual consistente.

---

### UX-F04 — Skeleton / Loading States

**Onde:** `src/components/ui/Skeleton.tsx`

**Variantes:**

- `Skeleton.Card` — placeholder de card retangular
- `Skeleton.Text` — placeholder de linha de texto
- `Skeleton.Circle` — placeholder circular (avatar/ring)

**Comportamento:** Shimmer animation horizontal (esquerda → direita).

**Done when:** Skeletons têm animação shimmer e podem ser compostos em layouts realistas.

---

### UX-F05 — Sidebar Mobile Responsiva

**Onde:** `src/components/layout/Sidebar.tsx` + `src/app/(app)/layout.tsx`

**Comportamento:**

- `>= 768px` (desktop): sidebar fixa à esquerda, 220px
- `< 768px` (mobile): sidebar oculta por padrão; botão hamburger no topo abre como drawer com overlay
- Active state: highlight com cor primary + indicador left bar
- Fechar drawer ao navegar (clicar em item)

**Done when:** Em viewport mobile, sidebar colapsa; hamburger abre/fecha; overlay escurece o conteúdo.

---

### UX-F06 — PageHeader Component

**Onde:** `src/components/ui/PageHeader.tsx`

**Props:**

```typescript
interface PageHeaderProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode // botão ou badge no lado direito
}
```

**Done when:** Componente usado em pelo menos Dashboard e Library, com visual consistente.

---

### UX-F07 — Dashboard Hierarquia Cognitiva

**Onde:** `src/modules/dashboard/DashboardView.tsx`

**Melhorias:**

- Saudação contextual (bom dia/tarde/noite)
- CTA principal destacado: botão "Iniciar Revisão" com destaque se houver cards pendentes
- Stats cards: refatorar para usar tokens semânticos
- Seção de risco: usar EmptyState quando não há risco
- Usar PageHeader para consistência

**Done when:** Dashboard usa EmptyState, PageHeader, tokens semânticos; hierarquia visual clara (CTA > stats > calendário).

---

## Não inclui

- Redesign completo de módulos (Library, Review, Skills, Focus) — fora do escopo
- Animações de página entre rotas — fora do escopo
- Onboarding/tutorial — próxima fase
- Mobile-first layout dos módulos internos — próxima fase
