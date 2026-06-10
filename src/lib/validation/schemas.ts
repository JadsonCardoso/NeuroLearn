import { z } from 'zod'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i

// FIX BUG-05/06: .trim() antes das validações — evita nome/email com só espaços
// Usando .refine() pois .email() está deprecated no Zod v4
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'O email é obrigatório.')
  .refine(
    (val) => EMAIL_REGEX.test(val),
    'O email informado não é válido. Use o formato nome@dominio.com'
  )

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'O nome é obrigatório para criar sua conta.')
  .min(2, 'O nome deve ter pelo menos 2 caracteres.')
  .max(80, 'O nome deve ter no máximo 80 caracteres.')

export const loginSchema = z.object({
  email: emailSchema,
})

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
})

export const waitlistSchema = z.object({
  name: nameSchema,
  email: emailSchema,
})

export type WaitlistFormValues = z.infer<typeof waitlistSchema>

export const contentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Você precisa preencher o título do conteúdo.')
    .max(200, 'O título deve ter no máximo 200 caracteres.'),
  type: z.enum(['book', 'course', 'video', 'article', 'note']),
  author: z.string().trim().max(100, 'O autor deve ter no máximo 100 caracteres.').optional(),
  desc: z.string().trim().max(500, 'A descrição deve ter no máximo 500 caracteres.').optional(),
})

export const trailSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'O nome da trilha é obrigatório.')
    .max(100, 'O nome deve ter no máximo 100 caracteres.'),
  type: z.enum(['course', 'book', 'article', 'free', 'certification', 'research', 'tech']),
  description: z
    .string()
    .trim()
    .max(500, 'A descrição deve ter no máximo 500 caracteres.')
    .optional(),
  color: z.string().min(1, 'Selecione uma cor.'),
  iconEmoji: z.string().min(1, 'Selecione um ícone.'),
  goal: z.string().trim().max(300, 'O objetivo deve ter no máximo 300 caracteres.').optional(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type SignupFormValues = z.infer<typeof signupSchema>
export type ContentFormValues = z.infer<typeof contentSchema>
export type TrailFormValues = z.infer<typeof trailSchema>
