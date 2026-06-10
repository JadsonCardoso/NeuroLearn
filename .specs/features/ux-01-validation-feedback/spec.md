# UX-01 — Sistema Global de Validação, Feedback e UX Cognitiva

**Feature ID:** UX-01  
**Status:** Specified  
**Scope:** Large  
**Stack real:** Next.js 15 · React 19 · TypeScript · Tailwind · Zod (já instalado) · CSS custom properties

---

## Contexto

O NeuroLearn é uma plataforma cognitiva. A experiência deve ser clara, fluida, previsível e acolhedora. Hoje os formulários usam validação nativa do browser, mensagens genéricas, sem feedback de campo e sem estados visuais adequados.

---

## Decisões de Stack (Knowledge Verification)

| Tecnologia      | Decisão                  | Justificativa                                                                                                                                    |
| --------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| React Hook Form | ✅ Instalar              | Padrão de mercado para formulários React, integra com Zod                                                                                        |
| Zod             | ✅ Já instalado (v4.4.3) | Schemas de validação reutilizáveis                                                                                                               |
| Shadcn/UI       | ❌ Não usar              | App usa design system próprio com CSS custom properties. Shadcn quebraria o tema e estilos existentes. Usar componentes customizados melhorados. |
| Sonner          | ❌ Não instalar          | App já tem ToastContext + ToastContainer funcional e alinhado ao design system. Refinar o existente.                                             |
| TypeScript      | ✅ Já configurado        | Tipagem em todos os novos componentes                                                                                                            |

---

## Requisitos

### REQ-001 — Sem validação nativa do browser

- Todos os `<form>` devem ter `noValidate`
- Remover atributo `required` nativo dos inputs
- Substituir por validação customizada via Zod + React Hook Form

### REQ-002 — Campos obrigatórios marcados com `*`

- Label de todo campo obrigatório termina com ` *`
- A marcação é visual (cor `var(--color-danger)`)
- Não usar apenas placeholder como label

### REQ-003 — Componente `FormField` unificado

Criar `src/components/ui/FormField.tsx` que encapsula:

- `<label>` com suporte a `required` (asterisco automático)
- `<input>` / `<textarea>` / `<select>` via slot
- Mensagem de erro abaixo do campo (`FormError`)
- Dica contextual opcional (`FormHint`)
- Estado `aria-invalid` + `aria-describedby` automáticos
- Foco automático no primeiro campo com erro

### REQ-004 — Estados visuais obrigatórios por campo

| Estado   | Comportamento visual                             |
| -------- | ------------------------------------------------ |
| idle     | Borda `var(--border2)`                           |
| focus    | Borda `var(--color-primary)`, ring sutil         |
| error    | Borda `var(--color-danger)`, mensagem abaixo     |
| success  | Borda `var(--color-success)` (pós-submit válido) |
| disabled | Opacidade 0.5, `cursor: not-allowed`             |

### REQ-005 — Mensagens de erro contextuais

Formato obrigatório das mensagens: descrever **o que** errou + **como** corrigir.

Exemplos:

- `"Você precisa preencher o título do conteúdo."`
- `"O email informado não é válido. Use o formato nome@dominio.com"`
- `"O nome é obrigatório para criar sua conta."`
- `"Não foi possível enviar o link. Tente novamente em alguns instantes."`

Proibido:

- `"Campo obrigatório"`
- `"Invalid email"`
- `"Error"`

### REQ-006 — Sistema de Toast melhorado

Manter `ToastProvider` + `ToastContainer` existentes.  
Melhorias obrigatórias:

- Adicionar `title` opcional por toast (ex: "Flashcard criado" + descrição)
- Adicionar barra de progresso de auto-dismiss
- `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()` via `useToast`
- Posição: bottom-right (já implementado)
- Duração: 4s success/info, 6s error/warning

### REQ-007 — Loading UX em botões

- Botão em loading: `disabled` + spinner + texto contextual
- Spinner: SVG animado com `animate-spin` (Tailwind)
- Exemplos de texto: "Enviando...", "Salvando...", "Criando..."
- Nunca mudar o layout do botão durante loading (evitar CLS)

### REQ-008 — Acessibilidade obrigatória

Todos os campos devem ter:

- `<label htmlFor>` associado ao `id` do input
- `aria-invalid="true"` quando inválido
- `aria-describedby` apontando para o id da mensagem de erro
- `role="alert"` nas mensagens de erro inline
- Foco visível via `:focus-visible` (não `:focus`)
- Navegação por teclado funcional em modais (trap focus)

### REQ-009 — Refatoração de formulários existentes

Formulários a refatorar:

1. `/auth/login` — campo email
2. `/auth/signup` — campos nome + email
3. `AddContentModal` — campos título*, tipo*, autor, descrição

### REQ-010 — Schemas Zod centralizados

Criar `src/lib/validation/schemas.ts` com schemas reutilizáveis:

- `emailSchema`
- `nameSchema`
- `contentSchema`
- Mensagens de erro em português, contextuais

### REQ-011 — Componente `LoadingButton`

`src/components/ui/LoadingButton.tsx`:

- Props: `loading`, `loadingText`, `children`, + todos os props de button
- Previne double-click
- Mantém largura estável durante loading

### REQ-012 — CSS de estados de campo em globals.css

Adicionar em `globals.css`:

- `.input--error` — borda danger
- `.input--success` — borda success
- `.input:focus-visible` — ring de foco visível e acessível
- `:root { --ring-focus: ... }` token de foco

---

## Formulários mapeados

| Formulário         | Localização                           | Campos                      | Prioridade |
| ------------------ | ------------------------------------- | --------------------------- | ---------- |
| Login              | `app/auth/login/page.tsx`             | email\*                     | P0         |
| Signup             | `app/auth/signup/page.tsx`            | nome*, email*               | P0         |
| Adicionar Conteúdo | `modules/library/AddContentModal.tsx` | título*, tipo*, autor, desc | P1         |

---

## Componentes a criar/modificar

### Novos

- `src/components/ui/FormField.tsx` — campo unificado com label + erro + hint
- `src/components/ui/FormError.tsx` — mensagem de erro acessível
- `src/components/ui/FormHint.tsx` — dica contextual
- `src/components/ui/LoadingButton.tsx` — botão com estado loading
- `src/lib/validation/schemas.ts` — schemas Zod centralizados

### Modificados

- `src/components/ui/Input.tsx` — adicionar suporte a error, id, aria
- `src/components/ui/Textarea.tsx` — adicionar suporte a error, id, aria
- `src/store/ToastContext.tsx` — adicionar title + duração por tipo
- `src/components/ui/Toast.tsx` — adicionar barra de progresso
- `src/app/globals.css` — adicionar tokens e classes de estado
- `src/app/auth/login/page.tsx` — refatorar com React Hook Form
- `src/app/auth/signup/page.tsx` — refatorar com React Hook Form
- `src/modules/library/AddContentModal.tsx` — refatorar com React Hook Form

---

## Critério de Done

- [ ] `npm run type-check` passa sem erros
- [ ] `npm run build` passa sem erros
- [ ] `npm run lint` passa sem warnings
- [ ] Nenhum popup nativo do browser em nenhum formulário
- [ ] Todos os campos obrigatórios têm `*` visível
- [ ] Campos inválidos recebem borda vermelha + mensagem contextual
- [ ] Botões de submit mostram spinner durante loading
- [ ] Toasts aparecem em sucesso e erro de todas as ações
- [ ] `aria-invalid`, `aria-describedby`, `role="alert"` presentes nos campos
