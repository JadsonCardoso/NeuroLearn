import type { AuthError } from '@supabase/supabase-js'

const RATE_LIMIT_PATTERNS = [
  'rate limit',
  'too many requests',
  'only request this once every',
  'over_email_send_rate_limit',
]

function isRateLimitError(message: string): boolean {
  const lower = message.toLowerCase()
  return RATE_LIMIT_PATTERNS.some((p) => lower.includes(p))
}

/**
 * Traduz erros do Supabase Auth para mensagens amigáveis em PT-BR.
 * Retorna string vazia quando error é null (uso em contextos de sucesso).
 */
export function mapAuthError(error: AuthError | null): string {
  if (!error) return ''

  // Rate limit do Supabase (OTP / Magic Link)
  if (
    error.status === 429 ||
    (error as { code?: string }).code === 'over_email_send_rate_limit' ||
    isRateLimitError(error.message)
  ) {
    return 'Muitos links enviados. Aguarde 60 segundos antes de tentar novamente.'
  }

  // Rate limit da aplicação (middleware 429)
  if (error.status === 429) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  }

  // Erro de conexão / rede
  if (
    error.status === 0 ||
    error.message.toLowerCase().includes('fetch') ||
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('failed to fetch')
  ) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.'
  }

  // Email inválido
  if (
    error.message.toLowerCase().includes('invalid email') ||
    error.message.toLowerCase().includes('email address is invalid')
  ) {
    return 'Endereço de email inválido. Verifique o email informado.'
  }

  // Usuário desabilitado / banido
  if (
    error.message.toLowerCase().includes('user is banned') ||
    error.message.toLowerCase().includes('account disabled')
  ) {
    return 'Esta conta está desativada. Entre em contato com o suporte.'
  }

  // Callback / link expirado
  if (
    (error as { code?: string }).code === 'otp_expired' ||
    error.message.toLowerCase().includes('expired') ||
    error.message.toLowerCase().includes('invalid token') ||
    error.message.toLowerCase().includes('token has expired')
  ) {
    return 'Link expirado ou inválido. Solicite um novo link abaixo.'
  }

  // Fallback — retorna mensagem original do Supabase (útil em dev)
  return error.message || 'Ocorreu um erro inesperado. Tente novamente.'
}

/**
 * Mensagens de sucesso padronizadas para o fluxo de auth.
 */
export const AUTH_SUCCESS_MESSAGES = {
  magicLinkSent:
    '✉️ Link enviado! Verifique seu email (incluindo a pasta spam) para acessar.',
  signupSuccess:
    '✉️ Conta criada! Verifique seu email (incluindo a pasta spam) para acessar.',
} as const
