'use client'

import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from '@/components/icons'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { loginSchema, type LoginFormValues } from '@/lib/validation/schemas'
import { mapAuthError, AUTH_SUCCESS_MESSAGES } from '@/lib/auth/errors'
import { useState } from 'react'

const FEATURES = [
  { icon: '🧠', title: 'SM-2 Inteligente', desc: 'Revisão espaçada com algoritmo comprovado' },
  { icon: '⚡', title: 'Aprendizado Ativo', desc: 'Método Feynman e recuperação ativa' },
  { icon: '📈', title: 'Retenção Real', desc: 'Métricas de retenção baseadas em neurociência' },
  { icon: '🏆', title: 'Gamificação', desc: 'XP, níveis e habilidades para manter o foco' },
]

function LoginForm() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'

  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [serverError, setServerError] = useState<string | null>(
    errorParam === 'callback_failed'
      ? 'Link expirado ou inválido. Solicite um novo link abaixo.'
      : errorParam
        ? 'Erro de autenticação. Solicite um novo link abaixo.'
        : null
  )

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  // FIX BUG-04: foca no email se inválido ao submeter
  function onError() {
    setFocus('email')
  }

  async function onSubmit({ email }: LoginFormValues) {
    setServerError(null)
    setSuccessMessage(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setServerError(mapAuthError(error))
    } else {
      setSuccessMessage(AUTH_SUCCESS_MESSAGES.magicLinkSent)
    }
  }

  async function sendPasswordReset() {
    if (!resetEmail) return
    setResetLoading(true)
    await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback?type=recovery`,
    })
    setResetLoading(false)
    setResetSent(true)
  }

  async function signInWithGoogle() {
    setServerError(null)
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setServerError(mapAuthError(error))
      setGoogleLoading(false)
    }
    // sucesso: Supabase redireciona para o Google — loading fica ativo até a navegação
  }

  return (
    <div
      style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', position: 'relative' }}
    >
      {/* Toggle de tema */}
      <button
        onClick={toggle}
        aria-label={`Mudar para tema ${isLight ? 'escuro' : 'claro'}`}
        style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--card)',
          border: '1px solid var(--border2)',
          borderRadius: '20px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '600',
          color: 'var(--text3)',
          fontFamily: 'Inter, sans-serif',
          transition: 'all .2s',
        }}
      >
        {isLight ? <Moon /> : <Sun />}
        {isLight ? 'Escuro' : 'Claro'}
      </button>

      {/* Painel esquerdo — branding */}
      <div
        style={{
          flex: '0 0 480px',
          background: 'var(--auth-panel-bg)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '56px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="auth-panel"
      >
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '-80px',
            width: '360px',
            height: '360px',
            background: 'var(--auth-glow-top)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            right: '-60px',
            width: '280px',
            height: '280px',
            background: 'var(--auth-glow-bottom)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              borderRadius: '14px',
              padding: '10px',
              display: 'flex',
              boxShadow: '0 8px 32px rgba(124,58,237,.35)',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '800',
                color: 'var(--text)',
                letterSpacing: '-0.3px',
              }}
            >
              NeuroLearn
            </div>
            <div
              style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '500', marginTop: '1px' }}
            >
              Sistema Operacional de Aprendizagem
            </div>
          </div>
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: '800',
            color: 'var(--text)',
            lineHeight: 1.25,
            letterSpacing: '-0.5px',
            marginBottom: '12px',
          }}
        >
          Aprenda mais.{' '}
          <span
            style={{
              background: 'linear-gradient(90deg,#7c3aed,#06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Retenha de verdade.
          </span>
        </h1>
        <p
          style={{ fontSize: '14px', color: 'var(--text3)', lineHeight: 1.6, marginBottom: '40px' }}
        >
          Transforme qualquer conteúdo em conhecimento consolidado com neurociência aplicada.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'var(--auth-icon-bg)',
                  border: '1px solid var(--auth-icon-border)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--text2)',
                    marginBottom: '2px',
                  }}
                >
                  {f.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div className="slide-in" style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: '800',
                color: 'var(--text)',
                letterSpacing: '-0.3px',
              }}
            >
              Bem-vindo de volta
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '6px' }}>
              Digite seu email e receba um link de acesso
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  error={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
              </FormField>

              {serverError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    background: 'rgba(239,68,68,.1)',
                    color: '#f87171',
                    border: '1px solid rgba(239,68,68,.25)',
                  }}
                >
                  {serverError}
                </div>
              )}

              {successMessage && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    background: 'rgba(16,185,129,.1)',
                    color: '#34d399',
                    border: '1px solid rgba(16,185,129,.25)',
                  }}
                >
                  {successMessage}
                </div>
              )}

              <LoadingButton
                className="btn-primary"
                type="submit"
                loading={isSubmitting}
                loadingText="Enviando..."
                style={{
                  padding: '11px',
                  fontSize: '14px',
                  marginTop: '4px',
                  borderRadius: '10px',
                  width: '100%',
                }}
              >
                ✉️ Enviar Magic Link
              </LoadingButton>

              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowReset((v) => !v)
                    setResetSent(false)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#a78bfa',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>
          </form>

          {showReset && (
            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                background: 'var(--card2)',
                borderRadius: '10px',
                border: '1px solid var(--border)',
              }}
            >
              {resetSent ? (
                <p style={{ fontSize: '13px', color: '#34d399', margin: 0 }}>
                  ✅ Link enviado! Verifique seu email.
                </p>
              ) : (
                <>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--text3)',
                      marginBottom: '10px',
                      marginTop: 0,
                    }}
                  >
                    Digite seu email para receber o link de redefinição de senha.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="seu@email.com"
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border2)',
                        background: 'var(--input)',
                        color: 'var(--text)',
                        fontSize: '13px',
                      }}
                    />
                    <button
                      type="button"
                      disabled={resetLoading || !resetEmail}
                      onClick={sendPasswordReset}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#7c3aed',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        opacity: resetLoading ? 0.7 : 1,
                      }}
                    >
                      {resetLoading ? '...' : 'Enviar'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Divisor OAuth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 4px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 500 }}>ou</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Botão Google OAuth */}
          <button
            data-testid="btn-google-oauth"
            type="button"
            disabled={googleLoading}
            onClick={signInWithGoogle}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid var(--border2)',
              background: 'var(--card2)',
              color: 'var(--text2)',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              opacity: googleLoading ? 0.7 : 1,
              transition: 'opacity .15s',
            }}
          >
            {googleLoading ? (
              <span
                style={{
                  display: 'inline-block',
                  width: 16,
                  height: 16,
                  border: '2px solid var(--border2)',
                  borderTopColor: '#4285F4',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {googleLoading ? 'Redirecionando...' : 'Entrar com Google'}
          </button>

          <p
            style={{
              textAlign: 'center',
              marginTop: '24px',
              fontSize: '13px',
              color: 'var(--text3)',
            }}
          >
            Não tem conta?{' '}
            <a
              href="/auth/signup"
              style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: '700' }}
            >
              Criar conta grátis
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-panel { display: none !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
