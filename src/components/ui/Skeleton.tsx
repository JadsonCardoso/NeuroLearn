// Skeleton loading — shimmer animation, evita percepção de app travado
import { CSSProperties } from 'react'

interface SkeletonBaseProps {
  width?: string | number
  height?: string | number
  style?: CSSProperties
}

function SkeletonBase({ width = '100%', height = '16px', style }: SkeletonBaseProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  )
}

function SkeletonCard({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        ...style,
      }}
    >
      <SkeletonBase height="14px" width="60%" />
      <SkeletonBase height="12px" width="90%" />
      <SkeletonBase height="12px" width="75%" />
    </div>
  )
}

function SkeletonText({ lines = 1, style }: { lines?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          height="12px"
          width={i === lines - 1 && lines > 1 ? '65%' : '100%'}
        />
      ))}
    </div>
  )
}

function SkeletonCircle({ size = 48 }: { size?: number }) {
  return (
    <SkeletonBase
      width={size}
      height={size}
      style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }}
    />
  )
}

export const Skeleton = {
  Card: SkeletonCard,
  Text: SkeletonText,
  Circle: SkeletonCircle,
}
