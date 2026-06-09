'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/ui/PageHeader'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { User } from '@/components/icons'
import { useToast } from '@/hooks/useToast'
import { getUserProfile, updateUserProfile } from '@/services/profileService'

// ── Schema ────────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'O nome é obrigatório.')
    .max(80, 'O nome deve ter no máximo 80 caracteres.'),
  avatar_url: z
    .string()
    .trim()
    .refine(
      (v) => v === '' || /^https?:\/\/.{3,}/.test(v),
      'Informe uma URL válida (https://...)'
    ),
})

type ProfileFormValues = z.infer<typeof profileSchema>

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ProfileView() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [pageLoading, setPageLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [avatarError, setAvatarError] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', avatar_url: '' },
  })

  const watchedAvatarUrl = watch('avatar_url')
  const watchedName = watch('name')

  // Reseta o flag de erro ao trocar de URL
  useEffect(() => {
    setAvatarError(false)
  }, [watchedAvatarUrl])

  useEffect(() => {
    getUserProfile()
      .then((profile) => {
        if (!profile) return
        setEmail(profile.email)
        reset({ name: profile.name, avatar_url: profile.avatar_url })
      })
      .finally(() => setPageLoading(false))

    const stored = localStorage.getItem('nl_notifications')
    setNotificationsEnabled(stored !== 'false')
  }, [reset])

  async function onSubmit(data: ProfileFormValues) {
    try {
      await updateUserProfile(data)
      toast.success('Perfil atualizado com sucesso!')
      reset(data)
    } catch {
      toast.error('Não foi possível salvar o perfil. Tente novamente.')
    }
  }

  function toggleNotifications() {
    const next = !notificationsEnabled
    setNotificationsEnabled(next)
    localStorage.setItem('nl_notifications', next ? 'true' : 'false')
    toast.success(next ? 'Lembretes de estudo ativados.' : 'Lembretes de estudo desativados.')
  }

  const displayName = watchedName || email || '?'
  const initials = getInitials(displayName)
  const avatarUrlIsValid = watchedAvatarUrl && /^https?:\/\/.{3,}/.test(watchedAvatarUrl)
  const showImage = avatarUrlIsValid && !avatarError

  if (pageLoading) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: '700px', margin: '0 auto' }}>
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: '160px',
              background: 'var(--bg2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-5)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="slide-in" style={{ padding: 'var(--space-6)', maxWidth: '700px', margin: '0 auto' }}>
      <PageHeader icon={<User />} title="Perfil" subtitle="Personalize sua conta e preferências" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Seção: Identificação */}
        <section className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
          <h2
            style={{
              fontSize: 'var(--text-md)',
              fontWeight: '700',
              color: 'var(--text)',
              margin: '0 0 var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <User /> Identificação
          </h2>

          {/* Avatar + nome em destaque */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-5)',
              padding: 'var(--space-3)',
              background: 'var(--color-primary-dim)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(124,58,237,.15)',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, var(--color-primary), var(--color-info))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                border: '2px solid rgba(124,58,237,.3)',
              }}
            >
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={watchedAvatarUrl}
                  alt={`Avatar de ${displayName}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span
                  style={{ fontSize: '24px', fontWeight: '800', color: 'white' }}
                  aria-label={`Iniciais: ${initials}`}
                >
                  {initials}
                </span>
              )}
            </div>
            <div>
              <p
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: '700',
                  color: 'var(--text)',
                  margin: 0,
                }}
              >
                {displayName}
              </p>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text3)',
                  margin: 'var(--space-1) 0 0',
                }}
              >
                {email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <FormField label="Nome" htmlFor="name" required error={errors.name?.message}>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                error={!!errors.name}
                {...register('name')}
              />
            </FormField>

            {/* E-mail — somente leitura */}
            <div>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text3)',
                  margin: '0 0 var(--space-1)',
                }}
              >
                E-mail
              </p>
              <p
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--text)',
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                {email || '—'}
              </p>
              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text4)',
                  margin: 'var(--space-1) 0 0',
                }}
              >
                O e-mail é gerenciado pelo sistema de autenticação e não pode ser alterado aqui.
              </p>
            </div>

            <FormField
              label="URL do avatar"
              htmlFor="avatar_url"
              error={errors.avatar_url?.message}
            >
              <Input
                id="avatar_url"
                type="url"
                placeholder="https://exemplo.com/minha-foto.jpg"
                error={!!errors.avatar_url}
                {...register('avatar_url')}
              />
            </FormField>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-5)' }}>
          <LoadingButton
            type="submit"
            className="btn-primary"
            loading={isSubmitting}
            loadingText="Salvando..."
            disabled={!isDirty}
          >
            Salvar alterações
          </LoadingButton>
        </div>
      </form>

      {/* Seção: Notificações — fora do form, usa localStorage */}
      <section className="card" style={{ padding: 'var(--space-5)' }}>
        <h2
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: '700',
            color: 'var(--text)',
            margin: '0 0 var(--space-4)',
          }}
        >
          🔔 Notificações
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
          }}
        >
          <div>
            <p
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: '600',
                color: 'var(--text)',
                margin: 0,
              }}
            >
              Lembretes de estudo
            </p>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text3)',
                margin: 'var(--space-1) 0 0',
              }}
            >
              Receba lembretes diários para manter seu streak de aprendizagem
            </p>
          </div>

          {/* Toggle switch acessível */}
          <button
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            aria-label="Ativar lembretes de estudo"
            onClick={toggleNotifications}
            style={{
              width: '48px',
              height: '26px',
              borderRadius: '13px',
              background: notificationsEnabled
                ? 'var(--color-primary)'
                : 'var(--border)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              flexShrink: 0,
              transition: 'background var(--duration-fast)',
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '3px',
                left: notificationsEnabled ? '25px' : '3px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'white',
                transition: 'left var(--duration-fast)',
                boxShadow: '0 1px 3px rgba(0,0,0,.2)',
              }}
            />
          </button>
        </div>
      </section>
    </div>
  )
}
