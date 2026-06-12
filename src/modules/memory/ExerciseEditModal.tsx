'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from '@/components/icons'
import { FormError } from '@/components/ui/FormError'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { exerciseEditSchema, type ExerciseEditFormValues } from '@/lib/validation/schemas'
import { updateExercise } from '@/services/exercisesService'
import { useToast } from '@/hooks/useToast'
import type { Exercise } from '@/types'

interface ExerciseEditModalProps {
  exercise: Exercise
  userId: string
  onClose: () => void
  onSaved: (updated: Exercise) => void
}

export function ExerciseEditModal({ exercise, userId, onClose, onSaved }: ExerciseEditModalProps) {
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseEditFormValues>({
    resolver: zodResolver(exerciseEditSchema),
    defaultValues: {
      question: exercise.question,
      answer: exercise.answer,
    },
  })

  async function onSubmit(values: ExerciseEditFormValues) {
    try {
      await updateExercise(exercise.id, userId, {
        question: values.question,
        answer: values.answer,
      })
      toast.success('Exercício atualizado.')
      onSaved({ ...exercise, question: values.question, answer: values.answer })
    } catch {
      toast.error('Não foi possível atualizar o exercício. Tente novamente.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Editar exercício"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.6)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div onClick={onClose} style={{ position: 'absolute', inset: 0 }} />

      <div
        data-testid="exercise-edit-modal"
        style={{
          position: 'relative',
          background: 'var(--card)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,.4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-5)',
          }}
        >
          <h2
            style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text)', margin: 0 }}
          >
            Editar Exercício
          </h2>
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
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          {/* Pergunta */}
          <div>
            <label
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--text2)',
                display: 'block',
                marginBottom: 'var(--space-2)',
              }}
            >
              Pergunta <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <textarea
              {...register('question')}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${errors.question ? 'var(--color-danger)' : 'var(--border)'}`,
                background: 'var(--bg2)',
                color: 'var(--text)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {errors.question && (
              <FormError id="exercise-question-error" message={errors.question.message ?? ''} />
            )}
          </div>

          {/* Resposta */}
          <div>
            <label
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--text2)',
                display: 'block',
                marginBottom: 'var(--space-2)',
              }}
            >
              Resposta <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <textarea
              {...register('answer')}
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${errors.answer ? 'var(--color-danger)' : 'var(--border)'}`,
                background: 'var(--bg2)',
                color: 'var(--text)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {errors.answer && (
              <FormError id="exercise-answer-error" message={errors.answer.message ?? ''} />
            )}
          </div>

          {/* Ações */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)',
            }}
          >
            <button
              type="button"
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
              Cancelar
            </button>
            <LoadingButton loading={isSubmitting} type="submit">
              Salvar
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  )
}
