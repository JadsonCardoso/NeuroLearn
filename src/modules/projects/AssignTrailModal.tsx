'use client'

import { useState } from 'react'
import { X } from '@/components/icons'
import { assignTrailToProject, removeTrailFromProject } from '@/services/projectsService'
import { useAppData } from '@/hooks/useAppData'
import { useToast } from '@/hooks/useToast'
import type { LearningTrail } from '@/types'

interface AssignTrailModalProps {
  projectId: string
  projectName: string
  onClose: () => void
}

export function AssignTrailModal({ projectId, projectName, onClose }: AssignTrailModalProps) {
  const { state, dispatch, userId } = useAppData()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const trails = state.trails ?? []

  async function handleAssign(trail: LearningTrail) {
    if (!userId) {
      toast.error('Sessão expirada. Recarregue a página para continuar.')
      return
    }
    setLoading(trail.id)
    try {
      await assignTrailToProject(trail.id, projectId, userId)
      dispatch({ type: 'ASSIGN_TRAIL_PROJECT', payload: { trailId: trail.id, projectId } })
      toast.success(`Trilha "${trail.title}" associada ao projeto.`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao associar trilha.'
      toast.error(msg)
    } finally {
      setLoading(null)
    }
  }

  async function handleRemove(trail: LearningTrail) {
    if (!userId) {
      toast.error('Sessão expirada. Recarregue a página para continuar.')
      return
    }
    setLoading(trail.id)
    try {
      await removeTrailFromProject(trail.id, userId)
      dispatch({ type: 'ASSIGN_TRAIL_PROJECT', payload: { trailId: trail.id, projectId: null } })
      toast.success(`Trilha "${trail.title}" removida do projeto.`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao remover trilha.'
      toast.error(msg)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Associar trilhas ao projeto"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.6)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div onClick={onClose} style={{ position: 'absolute', inset: 0 }} />

      <div
        data-testid="assign-trail-modal"
        style={{
          position: 'relative',
          background: 'var(--card)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,.4)',
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-1)',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: 4,
              }}
            >
              Associar Trilhas
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)' }}>
              Projeto: <strong style={{ color: 'var(--text2)' }}>{projectName}</strong>
            </p>
          </div>
          <button
            aria-label="Fechar"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text3)',
              padding: 4,
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <X />
          </button>
        </div>

        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Uma trilha só pode pertencer a um projeto por vez.
        </p>

        {/* Lista de trilhas */}
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          {trails.length === 0 && (
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text3)',
                textAlign: 'center',
                padding: 'var(--space-6)',
              }}
            >
              Nenhuma trilha criada ainda.
            </p>
          )}

          {trails.map((trail) => {
            const isInThisProject = trail.projectId === projectId
            const isInOtherProject = trail.projectId !== null && trail.projectId !== projectId
            const isLoading = loading === trail.id

            return (
              <div
                key={trail.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  background: isInThisProject ? 'var(--color-primary)12' : 'var(--card2)',
                  border: `1px solid ${isInThisProject ? 'var(--color-primary)44' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  opacity: isInOtherProject ? 0.5 : 1,
                }}
              >
                {/* Ícone da trilha */}
                <span
                  style={{
                    fontSize: 20,
                    width: 36,
                    height: 36,
                    background: `${trail.color}22`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {trail.iconEmoji}
                </span>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      color: 'var(--text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {trail.title}
                  </div>
                  {isInOtherProject && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                      Em outro projeto
                    </div>
                  )}
                </div>

                {/* Ação */}
                {!isInOtherProject && (
                  <button
                    data-testid={isInThisProject ? 'trail-remove-btn' : 'trail-assign-btn'}
                    onClick={() => (isInThisProject ? handleRemove(trail) : handleAssign(trail))}
                    disabled={isLoading}
                    style={{
                      background: isInThisProject ? 'none' : 'var(--color-primary)',
                      color: isInThisProject ? 'var(--color-danger)' : '#fff',
                      border: isInThisProject ? '1px solid var(--color-danger)' : 'none',
                      borderRadius: 'var(--radius-md)',
                      padding: '6px 12px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    {isLoading ? '...' : isInThisProject ? 'Remover' : 'Adicionar'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Rodapé */}
        <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--card2)',
              color: 'var(--text2)',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 18px',
              fontSize: 'var(--text-base)',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
