'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from '@/components/icons'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { projectSchema, type ProjectFormValues } from '@/lib/validation/schemas'
import { createProject, deleteProject, updateProject } from '@/services/projectsService'
import { useAppData } from '@/hooks/useAppData'
import { useToast } from '@/hooks/useToast'
import type { Project } from '@/types'

interface ProjectFormModalProps {
  project?: Project | null
  onClose: () => void
  onSaved: (project: Project, isNew: boolean) => void
  onDeleted?: (projectId: string) => void
}

export function ProjectFormModal({ project, onClose, onSaved, onDeleted }: ProjectFormModalProps) {
  const { userId, dispatch } = useAppData()
  const { toast } = useToast()
  const isEdit = Boolean(project)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
    },
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function onSubmit(data: ProjectFormValues) {
    if (!userId) {
      toast.error('Sessão expirada. Recarregue a página para continuar.')
      return
    }

    try {
      if (isEdit && project) {
        await updateProject(project.id, userId, {
          name: data.name,
          description: data.description || null,
        })
        const updated: Project = {
          ...project,
          name: data.name,
          description: data.description || null,
          updatedAt: new Date().toISOString(),
        }
        dispatch({
          type: 'UPDATE_PROJECT',
          payload: {
            id: project.id,
            name: updated.name,
            description: updated.description,
            updatedAt: updated.updatedAt,
          },
        })
        toast.success('Projeto atualizado.')
        onSaved(updated, false)
      } else {
        const created = await createProject(userId, {
          name: data.name,
          description: data.description || null,
        })
        dispatch({ type: 'ADD_PROJECT', payload: created })
        toast.success('Projeto criado com sucesso.')
        onSaved(created, true)
      }
    } catch {
      toast.error('Não foi possível salvar o projeto. Tente novamente.')
    }
  }

  async function handleDelete() {
    if (!project || !userId) {
      toast.error('Sessão expirada. Recarregue a página para continuar.')
      return
    }
    setDeleting(true)
    try {
      await deleteProject(project.id, userId)
      dispatch({ type: 'DELETE_PROJECT', payload: project.id })
      toast.success('Projeto excluído.')
      onDeleted?.(project.id)
      onClose()
    } catch {
      toast.error('Não foi possível excluir o projeto.')
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
        aria-label={isEdit ? 'Editar projeto' : 'Novo projeto'}
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
          data-testid="project-form-modal"
          style={{
            position: 'relative',
            background: 'var(--card)',
            border: '1px solid var(--border2)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            width: '100%',
            maxWidth: '480px',
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
              {isEdit ? 'Editar Projeto' : 'Novo Projeto'}
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
            <FormField
              label="Nome do projeto"
              htmlFor="project-name"
              required
              error={errors.name?.message}
            >
              <Input
                id="project-name"
                data-testid="project-name"
                placeholder="ex: Engenharia de Produto 2026"
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
            </FormField>

            <FormField label="Descrição" htmlFor="project-desc" error={errors.description?.message}>
              <Textarea
                id="project-desc"
                data-testid="project-description"
                placeholder="Objetivo e contexto do projeto"
                rows={3}
                aria-invalid={Boolean(errors.description)}
                {...register('description')}
              />
            </FormField>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'var(--space-2)',
              }}
            >
              {isEdit && onDeleted ? (
                <button
                  type="button"
                  data-testid="project-delete-btn"
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
                  Excluir projeto
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
                  data-testid="project-save-btn"
                >
                  {isEdit ? 'Salvar alterações' : 'Criar projeto'}
                </LoadingButton>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Excluir projeto"
        description={`Tem certeza que deseja excluir "${project?.name}"? As trilhas associadas não serão excluídas, apenas desvinculadas.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}
