import { describe, it, expect } from 'vitest'
import { mapAuthError, AUTH_SUCCESS_MESSAGES } from './errors'
import type { AuthError } from '@supabase/supabase-js'

function makeError(message: string, status?: number, code?: string): AuthError {
  return { name: 'AuthApiError', message, status: status ?? 400, code } as AuthError
}

describe('mapAuthError', () => {
  it('retorna string vazia quando error é null', () => {
    expect(mapAuthError(null)).toBe('')
  })

  it('mapeia rate limit por status 429', () => {
    const result = mapAuthError(makeError('Too Many Requests', 429))
    expect(result).toContain('Aguarde 60 segundos')
  })

  it('mapeia rate limit por código over_email_send_rate_limit', () => {
    const result = mapAuthError(makeError('over_email_send_rate_limit', 400, 'over_email_send_rate_limit'))
    expect(result).toContain('Aguarde 60 segundos')
  })

  it('mapeia rate limit por mensagem contendo "rate limit"', () => {
    const result = mapAuthError(makeError('For security purposes, you can only request this once every 60 seconds', 400))
    expect(result).toContain('Aguarde 60 segundos')
  })

  it('mapeia rate limit por mensagem "only request this once every"', () => {
    const result = mapAuthError(makeError('Email rate limit exceeded', 400))
    expect(result).toContain('Aguarde 60 segundos')
  })

  it('mapeia erro de rede por status 0', () => {
    const result = mapAuthError(makeError('Failed to fetch', 0))
    expect(result).toContain('Erro de conexão')
  })

  it('mapeia erro de rede por mensagem "network"', () => {
    const result = mapAuthError(makeError('network error occurred', 500))
    expect(result).toContain('Erro de conexão')
  })

  it('mapeia erro de rede por mensagem "failed to fetch"', () => {
    const result = mapAuthError(makeError('failed to fetch', 400))
    expect(result).toContain('Erro de conexão')
  })

  it('mapeia email inválido', () => {
    const result = mapAuthError(makeError('Invalid email address is invalid', 400))
    expect(result).toContain('email inválido')
  })

  it('mapeia link expirado por código otp_expired', () => {
    const result = mapAuthError(makeError('OTP expired', 400, 'otp_expired'))
    expect(result).toContain('Link expirado')
  })

  it('mapeia link expirado por mensagem "expired"', () => {
    const result = mapAuthError(makeError('Token has expired', 400))
    expect(result).toContain('Link expirado')
  })

  it('mapeia conta desabilitada', () => {
    const result = mapAuthError(makeError('User is banned', 403))
    expect(result).toContain('desativada')
  })

  it('usa mensagem original do Supabase como fallback', () => {
    const result = mapAuthError(makeError('Algum erro desconhecido específico', 400))
    expect(result).toBe('Algum erro desconhecido específico')
  })

  it('retorna fallback genérico quando mensagem está vazia', () => {
    const result = mapAuthError(makeError('', 400))
    expect(result).toContain('erro inesperado')
  })
})

describe('AUTH_SUCCESS_MESSAGES', () => {
  it('tem mensagem de magic link enviado', () => {
    expect(AUTH_SUCCESS_MESSAGES.magicLinkSent).toContain('spam')
  })

  it('tem mensagem de signup com sucesso', () => {
    expect(AUTH_SUCCESS_MESSAGES.signupSuccess).toContain('spam')
  })
})
