import { describe, it, expect } from 'vitest'
import { emailSchema, nameSchema, contentSchema } from './schemas'

// ─── emailSchema ──────────────────────────────────────────────────────────────

describe('emailSchema', () => {
  it('aceita email válido', () => {
    expect(emailSchema.safeParse('user@example.com').success).toBe(true)
  })

  it('aceita email com subdomínio', () => {
    expect(emailSchema.safeParse('user@mail.example.com.br').success).toBe(true)
  })

  it('rejeita string vazia', () => {
    const result = emailSchema.safeParse('')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('O email é obrigatório.')
    }
  })

  it('rejeita email sem @', () => {
    const result = emailSchema.safeParse('invalido.com')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('não é válido')
    }
  })

  it('rejeita email sem domínio', () => {
    expect(emailSchema.safeParse('user@').success).toBe(false)
  })

  it('rejeita email sem TLD', () => {
    expect(emailSchema.safeParse('user@domain').success).toBe(false)
  })

  it('faz trim — email com espaços laterais é aceito', () => {
    // .trim() remove espaços antes de validar
    expect(emailSchema.safeParse('  user@example.com  ').success).toBe(true)
  })

  it('rejeita string com apenas espaços', () => {
    const result = emailSchema.safeParse('   ')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('O email é obrigatório.')
    }
  })
})

// ─── nameSchema ───────────────────────────────────────────────────────────────

describe('nameSchema', () => {
  it('aceita nome válido', () => {
    expect(nameSchema.safeParse('Jadson Cardoso').success).toBe(true)
  })

  it('aceita nome com exatamente 2 caracteres', () => {
    expect(nameSchema.safeParse('Jo').success).toBe(true)
  })

  it('aceita nome com 80 caracteres', () => {
    expect(nameSchema.safeParse('a'.repeat(80)).success).toBe(true)
  })

  it('rejeita string vazia', () => {
    const result = nameSchema.safeParse('')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('O nome é obrigatório para criar sua conta.')
    }
  })

  it('rejeita nome com 1 caractere', () => {
    const result = nameSchema.safeParse('J')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('pelo menos 2 caracteres')
    }
  })

  it('rejeita nome com 81 caracteres', () => {
    const result = nameSchema.safeParse('a'.repeat(81))
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('no máximo 80 caracteres')
    }
  })

  it('faz trim — nome com só espaços é rejeitado como vazio', () => {
    const result = nameSchema.safeParse('   ')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('O nome é obrigatório para criar sua conta.')
    }
  })

  it('faz trim — nome com espaços laterais mas conteúdo válido é aceito', () => {
    expect(nameSchema.safeParse('  Jadson  ').success).toBe(true)
  })
})

// ─── contentSchema ────────────────────────────────────────────────────────────

describe('contentSchema', () => {
  const valid = { title: 'Clean Code', type: 'book' as const }

  it('aceita conteúdo válido mínimo', () => {
    expect(contentSchema.safeParse(valid).success).toBe(true)
  })

  it('aceita conteúdo completo', () => {
    expect(contentSchema.safeParse({
      title: 'Clean Code',
      type: 'book',
      author: 'Robert C. Martin',
      desc: 'Boas práticas de código',
    }).success).toBe(true)
  })

  it('aceita todos os tipos válidos', () => {
    const types = ['book', 'course', 'video', 'article', 'note'] as const
    for (const type of types) {
      expect(contentSchema.safeParse({ title: 'x', type }).success).toBe(true)
    }
  })

  it('rejeita título vazio', () => {
    const result = contentSchema.safeParse({ ...valid, title: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('preencher o título')
    }
  })

  it('rejeita título com apenas espaços (trim)', () => {
    const result = contentSchema.safeParse({ ...valid, title: '   ' })
    expect(result.success).toBe(false)
  })

  it('rejeita título com 201 caracteres', () => {
    const result = contentSchema.safeParse({ ...valid, title: 'a'.repeat(201) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('200 caracteres')
    }
  })

  it('aceita título com exatamente 200 caracteres', () => {
    expect(contentSchema.safeParse({ ...valid, title: 'a'.repeat(200) }).success).toBe(true)
  })

  it('rejeita tipo inválido', () => {
    expect(contentSchema.safeParse({ ...valid, type: 'podcast' }).success).toBe(false)
  })

  it('rejeita autor com mais de 100 caracteres', () => {
    const result = contentSchema.safeParse({ ...valid, author: 'a'.repeat(101) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('100 caracteres')
    }
  })

  it('rejeita descrição com mais de 500 caracteres', () => {
    const result = contentSchema.safeParse({ ...valid, desc: 'a'.repeat(501) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('500 caracteres')
    }
  })

  it('author e desc são opcionais — undefined é aceito', () => {
    expect(contentSchema.safeParse({ title: 'x', type: 'note', author: undefined, desc: undefined }).success).toBe(true)
  })

  it('faz trim em author e desc', () => {
    const result = contentSchema.safeParse({ ...valid, author: '  Robert  ', desc: '  texto  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.author).toBe('Robert')
      expect(result.data.desc).toBe('texto')
    }
  })
})
