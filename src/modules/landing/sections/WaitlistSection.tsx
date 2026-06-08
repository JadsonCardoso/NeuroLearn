'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { waitlistSchema, type WaitlistFormValues } from '@/lib/validation/schemas'

type Status = 'idle' | 'loading' | 'success' | 'error' | 'duplicate'

export function WaitlistSection() {
  const [status, setStatus] = useState<Status>('idle')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
  })

  const onSubmit = async (data: WaitlistFormValues) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.status === 201) {
        setStatus('success')
        reset()
      } else if (res.status === 409) {
        setStatus('duplicate')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="waitlist" style={{ padding: '100px clamp(20px, 5vw, 80px)' }}>
      <div style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: '100px', padding: '6px 14px', marginBottom: '24px',
          fontSize: '12px', fontWeight: '600', color: '#a78bfa',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
          Acesso Antecipado — 100% Gratuito
        </div>

        <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: '800', color: '#fff', letterSpacing: '-1px', lineHeight: 1.2, margin: '0 0 16px' }}>
          Entre para o Beta.
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: '40px' }}>
          Seja um dos primeiros a transformar sua forma de aprender. Sem custo, sem compromisso.
        </p>

        {status === 'success' ? (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '20px', padding: '40px',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Você está dentro!</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
              Enviamos um link de acesso para o seu e-mail. Verifique sua caixa de entrada (e o spam).
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px', padding: '36px',
            }}
          >
            {/* Nome */}
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                Nome
              </label>
              <input
                {...register('name')}
                placeholder="Seu nome"
                autoComplete="name"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.name ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                  color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)' }}
                onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = errors.name ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
              />
              {errors.name && (
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px', marginBottom: 0 }}>{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                E-mail
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)', border: `1px solid ${errors.email ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                  color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)' }}
                onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = errors.email ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
              />
              {errors.email && (
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px', marginBottom: 0 }}>{errors.email.message}</p>
              )}
            </div>

            {/* Mensagens de estado */}
            {status === 'duplicate' && (
              <p style={{ fontSize: '13px', color: '#f59e0b', marginBottom: '16px', textAlign: 'center' }}>
                Este e-mail já está cadastrado na lista de espera.
              </p>
            )}
            {status === 'error' && (
              <p style={{ fontSize: '13px', color: '#ef4444', marginBottom: '16px', textAlign: 'center' }}>
                Ocorreu um erro. Tente novamente em instantes.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: '12px', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                background: status === 'loading' ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#fff', fontSize: '15px', fontWeight: '700',
                boxShadow: status === 'loading' ? 'none' : '0 8px 32px rgba(124,58,237,0.4)',
                transition: 'opacity 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { if (status !== 'loading') (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
            >
              {status === 'loading' ? 'Entrando...' : '🚀 Garantir minha vaga'}
            </button>

            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '16px', marginBottom: 0 }}>
              Sem spam. Cancele quando quiser.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
