// Componente de progresso circular SVG

interface RingProps {
  value: number
  size?: number
}

export function Ring({ value, size = 80 }: RingProps) {
  const r = (size - 10) / 2
  const circumference = 2 * Math.PI * r
  const color = value >= 70 ? '#10b981' : value >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth="8"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray .8s ease' }}
      />
      <text
        x={size / 2}
        y={size / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={size / 5}
        fontWeight="700"
        fontFamily="Inter"
      >
        {value}%
      </text>
    </svg>
  )
}
