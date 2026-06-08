'use client'

// Heat map de atividade — grade estilo GitHub contributions.
// Exibe as últimas `weeks` semanas de sessões de estudo.
interface Props {
  sessions: Array<{ date: string }>
  weeks?: number
}

const DAY_LABELS = ['Seg', '', 'Qua', '', 'Sex', '', 'Dom']

function cellColor(count: number): string {
  if (count === 0) return 'var(--border2)'
  if (count === 1) return 'rgba(124,58,237,0.28)'
  if (count === 2) return 'rgba(124,58,237,0.52)'
  return 'rgba(124,58,237,0.85)'
}

export function ActivityHeatmap({ sessions, weeks = 16 }: Props) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const counts = new Map<string, number>()
  sessions.forEach((s) => {
    const d = (s.date ?? '').slice(0, 10)
    // CC-01: ignora datas inválidas; CC-03: ignora datas futuras
    if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d <= todayStr) {
      counts.set(d, (counts.get(d) ?? 0) + 1)
    }
  })

  // Constrói grade: weeks colunas × 7 linhas (Seg-Dom)
  const totalDays = weeks * 7
  const today = new Date()
  // Recua até o início da semana (segunda-feira) mais antiga
  const origin = new Date(today)
  origin.setDate(today.getDate() - (totalDays - 1))

  const grid: Array<Array<{ dateStr: string; count: number }>> = []
  for (let col = 0; col < weeks; col++) {
    const column: Array<{ dateStr: string; count: number }> = []
    for (let row = 0; row < 7; row++) {
      const d = new Date(origin)
      d.setDate(origin.getDate() + col * 7 + row)
      const dateStr = d.toISOString().slice(0, 10)
      column.push({ dateStr, count: counts.get(dateStr) ?? 0 })
    }
    grid.push(column)
  }

  // Totais baseados apenas nas sessões válidas (filtradas no Map)
  const totalSessions = Array.from(counts.values()).reduce((a, b) => a + b, 0)
  const activeDays = [...counts.values()].filter((v) => v > 0).length

  return (
    <div>
      <div style={{ display: 'flex', gap: '0', alignItems: 'flex-start' }}>
        {/* Rótulos dos dias */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginRight: '6px', paddingTop: '1px' }}>
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              style={{ fontSize: '9px', color: 'var(--text4)', height: '13px', lineHeight: '13px', textAlign: 'right', minWidth: '20px' }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grade */}
        <div style={{ display: 'flex', gap: '3px', flex: 1, overflowX: 'auto' }}>
          {grid.map((col, colIdx) => (
            <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {col.map((cell) => (
                <div
                  key={cell.dateStr}
                  title={`${cell.dateStr}: ${cell.count} sessão${cell.count !== 1 ? 'ões' : ''}`}
                  style={{
                    width: '13px',
                    height: '13px',
                    borderRadius: '2px',
                    background: cellColor(cell.count),
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legenda e totais */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text4)' }}>
          {activeDays} dia{activeDays !== 1 ? 's' : ''} ativo{activeDays !== 1 ? 's' : ''} · {totalSessions} sessão{totalSessions !== 1 ? 'ões' : ''}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text4)' }}>menos</span>
          {[0, 1, 2, 3].map((level) => (
            <div key={level} style={{ width: '10px', height: '10px', borderRadius: '2px', background: cellColor(level) }} />
          ))}
          <span style={{ fontSize: '9px', color: 'var(--text4)' }}>mais</span>
        </div>
      </div>
    </div>
  )
}
