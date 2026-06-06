import { describe, it, expect } from 'vitest'
import { loginSchema, signupSchema, contentSchema, flashcardSchema, sanitizeString } from '../validation'

describe('loginSchema', () => {
  it('email e senha válidos → sucesso', () => {
    const r = loginSchema.safeParse({ email: 'user@example.com', password: 'senha123' })
    expect(r.success).toBe(true)
  })

  it('email inválido → erro', () => {
    const r = loginSchema.safeParse({ email: 'nao-e-email', password: 'senha123' })
    expect(r.success).toBe(false)
  })

  it('email vazio → erro', () => {
    const r = loginSchema.safeParse({ email: '', password: 'senha123' })
    expect(r.success).toBe(false)
  })

  it('senha curta (< 6 chars) → erro', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: '123' })
    expect(r.success).toBe(false)
  })

  it('senha muito longa (> 128 chars) → erro', () => {
    const r = loginSchema.safeParse({ email: 'a@b.com', password: 'x'.repeat(129) })
    expect(r.success).toBe(false)
  })

  it('email muito longo (> 254 chars) → erro', () => {
    const r = loginSchema.safeParse({ email: 'a'.repeat(250) + '@b.com', password: 'senha123' })
    expect(r.success).toBe(false)
  })
})

describe('signupSchema', () => {
  const valid = { name: 'João Silva', email: 'joao@teste.com', password: 'senha123' }

  it('dados válidos → sucesso', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true)
  })

  it('nome curto (< 2 chars) → erro', () => {
    expect(signupSchema.safeParse({ ...valid, name: 'J' }).success).toBe(false)
  })

  it('nome muito longo (> 100 chars) → erro', () => {
    expect(signupSchema.safeParse({ ...valid, name: 'A'.repeat(101) }).success).toBe(false)
  })

  it('nome com caracteres inválidos (números) → erro', () => {
    expect(signupSchema.safeParse({ ...valid, name: 'João123' }).success).toBe(false)
  })

  it('nome com hífen e apóstrofe → válido', () => {
    expect(signupSchema.safeParse({ ...valid, name: "O'Brien" }).success).toBe(true)
  })
})

describe('contentSchema', () => {
  const valid = { title: 'Livro X', type: 'book' as const, author: 'Autor', desc: 'Descrição' }

  it('dados válidos → sucesso', () => {
    expect(contentSchema.safeParse(valid).success).toBe(true)
  })

  it('título vazio → erro', () => {
    expect(contentSchema.safeParse({ ...valid, title: '' }).success).toBe(false)
  })

  it('tipo inválido → erro', () => {
    expect(contentSchema.safeParse({ ...valid, type: 'podcast' }).success).toBe(false)
  })

  it('todos os tipos válidos são aceitos', () => {
    const types = ['book', 'course', 'video', 'article', 'note'] as const
    types.forEach((type) => {
      expect(contentSchema.safeParse({ ...valid, type }).success).toBe(true)
    })
  })

  it('descrição muito longa (> 2000 chars) → erro', () => {
    expect(contentSchema.safeParse({ ...valid, desc: 'x'.repeat(2001) }).success).toBe(false)
  })
})

describe('flashcardSchema', () => {
  it('front e back válidos → sucesso', () => {
    expect(flashcardSchema.safeParse({ front: 'Pergunta', back: 'Resposta' }).success).toBe(true)
  })

  it('front vazio → erro', () => {
    expect(flashcardSchema.safeParse({ front: '', back: 'Resposta' }).success).toBe(false)
  })

  it('back vazio → erro', () => {
    expect(flashcardSchema.safeParse({ front: 'Pergunta', back: '' }).success).toBe(false)
  })

  it('front muito longo (> 1000 chars) → erro', () => {
    expect(flashcardSchema.safeParse({ front: 'x'.repeat(1001), back: 'Resp' }).success).toBe(false)
  })
})

describe('sanitizeString', () => {
  it('remove espaços nas bordas', () => {
    expect(sanitizeString('  texto  ')).toBe('texto')
  })

  it('colapsa espaços internos múltiplos', () => {
    expect(sanitizeString('texto   com   espaços')).toBe('texto com espaços')
  })

  it('string limpa não muda', () => {
    expect(sanitizeString('texto normal')).toBe('texto normal')
  })
})
