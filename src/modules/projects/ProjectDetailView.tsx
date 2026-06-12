'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Settings } from '@/components/icons'
import { AssignTrailModal } from './AssignTrailModal'
import { useAppData } from '@/hooks/useAppData'
import type { Project, LearningTrail, Content } from '@/types'

interface ProjectDetailViewProps {
  project: Project
  onBack: () => void
  onEdit: () => void
}

function cap(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function computeTrailProgress(trailId: string, contents: Content[]): number {
  const tc = contents.filter((c) => c.trailId === trailId)
  if (tc.length === 0) return 0
  return cap(tc.reduce((sum, c) => sum + c.progress, 0) / tc.length)
}

function computeProjectProgress(trails: LearningTrail[], contents: Content[]): number {
  if (trails.length === 0) return 0
  const trailProgresses = trails.map((t) => computeTrailProgress(t.id, contents))
  return cap(trailProgresses.reduce((sum, p) => sum + p, 0) / trailProgresses.length)
}

export function ProjectDetailView({ project, onBack, onEdit }: ProjectDetailViewProps) {
  const { state } = useAppData()
  const [showAssignModal, setShowAssignModal] = useState(false)

  const projectTrails = (state.trails ?? []).filter((t) => t.projectId === project.id)
  const progress = computeProjectProgress(projectTrails, state.contents)
  const contentCount = state.contents.filter((c) =>
    projectTrails.some((t) => t.id === c.trailId)
  ).length

  return (
    <>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 800 }}
      >
        {/* Navegação */}
        <button
          data-testid="project-back-btn"
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text3)',
            fontSize: 'var(--text-sm)',
            padding: 0,
            fontFamily: 'inherit',
            width: 'fit-content',
          }}
        >
          <ArrowLeft />
          Todos os projetos
        </button>

        {/* Header do projeto */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border2)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div>
              <h1
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 800,
                  color: 'var(--text)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                {project.name}
              </h1>
              {project.description && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', maxWidth: 480 }}>
                  {project.description}
                </p>
              )}
            </div>
            <button
              aria-label="Editar projeto"
              data-testid="project-detail-edit-btn"
              onClick={onEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                background: 'var(--card2)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 14px',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                cursor: 'pointer',
                color: 'var(--text2)',
                fontFamily: 'inherit',
              }}
            >
              <Settings />
              Editar
            </button>
          </div>

          {/* Barra de progresso */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)' }}>
                Progresso geral
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text)' }}>
                {progress}%
              </span>
            </div>
            <div
              style={{
                height: 8,
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

          {/* Métricas */}
          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text)' }}>
                {projectTrails.length}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                {projectTrails.length === 1 ? 'Trilha' : 'Trilhas'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text)' }}>
                {contentCount}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                {contentCount === 1 ? 'Conteúdo' : 'Conteúdos'}
              </div>
            </div>
          </div>
        </div>

        {/* Trilhas associadas */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-3)',
            }}
          >
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text)' }}>
              Trilhas deste projeto
            </h2>
            <button
              data-testid="assign-trail-btn"
              onClick={() => setShowAssignModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '6px 14px',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Plus />
              Associar trilhas
            </button>
          </div>

          {projectTrails.length === 0 ? (
            <div
              style={{
                background: 'var(--card)',
                border: '1px dashed var(--border2)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-8)',
                textAlign: 'center',
                color: 'var(--text3)',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 'var(--space-3)' }}>📂</div>
              <p style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)' }}>
                Nenhuma trilha associada ainda.
              </p>
              <button
                onClick={() => setShowAssignModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-primary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                }}
              >
                Clique para associar trilhas →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {projectTrails.map((trail) => {
                const trailContents = state.contents.filter((c) => c.trailId === trail.id)
                const trailProgress = computeTrailProgress(trail.id, state.contents)

                return (
                  <div
                    key={trail.id}
                    data-testid="project-trail-item"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-4)',
                    }}
                  >
                    {/* Ícone */}
                    <span
                      style={{
                        fontSize: 22,
                        width: 40,
                        height: 40,
                        background: `${trail.color}22`,
                        border: `1px solid ${trail.color}44`,
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {trail.iconEmoji}
                    </span>

                    {/* Info + barra */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 600,
                          color: trail.color,
                          marginBottom: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {trail.title}
                      </div>
                      <div
                        style={{
                          height: 4,
                          background: 'var(--card2)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${trailProgress}%`,
                            background: trail.color,
                            borderRadius: 'var(--radius-full)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Métricas */}
                    <div style={{ display: 'flex', gap: 'var(--space-4)', flexShrink: 0 }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                        <strong style={{ color: 'var(--text2)' }}>{trailContents.length}</strong>{' '}
                        {trailContents.length === 1 ? 'conteúdo' : 'conteúdos'}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          color: 'var(--text2)',
                        }}
                      >
                        {trailProgress}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showAssignModal && (
        <AssignTrailModal
          projectId={project.id}
          projectName={project.name}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </>
  )
}
