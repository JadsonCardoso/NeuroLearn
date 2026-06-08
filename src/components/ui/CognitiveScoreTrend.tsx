'use client'

export interface RetentionSnapshot {
  date: string    // YYYY-MM-DD
  avgRetention: number  // 0–100
}

interface Props {
  snapshots: RetentionSnapshot[]
  loading?: boolean
  height?: number
}

// Gráfico de linha SVG — tendência do índice de retenção histórico.
export function CognitiveScoreTrend({ snapshots, loading = false, height = 80 }: Props) {
  if (loading) {
    return (
      <div
        style={{
          height: `${height}px`,
          background: 'var(--border2)',
          borderRadius: '6px',
          opacity: 0.6,
        }}
      />
    )
  }

  if (snapshots.length < 2) {
    return (
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text4)', textAlign: 'center' }}>
          Dados insuficientes. Continue revisando para ver a tendência.
        </span>
      </div>
    )
  }

  const W = 300
  const H = height
  const pad = { t: 8, r: 8, b: 20, l: 28 }
  const iW = W - pad.l - pad.r
  const iH = H - pad.t - pad.b

  const last = snapshots[snapshots.length - 1].avgRetention
  const first = snapshots[0].avgRetention
  const trend = last - first
  const trendColor = trend >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
  const trendLabel = `${trend >= 0 ? '+' : ''}${trend.toFixed(0)}%`

  const xs = snapshots.map((_, i) =>
    pad.l + (snapshots.length > 1 ? (i / (snapshots.length - 1)) : 0.5) * iW,
  )
  const ys = snapshots.map((s) => pad.t + iH - (Math.min(s.avgRetention, 100) / 100) * iH)

  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${xs[xs.length - 1].toFixed(1)} ${(pad.t + iH).toFixed(1)} L ${xs[0].toFixed(1)} ${(pad.t + iH).toFixed(1)} Z`

  // Eixo Y: linhas guia em 0, 50, 100
  const gridY = [0, 50, 100].map((v) => ({
    v,
    y: pad.t + iH - (v / 100) * iH,
  }))

  // Rótulos do eixo X: primeiro e último
  const labelFirst = snapshots[0].date.slice(5)       // MM-DD
  const labelLast = snapshots[snapshots.length - 1].date.slice(5)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
          Atual: <strong style={{ color: 'var(--color-primary-text)' }}>{last}%</strong>
        </span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: trendColor }}>{trendLabel} vs início</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', display: 'block', overflow: 'visible' }}
        aria-label="Tendência de retenção"
      >
        {/* Linhas guia */}
        {gridY.map(({ v, y }) => (
          <g key={v}>
            <line
              x1={pad.l} y1={y} x2={W - pad.r} y2={y}
              stroke="var(--border2)" strokeDasharray="3 3" strokeWidth="1"
            />
            <text x={pad.l - 4} y={y + 3} fontSize="8" fill="var(--text4)" textAnchor="end">{v}</text>
          </g>
        ))}

        {/* Área preenchida */}
        <path d={areaPath} fill="rgba(124,58,237,0.08)" />

        {/* Linha principal */}
        <path
          d={linePath}
          fill="none"
          stroke="rgba(124,58,237,0.85)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Ponto final destacado */}
        <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3.5" fill="#7c3aed" />

        {/* Rótulos eixo X */}
        <text x={xs[0]} y={H - 2} fontSize="8" fill="var(--text4)" textAnchor="middle">{labelFirst}</text>
        <text x={xs[xs.length - 1]} y={H - 2} fontSize="8" fill="var(--text4)" textAnchor="middle">{labelLast}</text>
      </svg>
    </div>
  )
}
