'use client'

import { Settings } from '@/components/icons'
import type { Project, LearningTrail, Content } from '@/types'

interface ProjectCardProps {
  project: Project
  trails: LearningTrail[]
  contents: Content[]
  onClick: () => void
  onEdit: () => void
}

function cap(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function computeProgress(trails: LearningTrail[], contents: Content[]): number {
  if (trails.length === 0) return 0
  const trailProgresses = trails.map((trail) => {
    const tc = contents.filter((c) => c.trailId === trail.id)
    if (tc.length === 0) return 0
    return cap(tc.reduce((sum, c) => sum + c.progress, 0) / tc.length)
  })
  return cap(trailProgresses.reduce((sum, p) => sum + p, 0) / trailProgresses.length)
}

export function ProjectCard({ project, trails, contents, onClick, onEdit }: ProjectCardProps) {
  const progress = computeProgress(trails, contents)
  const contentCount = contents.filter((c) => trails.some((t) => t.id === c.trailId)).length

  return (
    <div
      data-testid="project-card"
      onClick={onClick}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border2)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        cursor: 'pointer',
        transition: 'border-color var(--duration-fast), box-shadow var(--duration-fast)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border2)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Botão editar */}
      <button
        aria-label="Editar projeto"
        data-testid="project-card-edit"
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
        style={{
          position: 'absolute',
          top: 'var(--space-3)',
          right: 'var(--space-3)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text3)',
          padding: 4,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Settings />
      </button>

      {/* Cabeçalho */}
      <div>
        <div
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 'var(--space-1)',
            paddingRight: 'var(--space-6)',
          }}
        >
          {project.name}
        </div>
        {project.description && (
          <div
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text3)',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {project.description}
          </div>
        )}
      </div>

      {/* Progresso */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>Progresso</span>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text2)' }}>
            {progress}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            background: 'var(--card2)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background:
                progress === 100
                  ? 'var(--color-success)'
                  : 'linear-gradient(90deg, var(--color-primary), var(--color-info))',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Contadores */}
      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
          <strong style={{ color: 'var(--text2)' }}>{trails.length}</strong>{' '}
          {trails.length === 1 ? 'trilha' : 'trilhas'}
        </span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
          <strong style={{ color: 'var(--text2)' }}>{contentCount}</strong>{' '}
          {contentCount === 1 ? 'conteúdo' : 'conteúdos'}
        </span>
      </div>
    </div>
  )
}
