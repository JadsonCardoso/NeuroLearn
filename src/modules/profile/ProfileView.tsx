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
import { useAppData } from '@/hooks/useAppData'
import {
  getUserProfile,
  updateUserProfile,
  updateStudyGoals,
  DEFAULT_STUDY_GOALS,
} from '@/services/profileService'
import type { StudyGoals } from '@/services/profileService'
import { listRecentSessions } from '@/services/sessionsService'
import type { StudySession } from '@/types'

// ── Schemas ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'O nome é obrigatório.')
    .max(80, 'O nome deve ter no máximo 80 caracteres.'),
  avatar_url: z
    .string()
    .trim()
    .refine((v) => v === '' || /^https?:\/\/.{3,}/.test(v), 'Informe uma URL válida (https://...)'),
})

const goalsSchema = z.object({
  cardsPerDay: z.number().int().min(1).max(50),
  minutesPerDay: z.number().int().min(5).max(120),
  daysPerWeek: z.number().int().min(1).max(7),
  streakGoal: z.number().int().min(3).max(365),
})

type ProfileFormValues = z.infer<typeof profileSchema>
type GoalsFormValues = z.infer<typeof goalsSchema>

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'hoje'
  if (d === 1) return 'ontem'
  if (d < 7) return `há ${d} dias`
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

function fmtDuration(seconds: number): string {
  const m = Math.round(seconds / 60)
  return m < 60 ? `${m}min` : `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}min` : ''}`
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ProfileView() {
  const { toast } = useToast()
  const { state, userId } = useAppData()

  const [email, setEmail] = useState('')
  const [pageLoading, setPageLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [avatarError, setAvatarError] = useState(false)

  const [recentSessions, setRecentSessions] = useState<StudySession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [goalsSaving, setGoalsSaving] = useState(false)

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

  const {
    register: registerGoals,
    handleSubmit: handleSubmitGoals,
    reset: resetGoals,
    formState: { errors: goalsErrors, isDirty: goalsDirty },
  } = useForm<GoalsFormValues>({
    resolver: zodResolver<GoalsFormValues, unknown, GoalsFormValues>(goalsSchema),
    defaultValues: DEFAULT_STUDY_GOALS,
  })

  const watchedAvatarUrl = watch('avatar_url')
  const watchedName = watch('name')

  useEffect(() => {
    setAvatarError(false)
  }, [watchedAvatarUrl])

  useEffect(() => {
    getUserProfile()
      .then((profile) => {
        if (!profile) return
        setEmail(profile.email)
        reset({ name: profile.name, avatar_url: profile.avatar_url })
        if (profile.studyGoals) resetGoals(profile.studyGoals)
      })
      .finally(() => setPageLoading(false))

    const stored = localStorage.getItem('nl_notifications')
    setNotificationsEnabled(stored !== 'false')
  }, [reset, resetGoals])

  useEffect(() => {
    if (!userId) {
      setSessionsLoading(false)
      return
    }
    listRecentSessions(userId, 7)
      .then(setRecentSessions)
      .finally(() => setSessionsLoading(false))
  }, [userId])

  async function onSubmit(data: ProfileFormValues) {
    try {
      await updateUserProfile(data)
      toast.success('Perfil atualizado com sucesso!')
      reset(data)
      window.dispatchEvent(new CustomEvent('nl:profile-updated', { detail: { name: data.name } }))
    } catch {
      toast.error('Não foi possível salvar o perfil. Tente novamente.')
    }
  }

  async function onGoalsSubmit(data: GoalsFormValues) {
    setGoalsSaving(true)
    try {
      await updateStudyGoals(data as StudyGoals)
      toast.success('Metas salvas com sucesso!')
      resetGoals(data)
    } catch {
      toast.error('Não foi possível salvar as metas. Tente novamente.')
    } finally {
      setGoalsSaving(false)
    }
  }

  function toggleNotifications() {
    const next = !notificationsEnabled
    setNotificationsEnabled(next)
    localStorage.setItem('nl_notifications', next ? 'true' : 'false')
    toast.success(next ? 'Lembretes de estudo ativados.' : 'Lembretes de estudo desativados.')
  }

  const totalCards = state.cards.length
  const currentStreak = state.streak
  const activeDays = new Set(state.sessions.map((s) => s.date.slice(0, 10))).size

  const displayName = watchedName || email || '?'
  const initials = getInitials(displayName)
  const avatarUrlIsValid = watchedAvatarUrl && /^https?:\/\/.{3,}/.test(watchedAvatarUrl)
  const showImage = avatarUrlIsValid && !avatarError

  if (pageLoading) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: '700px', margin: '0 auto' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: '120px',
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
    <div
      className="slide-in"
      style={{ padding: 'var(--space-6)', maxWidth: '700px', margin: '0 auto' }}
    >
      <PageHeader icon={<User />} title="Perfil" subtitle="Personalize sua conta e preferências" />

      {/* ── STATS-PROFILE-01: chips de resumo ────────────────────────────── */}
      <div
        data-testid="profile-stats"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        {[
          { label: 'Flashcards', value: totalCards, icon: '🃏', color: '#7c3aed' },
          { label: 'Streak atual', value: `${currentStreak}d`, icon: '🔥', color: '#ef4444' },
          { label: 'Dias ativos', value: activeDays, icon: '📅', color: '#10b981' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{ padding: 'var(--space-3)', textAlign: 'center' }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Formulário de identificação ───────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <section
          className="card"
          style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}
        >
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
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-info))',
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

        <div
          style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-5)' }}
        >
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

      {/* ── STUDY-GOALS-01: Metas de estudo ──────────────────────────────── */}
      <section
        data-testid="profile-goals"
        className="card"
        style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}
      >
        <h2
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: '700',
            color: 'var(--text)',
            margin: '0 0 var(--space-1)',
          }}
        >
          🎯 Metas de Estudo
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text3)',
            margin: '0 0 var(--space-4)',
          }}
        >
          Configure seus objetivos diários e semanais. As metas aparecem no Dashboard.
        </p>

        <form onSubmit={handleSubmitGoals(onGoalsSubmit)} noValidate>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <FormField
              label="Flashcards por dia"
              htmlFor="cardsPerDay"
              error={goalsErrors.cardsPerDay?.message}
            >
              <Input
                id="cardsPerDay"
                type="number"
                min={1}
                max={50}
                error={!!goalsErrors.cardsPerDay}
                {...registerGoals('cardsPerDay')}
              />
            </FormField>

            <FormField
              label="Minutos por dia"
              htmlFor="minutesPerDay"
              error={goalsErrors.minutesPerDay?.message}
            >
              <Input
                id="minutesPerDay"
                type="number"
                min={5}
                max={120}
                error={!!goalsErrors.minutesPerDay}
                {...registerGoals('minutesPerDay')}
              />
            </FormField>

            <FormField
              label="Dias de estudo por semana"
              htmlFor="daysPerWeek"
              error={goalsErrors.daysPerWeek?.message}
            >
              <Input
                id="daysPerWeek"
                type="number"
                min={1}
                max={7}
                error={!!goalsErrors.daysPerWeek}
                {...registerGoals('daysPerWeek')}
              />
            </FormField>

            <FormField
              label="Meta de streak (dias)"
              htmlFor="streakGoal"
              error={goalsErrors.streakGoal?.message}
            >
              <Input
                id="streakGoal"
                type="number"
                min={3}
                max={365}
                error={!!goalsErrors.streakGoal}
                {...registerGoals('streakGoal')}
              />
            </FormField>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              type="submit"
              className="btn-primary"
              loading={goalsSaving}
              loadingText="Salvando..."
              disabled={!goalsDirty}
            >
              Salvar metas
            </LoadingButton>
          </div>
        </form>
      </section>

      {/* ── Notificações ─────────────────────────────────────────────────── */}
      <section
        className="card"
        style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}
      >
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
              background: notificationsEnabled ? 'var(--color-primary)' : 'var(--border)',
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

      {/* ── ACTIVITY-HISTORY-01: Últimas 7 sessões ───────────────────────── */}
      <section
        data-testid="profile-activity"
        className="card"
        style={{ padding: 'var(--space-5)' }}
      >
        <h2
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: '700',
            color: 'var(--text)',
            margin: '0 0 var(--space-4)',
          }}
        >
          📋 Histórico de Atividade
        </h2>

        {sessionsLoading ? (
          <div
            style={{
              height: '80px',
              background: 'var(--bg2)',
              borderRadius: 'var(--radius-md)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ) : recentSessions.length === 0 ? (
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text3)',
              textAlign: 'center',
              padding: 'var(--space-4) 0',
            }}
          >
            Nenhuma sessão registrada ainda. Complete uma Sessão de Foco para ver seu histórico.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {recentSessions.map((session) => {
              const content = state.contents.find((c) => c.id === session.cid)
              return (
                <div
                  key={session.id}
                  data-testid="activity-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    background: 'var(--bg2)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '20px',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--color-primary-dim)',
                      borderRadius: '8px',
                      flexShrink: 0,
                    }}
                  >
                    ⏱
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: '600',
                        color: 'var(--text)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {content?.title ?? 'Conteúdo removido'}
                    </p>
                    <p
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text3)',
                        margin: '2px 0 0',
                      }}
                    >
                      {fmtDuration(session.duration)} ·{' '}
                      {session.cardsCreated > 0
                        ? `${session.cardsCreated} card${session.cardsCreated !== 1 ? 's' : ''}`
                        : 'sem cards novos'}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text3)',
                      flexShrink: 0,
                    }}
                  >
                    {relativeDate(session.date)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
