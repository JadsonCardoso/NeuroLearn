'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldErrors } from 'react-hook-form'
import type { Content, ContentType } from '@/types'
import { uid } from '@/lib/utils'
import { X } from '@/components/icons'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { contentSchema, type ContentFormValues } from '@/lib/validation/schemas'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const TYPE_CONFIG: Record<ContentType, { icon: string; color: string }> = {
  book:    { icon: '📚', color: '#7c3aed' },
  course:  { icon: '🎓', color: '#06b6d4' },
  video:   { icon: '🎥', color: '#ef4444' },
  article: { icon: '📄', color: '#f59e0b' },
  note:    { icon: '📝', color: '#10b981' },
}

interface AddContentModalProps {
  onAdd: (content: Content) => void
  onClose: () => void
}

export function AddContentModal({ onAdd, onClose }: AddContentModalProps) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: { type: 'book', title: '', author: '', desc: '' },
  })

  function tryClose() {
    if (isDirty) setShowCloseConfirm(true)
    else onClose()
  }

  // FIX BUG-04: foca no primeiro campo inválido ao submeter
  function onError(fieldErrors: FieldErrors<ContentFormValues>) {
    const firstInvalid = (['title', 'type', 'author', 'desc'] as const).find(
      (k) => fieldErrors[k],
    )
    if (firstInvalid) setFocus(firstInvalid)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (isDirty) setShowCloseConfirm(true)
        else onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, isDirty])

  function onSubmit(data: ContentFormValues) {
    const content: Content = {
      id: uid(),
      title: data.title,
      type: data.type,
      author: data.author ?? '',
      desc: data.desc ?? '',
      color: TYPE_CONFIG[data.type]?.color ?? '#7c3aed',
      addedAt: new Date().toISOString(),
      progress: 0,
    }
    onAdd(content)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
        zIndex: 200, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px',
      }}
      onClick={() => tryClose()}
    >
      <div
        className="card slide-in"
        style={{ padding: '24px', width: '100%', maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>
            Novo Conteúdo
          </h2>
          <button
            onClick={tryClose}
            aria-label="Fechar modal"
            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}
          >
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FormField label="Título" htmlFor="title" required error={errors.title?.message}>
              <Input
                id="title"
                type="text"
                placeholder="Ex: Thinking, Fast and Slow"
                error={!!errors.title}
                aria-describedby={errors.title ? 'title-error' : undefined}
                {...register('title')}
              />
            </FormField>

            <FormField label="Tipo" htmlFor="type" required error={errors.type?.message}>
              <select
                id="type"
                className={`input${errors.type ? ' input--error' : ''}`}
                aria-invalid={!!errors.type}
                {...register('type')}
              >
                <option value="book">📚 Livro</option>
                <option value="course">🎓 Curso</option>
                <option value="video">🎥 Vídeo</option>
                <option value="article">📄 Artigo</option>
                <option value="note">📝 Anotação</option>
              </select>
            </FormField>

            <FormField label="Autor / Fonte" htmlFor="author" error={errors.author?.message}>
              <Input
                id="author"
                type="text"
                placeholder="Nome do autor ou fonte"
                error={!!errors.author}
                aria-describedby={errors.author ? 'author-error' : undefined}
                {...register('author')}
              />
            </FormField>

            {/* FIX BUG-03: aria-describedby aponta para o id do erro renderizado por FormField */}
            <FormField label="Descrição" htmlFor="desc" error={errors.desc?.message} hint="Opcional — resumo ou observações sobre o conteúdo">
              <Textarea
                id="desc"
                placeholder="Do que se trata este conteúdo?"
                error={!!errors.desc}
                aria-describedby={errors.desc ? 'desc-error' : 'desc-hint'}
                style={{ minHeight: '70px' }}
                {...register('desc')}
              />
            </FormField>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} type="button" onClick={tryClose}>
                Cancelar
              </button>
              <LoadingButton
                className="btn-primary"
                type="submit"
                loading={isSubmitting}
                loadingText="Adicionando..."
                style={{ flex: 1 }}
              >
                Adicionar
              </LoadingButton>
            </div>
          </div>
        </form>

        <ConfirmDialog
          open={showCloseConfirm}
          title="Descartar alterações?"
          description="Você tem dados não salvos. Deseja fechar e descartar tudo?"
          confirmLabel="Descartar"
          cancelLabel="Continuar editando"
          variant="warning"
          onConfirm={onClose}
          onCancel={() => setShowCloseConfirm(false)}
        />
      </div>
    </div>
  )
}
