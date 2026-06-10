# UX-01 — Tasks

**Feature ID:** UX-01  
**Status:** Ready to execute

---

## Tarefas

### T-01 — Instalar react-hook-form

**What:** `npm install react-hook-form`  
**Where:** package.json  
**Done when:** `import { useForm } from 'react-hook-form'` compila sem erros  
**Gate:** `npm run type-check`

---

### T-02 — Criar schemas Zod centralizados

**What:** Criar `src/lib/validation/schemas.ts` com `emailSchema`, `nameSchema`, `loginSchema`, `signupSchema`, `contentSchema`  
**Where:** `src/lib/validation/schemas.ts` (novo arquivo)  
**Depends on:** T-01  
**Done when:** Arquivo criado, sem erros de tipo  
**Gate:** `npm run type-check`

---

### T-03 — Adicionar CSS de estados de campo

**What:** Adicionar classes `.input--error`, `.input:focus-visible`, `.form-error`, `.form-hint` e tokens `--ring-focus` em `globals.css`  
**Where:** `src/app/globals.css`  
**Done when:** Classes definidas corretamente  
**Gate:** `npm run build`

---

### T-04 — Melhorar componente Input

**What:** Adicionar prop `error?: boolean`, aplicar `aria-invalid`, classe `.input--error`  
**Where:** `src/components/ui/Input.tsx`  
**Depends on:** T-03  
**Done when:** `<Input error />` renderiza com borda vermelha  
**Gate:** `npm run type-check`

---

### T-05 — Melhorar componente Textarea

**What:** Mesmo padrão do Input: prop `error?: boolean`, `aria-invalid`, `.input--error`  
**Where:** `src/components/ui/Textarea.tsx`  
**Depends on:** T-03  
**Done when:** `<Textarea error />` renderiza com borda vermelha  
**Gate:** `npm run type-check`

---

### T-06 — Criar FormError

**What:** Componente `src/components/ui/FormError.tsx` com `id`, `role="alert"`, `aria-live="polite"`  
**Where:** `src/components/ui/FormError.tsx` (novo)  
**Depends on:** T-03  
**Done when:** Componente renderiza mensagem acessível  
**Gate:** `npm run type-check`

---

### T-07 — Criar FormHint

**What:** Componente `src/components/ui/FormHint.tsx` para dicas contextuais  
**Where:** `src/components/ui/FormHint.tsx` (novo)  
**Depends on:** T-03  
**Done when:** Componente renderiza sem erros  
**Gate:** `npm run type-check`

---

### T-08 — Criar FormField

**What:** Componente `src/components/ui/FormField.tsx` que compõe label + asterisco + children + FormError + FormHint  
**Where:** `src/components/ui/FormField.tsx` (novo)  
**Depends on:** T-04, T-05, T-06, T-07  
**Done when:** `<FormField label="Email" required error="...">` renderiza corretamente  
**Gate:** `npm run type-check`

---

### T-09 — Criar LoadingButton

**What:** Componente `src/components/ui/LoadingButton.tsx` com props `loading`, `loadingText`, spinner SVG  
**Where:** `src/components/ui/LoadingButton.tsx` (novo)  
**Done when:** Botão em loading mostra spinner, `disabled`, mantém largura  
**Gate:** `npm run type-check`

---

### T-10 — Melhorar ToastContext (title + duração por tipo)

**What:** Adicionar `title?: string` ao `ToastItem`, durações diferenciadas por tipo (4s/6s)  
**Where:** `src/store/ToastContext.tsx`  
**Done when:** `addToast('success', 'msg', 'Título')` funciona  
**Gate:** `npm run type-check`

---

### T-11 — Melhorar Toast visual (barra de progresso)

**What:** Adicionar barra de progresso de auto-dismiss no `Toast.tsx`, exibir `title` quando presente  
**Where:** `src/components/ui/Toast.tsx`  
**Depends on:** T-10  
**Done when:** Toast exibe barra animada + título  
**Gate:** `npm run build`

---

### T-12 — Refatorar Login com React Hook Form

**What:** Substituir `useState(email)` por `useForm + zodResolver(loginSchema)`, adicionar `noValidate`, usar `FormField` + `LoadingButton`, remover `required` nativo  
**Where:** `src/app/auth/login/page.tsx`  
**Depends on:** T-01, T-02, T-08, T-09  
**Done when:** Validação customizada funciona, sem popup nativo do browser  
**Gate:** `npm run type-check && npm run build`

---

### T-13 — Refatorar Signup com React Hook Form

**What:** Substituir `useState` por `useForm + zodResolver(signupSchema)`, adicionar `noValidate`, usar `FormField` (nome* e email*) + `LoadingButton`  
**Where:** `src/app/auth/signup/page.tsx`  
**Depends on:** T-01, T-02, T-08, T-09  
**Done when:** Ambos os campos validam corretamente com mensagens PT  
**Gate:** `npm run type-check && npm run build`

---

### T-14 — Refatorar AddContentModal com React Hook Form

**What:** Substituir `useState(form)` por `useForm + zodResolver(contentSchema)`, título\* com validação, usar `FormField` + `LoadingButton`  
**Where:** `src/modules/library/AddContentModal.tsx`  
**Depends on:** T-01, T-02, T-08, T-09  
**Done when:** Modal valida, exibe erro se título vazio, botão em loading  
**Gate:** `npm run type-check && npm run build`

---

### T-15 — Validação final: type-check + lint + build

**What:** Executar `npm run type-check`, `npm run lint`, `npm run build` e corrigir todos os erros  
**Where:** Projeto todo  
**Depends on:** T-12, T-13, T-14, T-11  
**Done when:** Todos os três comandos passam sem erros  
**Gate:** `npm run type-check && npm run lint && npm run build`

---

## Ordem de execução

```
T-01 (instalar RHF)
  └── T-02 (schemas Zod)
T-03 (CSS tokens)
  ├── T-04 (Input melhorado)
  ├── T-05 (Textarea melhorado)
  ├── T-06 (FormError)
  └── T-07 (FormHint)
        └── T-08 (FormField) ← depende de T04+T05+T06+T07
T-09 (LoadingButton)
T-10 (ToastContext)
  └── T-11 (Toast visual)
T-08 + T-09 + T-02 → T-12 (Login)
T-08 + T-09 + T-02 → T-13 (Signup)
T-08 + T-09 + T-02 → T-14 (AddContentModal)
T-12 + T-13 + T-14 + T-11 → T-15 (validação final)
```

---

## Paralelizável

- T-04 e T-05 podem rodar em paralelo (independentes após T-03)
- T-06 e T-07 podem rodar em paralelo (independentes após T-03)
- T-09 pode rodar em paralelo com T-03..T-08
- T-10 pode rodar em paralelo com T-01..T-09
- T-12, T-13 e T-14 podem rodar em paralelo após T-08+T-09+T-02
