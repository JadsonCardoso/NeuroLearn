'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppData } from '@/hooks/useAppData'
import { calcRetention } from '@/engine/retention'
import { isDue, relDate } from '@/engine/scheduling'
import { calcCognitiveScore } from '@/engine/cognitive-score/cognitiveScore'
import { Ring } from '@/components/ui/Ring'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ActivityHeatmap } from '@/components/ui/ActivityHeatmap'
import { CognitiveScoreTrend } from '@/components/ui/CognitiveScoreTrend'
import { ContentProgressChart } from '@/components/ui/ContentProgressChart'
import { Brain, Refresh, Book, Award, Warn } from '@/components/icons'
import { getAtRiskCards, getRetentionHistory } from '@/services/analyticsService'
import type { AtRiskCard, RetentionHistoryPoint } from '@/services/analyticsService'

// Saudação contextual baseada no horário
function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function DashboardView() {
  const { state, userId } = useAppData()
  const router = useRouter()

  // Cards em risco reais do Supabase (null = carregando, [] = sem dados / usar fallback)
  const [realRiskCards, setRealRiskCards] = useState<AtRiskCard[] | null>(null)
  // Histórico de retenção para o gráfico de tendência (null = carregando)
  const [retentionHistory, setRetentionHistory] = useState<RetentionHistoryPoint[] | null>(null)

  useEffect(() => {
    let mounted = true
    if (!userId) {
      setRealRiskCards([])
      setRetentionHistory([])
      return
    }
    getAtRiskCards(userId)
      .then((d) => { if (mounted) setRealRiskCards(d) })
      .catch(() => { if (mounted) setRealRiskCards([]) })

    getRetentionHistory(userId)
      .then((d) => { if (mounted) setRetentionHistory(d) })
      .catch(() => { if (mounted) setRetentionHistory([]) })

    return () => { mounted = false }
  }, [userId])

  // Checklist de onboarding — dispensável, persiste no localStorage
  const [onboardingDismissed, setOnboardingDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('neurolearn:onboarding:dismissed') === '1'
  })

  const onboardingItems = [
    { label: 'Adicionar primeiro conteúdo', done: state.contents.length > 0, link: '/library' },
    { label: 'Criar primeiro flashcard',    done: state.cards.length > 0,    link: '/library' },
    { label: 'Completar primeira revisão',  done: state.sessions.length > 0, link: '/review'  },
    { label: 'Manter sequência de 3 dias',  done: state.streak >= 3,         link: null        },
  ]
  const onboardingDone = onboardingItems.filter((i) => i.done).length
  const showOnboarding = !onboardingDismissed && onboardingDone < onboardingItems.length

  function dismissOnboarding() {
    localStorage.setItem('neurolearn:onboarding:dismissed', '1')
    setOnboardingDismissed(true)
  }

  const due = state.cards.filter(isDue)
  const avgRet = state.cards.length
    ? Math.round(state.cards.reduce((a, c) => a + calcRetention(c), 0) / state.cards.length)
    : 0
  const risk = state.cards.filter((c) => { const r = calcRetention(c); return r < 50 && r > 0 })
  const strong = state.cards.filter((c) => calcRetention(c) >= 75).length

  // Cognitive Score — derivado do engine a partir dos dados do estado atual
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const avgMastery = state.cards.length
    ? Math.round(
        state.cards.reduce(
          (a, c) => a + (c.mastery === 'strong' ? 100 : c.mastery === 'review' ? 50 : 25),
          0
        ) / state.cards.length
      )
    : 0
  const reviewsLast30Days = state.cards.filter(
    (c) => c.lastReview && new Date(c.lastReview) >= thirtyDaysAgo
  ).length
  const expectedReviews = Math.max(state.cards.length, reviewsLast30Days, 1)
  const cogScore = calcCognitiveScore({
    retention: avgRet,
    mastery: avgMastery,
    reviewsLast30Days,
    expectedReviews,
    activeLearning: 0,
  })

  const weekBars = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
    day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
    n: state.cards.filter((c) => {
      if (!c.nextReview) return false
      const t = new Date()
      t.setDate(t.getDate() + i)
      return new Date(c.nextReview).toDateString() === t.toDateString()
    }).length,
  }))
  const maxBar = Math.max(...weekBars.map((b) => b.n), 1)

  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="slide-in" style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        @media (max-width: 640px) {
          .dash-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .dash-main-grid  { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* Header */}
      <PageHeader
        icon={<Brain />}
        title={`${getGreeting()}! 👋`}
        subtitle={dateLabel}
      />

      {/* CTA Principal — destaque máximo quando há cards pendentes */}
      {due.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-dim), var(--color-info-dim))',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            marginBottom: 'var(--space-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
          }}
        >
          <div>
            <p style={{ fontSize: 'var(--text-lg)', fontWeight: '800', color: 'var(--color-primary-text)', margin: 0 }}>
              {due.length} card{due.length !== 1 ? 's' : ''} aguardando revisão
            </p>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text4)', margin: 'var(--space-1) 0 0' }}>
              Revise agora para consolidar a memória no momento ideal
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => router.push('/review')}
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Revisar agora →
          </button>
        </div>
      )}

      {/* Stats */}
      <div
        className="dash-stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        {[
          { l: 'Sequência',       v: state.streak + 'd',                     icon: '🔥', c: 'var(--color-warning)', bg: 'var(--color-warning-dim)' },
          { l: 'Total XP',        v: (state.totalXp ?? 0).toLocaleString(), icon: '⚡', c: 'var(--color-primary)', bg: 'var(--color-primary-dim)' },
          { l: 'Para revisar',    v: due.length,                             icon: '🔄', c: 'var(--color-info)',    bg: 'var(--color-info-dim)'    },
          { l: 'Cognitive Score', v: cogScore.score + '/100',                icon: '🧠', c: 'var(--color-success)', bg: 'var(--color-success-dim)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginBottom: 'var(--space-1)' }}>{s.l}</p>
                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', color: s.c }}>{s.v}</p>
              </div>
              <div style={{ background: s.bg, borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)', fontSize: 'var(--text-lg)' }}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Heat map de atividade — últimas 16 semanas */}
      <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: '700', color: 'var(--text)', margin: '0 0 var(--space-4)' }}>
          📅 Atividade de Estudo
        </h2>
        {state.sessions.length > 0 ? (
          <ActivityHeatmap sessions={state.sessions} weeks={16} />
        ) : (
          <EmptyState icon="📅" title="Nenhuma sessão registrada" description="Complete uma sessão de foco para ver seu histórico de atividade." />
        )}
      </div>

      {/* Checklist de onboarding — visível até completar todas as etapas ou dispensar */}
      {showOnboarding && (
        <div
          data-testid="onboarding-checklist"
          className="card"
          style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)', border: '1px solid rgba(124,58,237,.25)', background: 'rgba(124,58,237,.04)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '700', color: 'var(--text)', margin: 0 }}>
                Primeiros passos 🚀
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', margin: 'var(--space-1) 0 0' }}>
                {onboardingDone}/{onboardingItems.length} etapas concluídas
              </p>
            </div>
            <button
              data-testid="btn-dismiss-onboarding"
              onClick={dismissOnboarding}
              title="Dispensar"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: '18px', lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {/* Barra de progresso */}
          <div className="progress-bar" style={{ marginBottom: 'var(--space-4)', height: '6px' }}>
            <div
              className="progress-fill"
              data-testid="onboarding-progress"
              style={{ width: `${(onboardingDone / onboardingItems.length) * 100}%`, background: 'linear-gradient(90deg,#7c3aed,#06b6d4)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {onboardingItems.map((item, i) => (
              <div
                key={i}
                data-testid={`onboarding-item-${i}`}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', opacity: item.done ? 0.55 : 1 }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.done ? '✅' : '⬜'}</span>
                {item.link && !item.done ? (
                  <button
                    onClick={() => router.push(item.link!)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'var(--text-sm)', color: '#7c3aed', fontWeight: '600', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span style={{ fontSize: 'var(--text-sm)', color: item.done ? 'var(--text3)' : 'var(--text)', textDecoration: item.done ? 'line-through' : 'none' }}>
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dash-main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
        {/* Coluna esquerda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Revisões de hoje */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0 }}>
                <Refresh /> Revisões de Hoje
              </h2>
              <Badge style={{ background: 'var(--color-primary-dim)', color: 'var(--color-primary-text)' }}>
                {due.length} cards
              </Badge>
            </div>

            {due.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {due.slice(0, 3).map((card) => {
                  const ct = state.contents.find((c) => c.id === card.cid)
                  const ret = calcRetention(card)
                  const retColor = ret > 60 ? 'var(--color-success)' : ret > 30 ? 'var(--color-warning)' : 'var(--color-danger)'
                  const retBg   = ret > 60 ? 'var(--color-success-dim)' : ret > 30 ? 'var(--color-warning-dim)' : 'var(--color-danger-dim)'
                  return (
                    <div
                      key={card.id}
                      style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border2)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', marginBottom: '2px' }}>
                          {ct?.title?.slice(0, 30)}
                        </div>
                        <div style={{ fontSize: 'var(--text-base)', color: 'var(--text)', fontWeight: '500', lineHeight: '1.4' }}>
                          {card.front.slice(0, 60)}{card.front.length > 60 ? '…' : ''}
                        </div>
                      </div>
                      <span style={{ fontSize: 'var(--text-xs)', padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', background: retBg, color: retColor, fontWeight: '700' }}>
                        {ret}%
                      </span>
                    </div>
                  )
                })}
                {due.length > 3 && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', textAlign: 'center', margin: 0 }}>
                    +{due.length - 3} mais
                  </p>
                )}
              </div>
            ) : (
              <EmptyState
                icon="✅"
                title="Todas revisões concluídas!"
                description={
                  state.cards.length > 0
                    ? `Próxima: ${relDate([...state.cards].sort((a, b) => new Date(a.nextReview ?? 0).getTime() - new Date(b.nextReview ?? 0).getTime())[0]?.nextReview)}`
                    : 'Adicione flashcards para começar.'
                }
              />
            )}
          </div>

          {/* Risco de esquecimento — dados reais do Supabase, fallback client-side */}
          {(() => {
            // Skeleton enquanto carrega
            if (realRiskCards === null) {
              return (
                <div className="card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--border2)' }} />
                    <div style={{ height: '12px', width: '140px', borderRadius: '4px', background: 'var(--border2)' }} />
                  </div>
                  {[1, 2].map((i) => (
                    <div key={i} style={{ height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--border2)', marginBottom: 'var(--space-1)', opacity: 1 - i * 0.2 }} />
                  ))}
                </div>
              )
            }

            // Usa dados reais do Supabase se disponíveis, senão fallback client-side
            const displayCards: { id: string; front: string; retention: number }[] =
              realRiskCards.length > 0
                ? realRiskCards.map((c) => ({ id: c.flashcardId, front: c.front, retention: c.retention }))
                : risk.map((c) => ({ id: c.id, front: c.front, retention: calcRetention(c) }))

            const isRealData = realRiskCards.length > 0
            const label = isRealData ? 'dados históricos do Supabase' : 'calculado em tempo real'

            if (displayCards.length === 0) {
              return (
                <div className="card" style={{ padding: 'var(--space-4)' }}>
                  <EmptyState icon="🛡️" title="Nenhum card em risco" description="Sua retenção está saudável." />
                </div>
              )
            }

            return (
              <div
                data-testid="risk-cards-real"
                className="card"
                style={{ padding: 'var(--space-4)', borderColor: 'rgba(245,158,11,.3)', background: 'var(--color-warning-dim)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <span style={{ color: 'var(--color-warning)' }}><Warn /></span>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', color: 'var(--color-warning)', margin: 0 }}>
                    Risco de Esquecimento
                  </h3>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text4)', marginBottom: 'var(--space-3)' }}>
                  {displayCards.length} card(s) com retenção abaixo de 50%
                  <span style={{ fontSize: '10px', color: 'var(--text3)', marginLeft: '6px' }}>({label})</span>
                </p>
                {displayCards.slice(0, 3).map((c, i) => (
                  <div
                    key={c.id}
                    data-testid={`risk-card-${i}`}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) var(--space-3)', background: 'rgba(245,158,11,.1)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-1)' }}
                  >
                    <span style={{ fontSize: 'var(--text-base)', color: 'var(--text)' }}>
                      {c.front.slice(0, 45)}{c.front.length > 45 ? '…' : ''}
                    </span>
                    <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-warning)', fontWeight: '700' }}>
                      {c.retention}%
                    </span>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Progresso por conteúdo */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '700', color: 'var(--text)', margin: '0 0 var(--space-4)' }}>
              📊 Domínio por Conteúdo
            </h2>
            <ContentProgressChart cards={state.cards} contents={state.contents} limit={5} />
          </div>

          {/* Calendário semanal */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '700', color: 'var(--text)', marginBottom: 'var(--space-4)', margin: '0 0 var(--space-4)' }}>
              🗓️ Calendário de Revisões
            </h2>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', height: '80px' }}>
              {weekBars.map((b, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)', height: '100%', justifyContent: 'flex-end' }}>
                  {b.n > 0 && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{b.n}</span>}
                  <div
                    style={{
                      width: '100%',
                      borderRadius: 'var(--radius-sm)',
                      height: Math.max(4, (b.n / maxBar) * 56) + 'px',
                      background: i === 0 ? 'linear-gradient(180deg, var(--color-primary), var(--color-primary-text))' : 'var(--border)',
                      border: i === 0 ? 'none' : '1px solid var(--border2)',
                      transition: 'height var(--duration-base)',
                    }}
                  />
                  <span style={{ fontSize: 'var(--text-xs)', color: i === 0 ? 'var(--color-primary-text)' : 'var(--text3)' }}>
                    {b.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna direita */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Mapa de retenção */}
          <div className="card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: '700', color: 'var(--text)', marginBottom: 'var(--space-4)', margin: '0 0 var(--space-4)' }}>
              Mapa de Retenção
            </h2>
            {state.cards.length > 0 ? (
              <>
                <Ring value={avgRet} size={96} />
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 'var(--space-4)' }}>
                  {[
                    { l: 'Fortes', v: strong, c: 'var(--color-success)' },
                    { l: 'Médios', v: state.cards.filter((c) => { const r = calcRetention(c); return r >= 50 && r < 75 }).length, c: 'var(--color-warning)' },
                    { l: 'Fracos', v: state.cards.filter((c) => calcRetention(c) < 50 && calcRetention(c) > 0).length, c: 'var(--color-danger)' },
                  ].map((s, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: s.c }}>{s.v}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState icon="🧠" title="Sem dados ainda" description="Adicione conteúdos e crie flashcards para ver sua retenção." />
            )}
          </div>

          {/* Tendência de retenção histórica */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: '700', color: 'var(--text)', margin: '0 0 var(--space-4)' }}>
              📈 Tendência de Retenção
            </h2>
            <CognitiveScoreTrend
              snapshots={retentionHistory ?? []}
              loading={retentionHistory === null}
              height={90}
            />
          </div>

          {/* Em progresso */}
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: '700', color: 'var(--text)', marginBottom: 'var(--space-3)', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Book /> Em Progresso
            </h2>
            {state.contents.filter((c) => c.progress < 100).length > 0 ? (
              <>
                {state.contents.filter((c) => c.progress < 100).slice(0, 3).map((c) => (
                  <div key={c.id} style={{ marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: '500' }}>
                        {c.title.slice(0, 22)}…
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>{c.progress}%</span>
                    </div>
                    <ProgressBar value={c.progress} color={c.color} />
                  </div>
                ))}
                <button className="btn-secondary" style={{ width: '100%', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }} onClick={() => router.push('/library')}>
                  Ver Biblioteca →
                </button>
              </>
            ) : (
              <EmptyState icon="📚" title="Nenhum conteúdo em progresso" action={{ label: 'Adicionar conteúdo', onClick: () => router.push('/library') }} />
            )}
          </div>

          {/* Habilidades */}
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: '700', color: 'var(--text)', marginBottom: 'var(--space-3)', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Award /> Habilidades
            </h2>
            {state.skills.length > 0 ? (
              <>
                {[...state.skills].sort((a, b) => b.level - a.level).slice(0, 4).map((s) => (
                  <div key={s.id} style={{ marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{s.name}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: s.color, fontWeight: '700' }}>Nv.{s.level}</span>
                    </div>
                    <ProgressBar value={Math.round((s.xp / s.maxXp) * 100)} color={s.color} />
                  </div>
                ))}
                <button className="btn-secondary" style={{ width: '100%', marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }} onClick={() => router.push('/skills')}>
                  Árvore de Habilidades →
                </button>
              </>
            ) : (
              <EmptyState icon="🌳" title="Nenhuma habilidade" action={{ label: 'Adicionar habilidade', onClick: () => router.push('/skills') }} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
