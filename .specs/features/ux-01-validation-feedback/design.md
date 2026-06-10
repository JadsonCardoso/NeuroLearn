# UX-01 — Design

**Feature ID:** UX-01  
**Status:** Designed

---

## Arquitetura do Sistema de Validação

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Camada de UI                                     │
│                                                                      │
│  FormField ──► Input / Textarea / Select                            │
│      │                                                               │
│      ├── FormError (aria-live="polite", role="alert")               │
│      └── FormHint (dica contextual)                                  │
│                                                                      │
│  LoadingButton ──► spinner + texto contextual                        │
└──────────────────────────────���─────────────────────────────────��─────┘
           │
           ▼
┌───────────────────────────��─────────────────────────────────────────┐
│                  Camada de Formulário                                │
│                                                                      │
│  React Hook Form (useForm)                                           │
│       │                                                              │
│       └── zodResolver(schema)                                        │
│                 │                                                    │
│                 └── schemas.ts (Zod centralizados)                   │
└──────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Camada de Feedback                                  │
│                                                                      │
│  useToast() ──► ToastContext ──► ToastContainer                      │
│                                                                      │
│  sucesso / erro / warning / info                                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Componentes

### `FormField`

```tsx
interface FormFieldProps {
  label: string // Texto do label
  required?: boolean // Adiciona asterisco vermelho
  error?: string // Mensagem de erro (undefined = sem erro)
  hint?: string // Dica contextual abaixo do campo
  htmlFor: string // id do input associado
  children: ReactNode // O próprio input/select/textarea
}
```

**Comportamento:**

- Se `required`, renderiza `<span aria-hidden="true"> *</span>` após o label
- Se `error`, renderiza `<FormError>` com `id="${htmlFor}-error"`
- Se `hint` e sem error, renderiza `<FormHint>`

---

### `Input` (melhorado)

```tsx
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean // Aplica classe .input--error
}
```

**CSS aplicado automaticamente:**

- `aria-invalid={error}` — lido por screen readers
- `aria-describedby` — conectado ao FormError via id
- `.input--error` quando erro presente

---

### `LoadingButton`

```tsx
interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string // "Enviando...", "Salvando..."
}
```

**Comportamento:**

- `disabled={loading || props.disabled}`
- Mantém `minWidth` para evitar CLS
- Spinner inline + texto ao lado

---

### `FormError`

```tsx
interface FormErrorProps {
  id: string // Para aria-describedby
  message: string
}
```

**Renderiza:**

```html
<p id="{id}" role="alert" aria-live="polite" class="form-error">⚠ {message}</p>
```

---

### `schemas.ts`

```ts
// src/lib/validation/schemas.ts
export const emailSchema = z
  .string()
  .min(1, 'O email é obrigatório.')
  .email('O email informado não é válido. Use o formato nome@dominio.com')

export const nameSchema = z
  .string()
  .min(1, 'O nome é obrigatório para criar sua conta.')
  .min(2, 'O nome deve ter pelo menos 2 caracteres.')
  .max(80, 'O nome deve ter no máximo 80 caracteres.')

export const loginSchema = z.object({ email: emailSchema })

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
})

export const contentSchema = z.object({
  title: z.string().min(1, 'Você precisa preencher o título do conteúdo.').max(200),
  type: z.enum(['book', 'course', 'video', 'article', 'note']),
  author: z.string().max(100).optional(),
  desc: z.string().max(500).optional(),
})
```

---

## Padrão de uso nos formulários

```tsx
// Padrão React Hook Form + Zod para todos os formulários
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  resolver: zodResolver(loginSchema),
})

// No JSX:
<FormField label="Email" required htmlFor="email" error={errors.email?.message}>
  <Input
    id="email"
    type="email"
    error={!!errors.email}
    aria-describedby={errors.email ? 'email-error' : undefined}
    {...register('email')}
  />
</FormField>

<LoadingButton
  type="submit"
  loading={isSubmitting}
  loadingText="Enviando..."
>
  Enviar Magic Link
</LoadingButton>
```

---

## Toast melhorado

### Duração por tipo

```ts
const DURATIONS: Record<ToastType, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 6000,
}
```

### Title opcional

```ts
addToast(type, message, title?)
// Ex: addToast('success', 'Seu progresso foi salvo.', 'Sessão concluída')
```

### Barra de progresso

- Elemento `<div>` com `animation: shrink ${duration}ms linear forwards`
- Cor correspondente ao tipo do toast

---

## CSS Tokens a adicionar em globals.css

```css
/* Estados de campo */
--ring-focus: 0 0 0 3px rgba(124, 58, 237, 0.25);
--ring-focus-danger: 0 0 0 3px rgba(239, 68, 68, 0.2);

.input--error {
  border-color: var(--color-danger) !important;
}
.input--error:focus-visible {
  box-shadow: var(--ring-focus-danger);
  outline: none;
}
.input:focus-visible {
  border-color: var(--color-primary);
  box-shadow: var(--ring-focus);
  outline: none;
}
.form-error {
  font-size: var(--text-sm);
  color: var(--color-danger);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}
.form-hint {
  font-size: var(--text-sm);
  color: var(--text3);
  margin-top: 4px;
}
```

---

## Sequência de implementação

1. Instalar `react-hook-form`
2. Criar `schemas.ts`
3. Criar `FormError` + `FormHint`
4. Melhorar `Input` + `Textarea`
5. Criar `FormField`
6. Criar `LoadingButton`
7. Adicionar CSS tokens
8. Melhorar `ToastContext` + `Toast`
9. Refatorar Login
10. Refatorar Signup
11. Refatorar AddContentModal
12. Validar: type-check + lint + build
