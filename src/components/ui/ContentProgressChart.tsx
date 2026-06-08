'use client'

import type { FlashCard, Content } from '@/types'

interface Props {
  cards: FlashCard[]
  contents: Content[]
  limit?: number
}

// Pontuação de domínio por estado do card
function masteryScore(mastery: FlashCard['mastery']): number {
  switch (mastery) {
    case 'strong':   return 100
    case 'review':   return 65
    case 'learning': return 30
    default:         return 5   // 'new'
  }
}

// Gráfico horizontal de barras — domínio médio dos flashcards por conteúdo.
export function ContentProgressChart({ cards, contents, limit = 5 }: Props) {
  const byContent = new Map<string, number[]>()
  cards.forEach((c) => {
    const scores = byContent.get(c.cid) ?? []
    scores.push(masteryScore(c.mastery))
    byContent.set(c.cid, scores)
  })

  const data = contents
    .filter((c) => byContent.has(c.id))
    .map((c) => {
      const scores = byContent.get(c.id)!
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      return { id: c.id, title: c.title, color: c.color || '#7c3aed', avg, cardCount: scores.length }
    })
    .sort((a, b) => b.avg - a.avg)
    .slice(0, limit)

  if (data.length === 0) {
    return (
      <p style={{ fontSize: '11px', color: 'var(--text4)', textAlign: 'center', margin: '8px 0' }}>
        Crie flashcards para ver o progresso por conteúdo.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {data.map((d) => {
        const barColor =
          d.avg >= 70 ? 'var(--color-success)' :
          d.avg >= 40 ? 'var(--color-warning)' :
          'var(--color-danger)'

        return (
          <div key={d.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', gap: '6px' }}>
              <span
                style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}
                title={d.title}
              >
                {d.title}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text3)', whiteSpace: 'nowrap', display: 'flex', gap: '6px', flexShrink: 0 }}>
                <span>{d.cardCount} cards</span>
                <span style={{ fontWeight: 700, color: barColor }}>{d.avg}%</span>
              </span>
            </div>
            <div style={{ height: '7px', background: 'var(--border2)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${d.avg}%`,
                  background: d.color,
                  borderRadius: '4px',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
