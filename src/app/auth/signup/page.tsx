'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Brain, Sun, Moon } from '@/components/icons'
import { useTheme } from '@/hooks/useTheme'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { signupSchema, type SignupFormValues } from '@/lib/validation/schemas'
import { mapAuthError, AUTH_SUCCESS_MESSAGES } from '@/lib/auth/errors'

export default function SignupPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  // FIX BUG-04: foca no primeiro campo inválido ao submeter
  function onError() {
    if (errors.name) { setFocus('name'); return }
    setFocus('email')
  }

  async function onSubmit({ name, email }: SignupFormValues) {
    setServerError(null)
    setSuccessMessage(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    })
    if (error) {
      setServerError(mapAuthError(error))
    } else {
      setSuccessMessage(AUTH_SUCCESS_MESSAGES.signupSuccess)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', position: 'relative',
      }}
    >
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

      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', borderRadius: '12px', padding: '10px', marginBottom: '12px' }}>
            <Brain />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
            Criar conta
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>
            Informe seu nome e email — enviaremos um link de acesso
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FormField label="Nome completo" htmlFor="name" required error={errors.name?.message}>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                error={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                {...register('name')}
              />
            </FormField>

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
              <div style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '12px', background: 'rgba(239,68,68,.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,.3)' }}>
                {serverError}
              </div>
            )}

            {successMessage && (
              <div style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '12px', background: 'rgba(16,185,129,.15)', color: '#10b981', border: '1px solid rgba(16,185,129,.3)' }}>
                {successMessage}
              </div>
            )}

            <LoadingButton
              className="btn-primary"
              type="submit"
              loading={isSubmitting}
              loadingText="Enviando..."
              style={{ width: '100%', padding: '10px' }}
            >
              ✉️ Enviar link de acesso
            </LoadingButton>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text3)' }}>
          Já tem conta?{' '}
          <a href="/auth/login" style={{ color: 'var(--color-primary-text)', textDecoration: 'none', fontWeight: '600' }}>
            Entrar
          </a>
        </p>
      </div>
    </div>
  )
}
