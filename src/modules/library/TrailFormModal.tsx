'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { uid } from '@/lib/utils'
import { X } from '@/components/icons'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { trailSchema, type TrailFormValues } from '@/lib/validation/schemas'
import type { LearningTrail, TrailType } from '@/types'

// ── Opções de cor disponíveis ─────────────────────────────────────────────────
const COLOR_OPTIONS = [
  { value: '#7c3aed', label: 'Roxo' },
  { value: '#06b6d4', label: 'Ciano' },
  { value: '#10b981', label: 'Verde' },
  { value: '#f59e0b', label: 'Âmbar' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#3b82f6', label: 'Azul' },
  { value: '#8b5cf6', label: 'Violeta' },
]

// ── Opções de ícone ───────────────────────────────────────────────────────────
const EMOJI_OPTIONS = ['📚', '🎓', '🚀', '💡', '🧠', '🎯', '⚡', '🔬']

// ── Labels dos tipos de trilha ────────────────────────────────────────────────
const TYPE_LABELS: Record<TrailType, string> = {
  course: 'Curso',
  book: 'Livro',
  article: 'Artigos',
  free: 'Livre',
  certification: 'Certificação',
  research: 'Pesquisa',
  tech: 'Tecnologia',
}

interface TrailFormModalProps {
  trail?: LearningTrail
  onSave: (trail: LearningTrail) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

// Modal de criação e edição de Trilha de Aprendizado
export function TrailFormModal({ trail, onSave, onDelete, onClose }: TrailFormModalProps) {
  const isEdit = Boolean(trail)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TrailFormValues>({
    resolver: zodResolver(trailSchema),
    defaultValues: {
      title: trail?.title ?? '',
      type: trail?.type ?? 'free',
      description: trail?.description ?? '',
      color: trail?.color ?? '#7c3aed',
      iconEmoji: trail?.iconEmoji ?? '📚',
      goal: trail?.goal ?? '',
    },
  })

  const selectedColor = watch('color')
  const selectedEmoji = watch('iconEmoji')

  // Fecha com ESC se não há alterações pendentes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function onSubmit(data: TrailFormValues) {
    const saved: LearningTrail = {
      id: trail?.id ?? uid(),
      title: data.title,
      type: data.type,
      description: data.description ?? '',
      color: data.color,
      iconEmoji: data.iconEmoji,
      goal: data.goal ?? '',
      skillId: trail?.skillId ?? null,
      createdAt: trail?.createdAt ?? new Date().toISOString(),
    }
    onSave(saved)
  }

  async function handleDelete() {
    if (!trail || !onDelete) return
    setDeleting(true)
    try {
      onDelete(trail.id)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Editar trilha' : 'Nova trilha'}
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
        {/* Overlay */}
        <div onClick={onClose} style={{ position: 'absolute', inset: 0 }} />

        {/* Painel */}
        <div
          data-testid="trail-form-modal"
          style={{
            position: 'relative',
            background: 'var(--card)',
            border: '1px solid var(--border2)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,.4)',
          }}
        >
          {/* Cabeçalho */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-5)',
            }}
          >
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text)' }}>
              {isEdit ? 'Editar Trilha' : 'Nova Trilha'}
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
            {/* Título */}
            <FormField
              label="Nome da trilha"
              htmlFor="trail-title"
              required
              error={errors.title?.message}
            >
              <Input
                id="trail-title"
                data-testid="trail-title"
                placeholder="ex: Engenharia de Produto"
                aria-invalid={Boolean(errors.title)}
                {...register('title')}
              />
            </FormField>

            {/* Tipo */}
            <FormField label="Tipo" htmlFor="trail-type" required error={errors.type?.message}>
              <select
                id="trail-type"
                data-testid="trail-type"
                aria-invalid={Boolean(errors.type)}
                {...register('type')}
                style={{
                  width: '100%',
                  background: 'var(--card2)',
                  color: 'var(--text)',
                  border: errors.type
                    ? '1px solid var(--color-danger)'
                    : '1px solid var(--border2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  fontSize: 'var(--text-base)',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {(Object.entries(TYPE_LABELS) as [TrailType, string][]).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Cor */}
            <FormField label="Cor" htmlFor="trail-color" required error={errors.color?.message}>
              <div
                role="radiogroup"
                aria-label="Cor da trilha"
                style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}
              >
                {COLOR_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={label}
                    aria-pressed={selectedColor === value}
                    onClick={() => setValue('color', value, { shouldDirty: true })}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: value,
                      border:
                        selectedColor === value ? '3px solid var(--text)' : '2px solid transparent',
                      outline: selectedColor === value ? `2px solid ${value}` : 'none',
                      outlineOffset: 2,
                      cursor: 'pointer',
                      transition: 'transform 0.15s',
                      transform: selectedColor === value ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </FormField>

            {/* Emoji */}
            <FormField
              label="Ícone"
              htmlFor="trail-emoji"
              required
              error={errors.iconEmoji?.message}
            >
              <div
                role="radiogroup"
                aria-label="Ícone da trilha"
                style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}
              >
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    aria-label={`Ícone ${emoji}`}
                    aria-pressed={selectedEmoji === emoji}
                    onClick={() => setValue('iconEmoji', emoji, { shouldDirty: true })}
                    style={{
                      width: 40,
                      height: 40,
                      fontSize: 20,
                      borderRadius: 'var(--radius-md)',
                      background: selectedEmoji === emoji ? `${selectedColor}22` : 'var(--card2)',
                      border:
                        selectedEmoji === emoji
                          ? `2px solid ${selectedColor}`
                          : '1px solid var(--border2)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </FormField>

            {/* Descrição */}
            <FormField label="Descrição" htmlFor="trail-desc" error={errors.description?.message}>
              <Textarea
                id="trail-desc"
                data-testid="trail-description"
                placeholder="Sobre o que é essa trilha?"
                rows={2}
                aria-invalid={Boolean(errors.description)}
                {...register('description')}
              />
            </FormField>

            {/* Objetivo */}
            <FormField label="Objetivo" htmlFor="trail-goal" error={errors.goal?.message}>
              <Input
                id="trail-goal"
                data-testid="trail-goal"
                placeholder="ex: Dominar discovery de produto até julho"
                aria-invalid={Boolean(errors.goal)}
                {...register('goal')}
              />
            </FormField>

            {/* Preview da trilha */}
            {watch('title') && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  background: `${selectedColor}11`,
                  border: `1px solid ${selectedColor}33`,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ fontSize: 24 }}>{selectedEmoji}</span>
                <div>
                  <div
                    style={{ fontWeight: 600, color: selectedColor, fontSize: 'var(--text-sm)' }}
                  >
                    {watch('title')}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                    {TYPE_LABELS[watch('type') as TrailType]}
                  </div>
                </div>
              </div>
            )}

            {/* Ações */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'var(--space-2)',
              }}
            >
              {isEdit && onDelete ? (
                <button
                  type="button"
                  data-testid="trail-delete-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--color-danger)',
                    color: 'var(--color-danger)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 14px',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Excluir trilha
                </button>
              ) : (
                <span />
              )}

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
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
                <LoadingButton
                  type="submit"
                  loading={isSubmitting}
                  disabled={!isDirty && isEdit}
                  data-testid="trail-save-btn"
                  style={{ background: selectedColor }}
                >
                  {isEdit ? 'Salvar alterações' : 'Criar trilha'}
                </LoadingButton>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Excluir trilha"
        description={`Tem certeza que deseja excluir "${trail?.title}"? Os conteúdos desta trilha não serão excluídos, apenas desvinculados.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}
