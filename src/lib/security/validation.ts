import { z } from 'zod'

// Remove espaços extras e colapsa múltiplos espaços internos
export function sanitizeString(s: string): string {
  return s.trim().replace(/\s+/g, ' ')
}

export const loginSchema = z.object({
  email: z.string().email('Email inválido').max(254, 'Email muito longo'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').max(128, 'Senha muito longa'),
})

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[\p{L}\s'-]+$/u, 'Nome contém caracteres inválidos'),
  email: z.string().email('Email inválido').max(254, 'Email muito longo'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').max(128, 'Senha muito longa'),
})

export const contentSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200, 'Título muito longo'),
  type: z.enum(['book', 'course', 'video', 'article', 'note']),
  author: z.string().max(100, 'Autor muito longo'),
  desc: z.string().max(2000, 'Descrição muito longa'),
})

export const flashcardSchema = z.object({
  front: z.string().min(1, 'Frente do cartão obrigatória').max(1000, 'Frente muito longa'),
  back: z.string().min(1, 'Verso do cartão obrigatório').max(1000, 'Verso muito longo'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ContentInput = z.infer<typeof contentSchema>
export type FlashcardInput = z.infer<typeof flashcardSchema>
