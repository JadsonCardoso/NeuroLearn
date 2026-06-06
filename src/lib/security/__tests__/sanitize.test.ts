import { describe, it, expect } from 'vitest'
import { stripHtml, escapeHtml, sanitizeFileName, isValidMimeType, ALLOWED_MIME_TYPES } from '../sanitize'

describe('stripHtml', () => {
  it('remove tags simples', () => {
    expect(stripHtml('<p>Olá</p>')).toBe('Olá')
  })

  it('remove tags aninhadas', () => {
    expect(stripHtml('<div><span>texto</span></div>')).toBe('texto')
  })

  it('remove tags de script — conteúdo de texto permanece inofensivo', () => {
    // stripHtml remove a tag, mantém o texto. Para render XSS, React já escapa por default.
    const result = stripHtml('<script>alert("xss")</script>')
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('</script>')
    // O texto 'alert(...)' é inofensivo quando renderizado como textContent pelo React
    expect(result).toBe('alert("xss")')
  })

  it('mantém texto sem tags', () => {
    expect(stripHtml('texto puro')).toBe('texto puro')
  })

  it('faz trim do resultado', () => {
    expect(stripHtml('  <b>texto</b>  ')).toBe('texto')
  })
})

describe('escapeHtml', () => {
  it('escapa <', () => expect(escapeHtml('<script>')).toContain('&lt;'))
  it('escapa >', () => expect(escapeHtml('<script>')).toContain('&gt;'))
  it('escapa &', () => expect(escapeHtml('a & b')).toContain('&amp;'))
  it('escapa aspas duplas', () => expect(escapeHtml('"valor"')).toContain('&quot;'))
  it('escapa aspas simples', () => expect(escapeHtml("it's")).toContain('&#x27;'))

  it('transforma ataque XSS em texto inofensivo', () => {
    const xss = '<img src=x onerror="alert(1)">'
    const safe = escapeHtml(xss)
    expect(safe).not.toContain('<img')
    expect(safe).toContain('&lt;img')
  })
})

describe('sanitizeFileName', () => {
  it('remove path traversal ../', () => {
    expect(sanitizeFileName('../../../etc/passwd')).not.toContain('..')
  })

  it('remove barras', () => {
    expect(sanitizeFileName('pasta/arquivo.txt')).not.toContain('/')
  })

  it('converte espaços em underscore', () => {
    expect(sanitizeFileName('meu arquivo.pdf')).toContain('meu_arquivo.pdf')
  })

  it('limita a 255 caracteres', () => {
    const longo = 'a'.repeat(300) + '.txt'
    expect(sanitizeFileName(longo).length).toBeLessThanOrEqual(255)
  })

  it('remove asteriscos e outros chars inválidos', () => {
    const r = sanitizeFileName('arquivo*<>|?.txt')
    expect(r).not.toMatch(/[*<>|?]/)
  })
})

describe('isValidMimeType', () => {
  it('MIME válido da lista → true', () => {
    expect(isValidMimeType('image/jpeg', ALLOWED_MIME_TYPES.image)).toBe(true)
    expect(isValidMimeType('application/pdf', ALLOWED_MIME_TYPES.document)).toBe(true)
  })

  it('MIME não permitido → false', () => {
    expect(isValidMimeType('application/x-executable', ALLOWED_MIME_TYPES.image)).toBe(false)
    expect(isValidMimeType('text/html', ALLOWED_MIME_TYPES.document)).toBe(false)
  })

  it('case-insensitive', () => {
    expect(isValidMimeType('IMAGE/JPEG', ALLOWED_MIME_TYPES.image)).toBe(true)
  })

  it('ignora parâmetros extras (ex: charset)', () => {
    expect(isValidMimeType('text/plain; charset=utf-8', ALLOWED_MIME_TYPES.document)).toBe(true)
  })
})
