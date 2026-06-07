'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldErrors } from 'react-hook-form'
import type { Content, ContentType } from '@/types'
import { X } from '@/components/icons'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { contentSchema, type ContentFormValues } from '@/lib/validation/schemas'

interface EditContentModalProps {
  content: Content
  onSave: (updates: Partial<Pick<Content, 'title' | 'type' | 'author' | 'desc'>>) => void
  onClose: () => void
}

// Modal de edição de conteúdo — pré-populado com dados atuais
export function EditContentModal({ content, onSave, onClose }: EditContentModalProps) {
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: content.title,
      type: content.type as ContentType,
      author: content.author,
      desc: content.desc,
    },
  })

  function onError(fieldErrors: FieldErrors<ContentFormValues>) {
    const firstInvalid = (['title', 'type', 'author', 'desc'] as const).find((k) => fieldErrors[k])
    if (firstInvalid) setFocus(firstInvalid)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function onSubmit(data: ContentFormValues) {
    onSave({
      title: data.title,
      type: data.type,
      author: data.author ?? '',
      desc: data.desc ?? '',
    })
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
        zIndex: 200, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        data-testid="edit-content-modal"
        className="card slide-in"
        style={{ padding: '24px', width: '100%', maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>
            Editar Conteúdo
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}
          >
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FormField label="Título" htmlFor="edit-title" required error={errors.title?.message}>
              <Input
                id="edit-title"
                type="text"
                placeholder="Ex: Thinking, Fast and Slow"
                error={!!errors.title}
                {...register('title')}
              />
            </FormField>

            <FormField label="Tipo" htmlFor="edit-type" required error={errors.type?.message}>
              <select
                id="edit-type"
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

            <FormField label="Autor / Fonte" htmlFor="edit-author" error={errors.author?.message}>
              <Input
                id="edit-author"
                type="text"
                placeholder="Nome do autor ou fonte"
                error={!!errors.author}
                {...register('author')}
              />
            </FormField>

            <FormField label="Descrição" htmlFor="edit-desc" error={errors.desc?.message} hint="Opcional">
              <Textarea
                id="edit-desc"
                placeholder="Do que se trata este conteúdo?"
                error={!!errors.desc}
                style={{ minHeight: '70px' }}
                {...register('desc')}
              />
            </FormField>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} type="button" onClick={onClose}>
                Cancelar
              </button>
              <LoadingButton
                className="btn-primary"
                type="submit"
                loading={isSubmitting}
                loadingText="Salvando..."
                style={{ flex: 1 }}
              >
                Salvar
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
