'use client'

import { useState } from 'react'
import { Pencil, Trash } from '@/components/icons'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ExerciseEditModal } from './ExerciseEditModal'
import { listExercisesByContent, deleteExercise } from '@/services/exercisesService'
import { useToast } from '@/hooks/useToast'
import type { Exercise } from '@/types'

interface ExercisesSectionProps {
  contentId: string
  userId: string
}

export function ExercisesSection({ contentId, userId }: ExercisesSectionProps) {
  const { toast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleToggle() {
    if (!expanded && !loaded) {
      setExpanded(true)
      setLoading(true)
      try {
        const list = await listExercisesByContent(userId, contentId)
        setExercises(list)
        setLoaded(true)
      } catch {
        toast.error('Não foi possível carregar os exercícios.')
        setExpanded(false)
      } finally {
        setLoading(false)
      }
    } else {
      setExpanded((prev) => !prev)
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingId) return
    setDeleteLoading(true)
    try {
      await deleteExercise(deletingId, userId)
      setExercises((prev) => prev.filter((e) => e.id !== deletingId))
      toast.success('Exercício removido.')
    } catch {
      toast.error('Não foi possível remover o exercício. Tente novamente.')
    } finally {
      setDeleteLoading(false)
      setDeletingId(null)
    }
  }

  function handleSaved(updated: Exercise) {
    setExercises((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    setEditingExercise(null)
  }

  const label = loaded
    ? `Exercícios (${exercises.length})`
    : loading
      ? 'Exercícios (carregando...)'
      : 'Exercícios'

  return (
    <>
      {/* Toggle */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 16px' }}>
        <button
          data-testid="exercises-section-toggle"
          onClick={handleToggle}
          disabled={loading}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text3)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'inherit',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s',
              flexShrink: 0,
            }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          📝 {label}
        </button>
      </div>

      {/* Lista de exercícios */}
      {expanded && (
        <div
          style={{
            padding: '0 16px 16px 36px',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          {loading && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', margin: 0 }}>
              Carregando exercícios...
            </p>
          )}

          {loaded && exercises.length === 0 && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', margin: 0 }}>
              Nenhum exercício criado para este conteúdo.
            </p>
          )}

          {exercises.map((exercise, idx) => (
            <div
              key={exercise.id}
              data-testid="exercise-item"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'flex-start',
              }}
            >
              {/* Número */}
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text3)',
                  background: 'var(--card2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 7px',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                #{idx + 1}
              </span>

              {/* Conteúdo */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    color: 'var(--text3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 4,
                  }}
                >
                  Pergunta
                </div>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text)',
                    margin: '0 0 var(--space-3)',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {exercise.question}
                </p>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    color: 'var(--text3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 4,
                  }}
                >
                  Resposta
                </div>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text2)',
                    margin: 0,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {exercise.answer}
                </p>
              </div>

              {/* Ações */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  flexShrink: 0,
                }}
              >
                <button
                  aria-label="Editar exercício"
                  data-testid="exercise-edit-btn"
                  onClick={() => setEditingExercise(exercise)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '5px 8px',
                    cursor: 'pointer',
                    color: 'var(--text2)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Pencil />
                </button>
                <button
                  aria-label="Excluir exercício"
                  data-testid="exercise-delete-btn"
                  onClick={() => setDeletingId(exercise.id)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '5px 8px',
                    cursor: 'pointer',
                    color: 'var(--color-danger)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Trash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edição */}
      {editingExercise && (
        <ExerciseEditModal
          exercise={editingExercise}
          userId={userId}
          onClose={() => setEditingExercise(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={!!deletingId}
        title="Excluir exercício?"
        description="Esta ação não pode ser desfeita. O exercício será removido permanentemente."
        confirmLabel="Excluir"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </>
  )
}
