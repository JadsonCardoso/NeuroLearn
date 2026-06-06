interface ProgressBarProps {
  value: number
  color?: string
  height?: string
}

export function ProgressBar({ value, color = '#7c3aed', height = '6px' }: ProgressBarProps) {
  return (
    <div className="progress-bar" style={{ height }}>
      <div
        className="progress-fill"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  )
}
