'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Plus } from '@/components/icons'
import { FormError } from '@/components/ui/FormError'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { sessionEditSchema, type SessionEditFormValues } from '@/lib/validation/schemas'
import { useAppData } from '@/hooks/useAppData'
import type { StudySession } from '@/types'

interface SessionEditModalProps {
  session: StudySession
  onClose: () => void
}

export function SessionEditModal({ session, onClose }: SessionEditModalProps) {
  const { dispatch, userId } = useAppData()
  const [highlights, setHighlights] = useState<string[]>(session.highlights ?? [])
  const [highlightInput, setHighlightInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SessionEditFormValues>({
    resolver: zodResolver(sessionEditSchema),
    defaultValues: {
      notes: session.notes ?? '',
      teach: session.teach ?? '',
    },
  })

  if (!userId) return null

  function addHighlight() {
    const h = highlightInput.trim()
    if (!h || highlights.includes(h)) return
    setHighlights((prev) => [...prev, h])
    setHighlightInput('')
  }

  function removeHighlight(h: string) {
    setHighlights((prev) => prev.filter((item) => item !== h))
  }

  function onSubmit(values: SessionEditFormValues) {
    dispatch({
      type: 'UPDATE_SESSION',
      payload: {
        id: session.id,
        notes: values.notes,
        teach: values.teach,
        highlights,
      },
    })
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Editar sessão de estudo"
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
        data-testid="session-edit-modal"
        style={{
          position: 'relative',
          background: 'var(--card)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
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
            Editar Sessão
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
          {/* Highlights */}
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
              Highlights
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <input
                type="text"
                placeholder="Adicionar conceito-chave..."
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addHighlight()
                  }
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg2)',
                  color: 'var(--text)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={addHighlight}
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Plus />
              </button>
            </div>
            {highlights.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {highlights.map((h) => (
                  <span
                    key={h}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(245,158,11,.12)',
                      color: '#d97706',
                      border: '1px solid rgba(245,158,11,.25)',
                      borderRadius: '20px',
                      padding: '2px 8px 2px 10px',
                      fontSize: '11px',
                      fontWeight: 500,
                    }}
                  >
                    {h}
                    <button
                      type="button"
                      onClick={() => removeHighlight(h)}
                      aria-label={`Remover highlight ${h}`}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: '#d97706',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <X />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notas */}
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
              Notas
            </label>
            <textarea
              {...register('notes')}
              placeholder="Principais pontos, insights, dúvidas..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${errors.notes ? 'var(--color-danger)' : 'var(--border)'}`,
                background: 'var(--bg2)',
                color: 'var(--text)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {errors.notes && (
              <FormError id="session-notes-error" message={errors.notes.message ?? ''} />
            )}
          </div>

          {/* Modo Professor */}
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
              Modo Professor
            </label>
            <textarea
              {...register('teach')}
              placeholder="Como você explicaria esse conteúdo para outra pessoa?"
              rows={5}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${errors.teach ? 'var(--color-danger)' : 'var(--border)'}`,
                background: 'var(--bg2)',
                color: 'var(--text)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
            {errors.teach && (
              <FormError id="session-teach-error" message={errors.teach.message ?? ''} />
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
