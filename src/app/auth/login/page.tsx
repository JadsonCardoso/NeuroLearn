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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setServerError(mapAuthError(error))
    } else {
      setSuccessMessage(AUTH_SUCCESS_MESSAGES.magicLinkSent)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', position: 'relative' }}>
      {/* Toggle de tema */}
      <button
        onClick={toggle}
        aria-label={`Mudar para tema ${isLight ? 'escuro' : 'claro'}`}
        style={{
          position: 'fixed', top: '20px', right: '24px', zIndex: 50,
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--card)', border: '1px solid var(--border2)',
          borderRadius: '20px', padding: '6px 12px', cursor: 'pointer',
          fontSize: '12px', fontWeight: '600', color: 'var(--text3)',
          fontFamily: 'Inter, sans-serif', transition: 'all .2s',
        }}
      >
        {isLight ? <Moon /> : <Sun />}
        {isLight ? 'Escuro' : 'Claro'}
      </button>

      {/* Painel esquerdo — branding */}
      <div
        style={{
          flex: '0 0 480px', background: 'var(--auth-panel-bg)',
          borderRight: '1px solid var(--border)', display: 'flex',
          flexDirection: 'column', justifyContent: 'center',
          padding: '56px 48px', position: 'relative', overflow: 'hidden',
        }}
        className="auth-panel"
      >
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '360px', height: '360px', background: 'var(--auth-glow-top)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '280px', height: '280px', background: 'var(--auth-glow-bottom)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', borderRadius: '14px', padding: '10px', display: 'flex', boxShadow: '0 8px 32px rgba(124,58,237,.35)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.3px' }}>NeuroLearn</div>
            <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '500', marginTop: '1px' }}>Sistema Operacional de Aprendizagem</div>
          </div>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text)', lineHeight: 1.25, letterSpacing: '-0.5px', marginBottom: '12px' }}>
          Aprenda mais.{' '}
          <span style={{ background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Retenha de verdade.
          </span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text3)', lineHeight: 1.6, marginBottom: '40px' }}>
          Transforme qualquer conteúdo em conhecimento consolidado com neurociência aplicada.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--auth-icon-bg)', border: '1px solid var(--auth-icon-border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text2)', marginBottom: '2px' }}>{f.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="slide-in" style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.3px' }}>
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
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '12px', background: 'rgba(239,68,68,.1)', color: '#f87171', border: '1px solid rgba(239,68,68,.25)' }}>
                  {serverError}
                </div>
              )}

              {successMessage && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '12px', background: 'rgba(16,185,129,.1)', color: '#34d399', border: '1px solid rgba(16,185,129,.25)' }}>
                  {successMessage}
                </div>
              )}

              <LoadingButton
                className="btn-primary"
                type="submit"
                loading={isSubmitting}
                loadingText="Enviando..."
                style={{ padding: '11px', fontSize: '14px', marginTop: '4px', borderRadius: '10px', width: '100%' }}
              >
                ✉️ Enviar Magic Link
              </LoadingButton>
            </div>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text3)' }}>
            Não tem conta?{' '}
            <a href="/auth/signup" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: '700' }}>
              Criar conta grátis
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-panel { display: none !important; } }
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
