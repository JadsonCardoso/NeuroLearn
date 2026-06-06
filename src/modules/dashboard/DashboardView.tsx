'use client'

import { useRouter } from 'next/navigation'
import { useAppData } from '@/hooks/useAppData'
import { calcRetention } from '@/engine/retention'
import { isDue, relDate } from '@/engine/scheduling'
import { Ring } from '@/components/ui/Ring'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Brain, Refresh, Book, Award, Warn } from '@/components/icons'

// Saudação contextual baseada no horário
function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function DashboardView() {
  const { state } = useAppData()
  const router = useRouter()

  const due = state.cards.filter(isDue)
  const avgRet = state.cards.length
    ? Math.round(state.cards.reduce((a, c) => a + calcRetention(c), 0) / state.cards.length)
    : 0
  const risk = state.cards.filter((c) => { const r = calcRetention(c); return r < 50 && r > 0 })
  const strong = state.cards.filter((c) => calcRetention(c) >= 75).length

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
          { l: 'Sequência',     v: state.streak + 'd',              icon: '🔥', c: 'var(--color-warning)', bg: 'var(--color-warning-dim)' },
          { l: 'Total XP',      v: (state.totalXp ?? 0).toLocaleString(), icon: '⚡', c: 'var(--color-primary)', bg: 'var(--color-primary-dim)' },
          { l: 'Para revisar',  v: due.length,                      icon: '🔄', c: 'var(--color-info)',    bg: 'var(--color-info-dim)'    },
          { l: 'Retenção média',v: avgRet + '%',                    icon: '🧠', c: 'var(--color-success)', bg: 'var(--color-success-dim)' },
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

          {/* Risco de esquecimento */}
          {risk.length > 0 ? (
            <div
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
                {risk.length} card(s) com retenção abaixo de 50%
              </p>
              {risk.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) var(--space-3)', background: 'rgba(245,158,11,.1)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-1)' }}
                >
                  <span style={{ fontSize: 'var(--text-base)', color: 'var(--text)' }}>
                    {c.front.slice(0, 45)}…
                  </span>
                  <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-warning)', fontWeight: '700' }}>
                    {calcRetention(c)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <EmptyState icon="🛡️" title="Nenhum card em risco" description="Sua retenção está saudável." />
            </div>
          )}

          {/* Calendário semanal */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '700', color: 'var(--text)', marginBottom: 'var(--space-4)', margin: '0 0 var(--space-4)' }}>
              📅 Calendário de Revisões
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
