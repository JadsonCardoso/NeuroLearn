'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppData } from '@/hooks/useAppData'
import { calcRetention } from '@/engine/retention'
import type { Content, ContentType, FlashCard } from '@/types'
import { Plus } from '@/components/icons'
import { AddContentModal } from './AddContentModal'
import { EditContentModal } from './EditContentModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FormField } from '@/components/ui/FormField'
import { Textarea } from '@/components/ui/Textarea'
import { LoadingButton } from '@/components/ui/LoadingButton'

const TYPE_CONFIG: Record<ContentType, { icon: string; color: string }> = {
  book:    { icon: '📚', color: '#7c3aed' },
  course:  { icon: '🎓', color: '#06b6d4' },
  video:   { icon: '🎥', color: '#ef4444' },
  article: { icon: '📄', color: '#f59e0b' },
  note:    { icon: '📝', color: '#10b981' },
}

// Schema de validação do formulário de edição de flashcard
const cardSchema = z.object({
  front: z.string().trim().min(1, 'A pergunta não pode estar vazia.').max(500, 'Máximo de 500 caracteres.'),
  back:  z.string().trim().min(1, 'A resposta não pode estar vazia.').max(1000, 'Máximo de 1000 caracteres.'),
})
type CardFormValues = z.infer<typeof cardSchema>

export function LibraryView() {
  const { state, dispatch } = useAppData()
  const router = useRouter()

  // Estado de modais e confirmações
  const [showAdd, setShowAdd] = useState(false)
  const [editContent, setEditContent] = useState<Content | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Content | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Estado para expandir lista de flashcards de um conteúdo
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Estado para editar/deletar flashcard individual
  const [editCard, setEditCard] = useState<FlashCard | null>(null)
  const [confirmDeleteCard, setConfirmDeleteCard] = useState<FlashCard | null>(null)
  const [deletingCard, setDeletingCard] = useState(false)

  function handleAdd(content: Content) {
    dispatch({ type: 'ADD_CONTENT', payload: content })
    setShowAdd(false)
  }

  function handleSaveContent(updates: Partial<Pick<Content, 'title' | 'type' | 'author' | 'desc'>>) {
    if (!editContent) return
    // Deriva nova cor se o tipo foi alterado
    const color = updates.type ? TYPE_CONFIG[updates.type].color : editContent.color
    dispatch({ type: 'UPDATE_CONTENT', payload: { id: editContent.id, ...updates, color } })
    setEditContent(null)
  }

  async function handleDeleteContent() {
    if (!confirmDelete) return
    setDeleting(true)
    dispatch({ type: 'DELETE_CONTENT', payload: confirmDelete.id })
    setDeleting(false)
    setConfirmDelete(null)
  }

  async function handleDeleteCard() {
    if (!confirmDeleteCard) return
    setDeletingCard(true)
    dispatch({ type: 'DELETE_CARD', payload: confirmDeleteCard.id })
    setDeletingCard(false)
    setConfirmDeleteCard(null)
  }

  return (
    <div className="slide-in" style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>
            Biblioteca de Conhecimento
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>
            {state.contents.length} itens
          </p>
        </div>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setShowAdd(true)}
        >
          <Plus />
          Adicionar
        </button>
      </div>

      {showAdd && <AddContentModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}

      {editContent && (
        <EditContentModal
          content={editContent}
          onSave={handleSaveContent}
          onClose={() => setEditContent(null)}
        />
      )}

      {editCard && (
        <CardEditModal
          card={editCard}
          onSave={(front, back) => {
            dispatch({ type: 'UPDATE_CARD', payload: { id: editCard.id, front, back } })
            setEditCard(null)
          }}
          onClose={() => setEditCard(null)}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Remover conteúdo"
        description={`Remover "${confirmDelete?.title}"? Os flashcards associados também serão removidos. Essa ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteContent}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={!!confirmDeleteCard}
        title="Remover flashcard"
        description="Remover este flashcard? Essa ação não pode ser desfeita."
        confirmLabel="Remover"
        variant="danger"
        loading={deletingCard}
        onConfirm={handleDeleteCard}
        onCancel={() => setConfirmDeleteCard(null)}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))',
          gap: '16px',
        }}
      >
        {state.contents.map((c) => {
          const cards = state.cards.filter((k) => k.cid === c.id)
          const avgR = cards.length
            ? Math.round(cards.reduce((a, k) => a + calcRetention(k), 0) / cards.length)
            : 0
          const t = TYPE_CONFIG[c.type] ?? TYPE_CONFIG.book
          const isExpanded = expandedId === c.id

          return (
            <div
              key={c.id}
              data-testid="content-card"
              data-content-id={c.id}
              className="card content-card"
              style={{ padding: '20px' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = c.color + '80')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    background: c.color + '20',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '20px',
                    lineHeight: 1,
                  }}
                >
                  {t.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  {c.progress === 100 && (
                    <span className="badge" style={{ background: 'rgba(16,185,129,.2)', color: '#10b981' }}>
                      ✓ Concluído
                    </span>
                  )}
                  {cards.length > 0 && (
                    <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{avgR}% ret.</span>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', marginBottom: '3px' }}>
                {c.title}
              </h3>
              {c.author && (
                <p style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '8px' }}>{c.author}</p>
              )}
              {c.desc && (
                <p style={{ fontSize: '12px', color: 'var(--text4)', marginBottom: '12px', lineHeight: '1.5' }}>
                  {c.desc}
                </p>
              )}

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text3)' }}>Progresso</span>
                  <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{c.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: c.progress + '%', background: c.color }} />
                </div>
              </div>

              {/* Ações principais do card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {/* Botão de editar conteúdo (T-08) */}
                  <button
                    data-testid="btn-edit-content"
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '5px 8px' }}
                    onClick={() => setEditContent(c)}
                    title="Editar conteúdo"
                  >
                    ✎
                  </button>
                  {/* Botão de remover conteúdo */}
                  <button
                    data-testid="btn-delete-content"
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '5px 8px', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,.3)' }}
                    onClick={() => setConfirmDelete(c)}
                    title="Remover conteúdo"
                  >
                    ✕
                  </button>
                  {/* Toggle expandir flashcards (T-07) */}
                  {cards.length > 0 && (
                    <button
                      data-testid="btn-expand-cards"
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '5px 8px' }}
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      title={isExpanded ? 'Ocultar flashcards' : 'Ver flashcards'}
                    >
                      {cards.length} cards {isExpanded ? '▴' : '▾'}
                    </button>
                  )}
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  onClick={() => router.push(`/focus/${c.id}`)}
                >
                  Estudar →
                </button>
              </div>

              {/* Lista expandida de flashcards (T-07) */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: '12px',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    maxHeight: '240px',
                    overflowY: 'auto',
                  }}
                >
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      style={{
                        background: 'var(--card2)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text)', marginBottom: '2px', wordBreak: 'break-word' }}>
                          {card.front.length > 80 ? card.front.slice(0, 80) + '…' : card.front}
                        </p>
                        <p style={{ fontSize: '10px', color: 'var(--text3)', wordBreak: 'break-word' }}>
                          {card.back.length > 80 ? card.back.slice(0, 80) + '…' : card.back}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button
                          data-testid="btn-edit-card"
                          title="Editar flashcard"
                          onClick={() => setEditCard(card)}
                          style={{
                            background: 'var(--card)',
                            border: '1px solid var(--border2)',
                            borderRadius: '6px',
                            color: 'var(--text3)',
                            cursor: 'pointer',
                            padding: '3px 6px',
                            fontSize: '11px',
                          }}
                        >
                          ✎
                        </button>
                        <button
                          data-testid="btn-delete-card"
                          title="Remover flashcard"
                          onClick={() => setConfirmDeleteCard(card)}
                          style={{
                            background: 'rgba(239,68,68,.06)',
                            border: '1px solid rgba(239,68,68,.25)',
                            borderRadius: '6px',
                            color: 'var(--color-danger)',
                            cursor: 'pointer',
                            padding: '3px 6px',
                            fontSize: '11px',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {state.contents.length === 0 && (
          <div
            style={{
              gridColumn: '1/-1',
              textAlign: 'center',
              padding: '60px',
              color: 'var(--text3)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
            <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
              Biblioteca vazia
            </p>
            <p style={{ fontSize: '12px' }}>Adicione seu primeiro livro ou curso</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Modal inline de edição de flashcard
function CardEditModal({
  card,
  onSave,
  onClose,
}: {
  card: FlashCard
  onSave: (front: string, back: string) => void
  onClose: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: { front: card.front, back: card.back },
  })

  // Fecha com ESC — consistente com os demais modais
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

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
        data-testid="card-edit-modal"
        className="card slide-in"
        style={{ padding: '24px', width: '100%', maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>Editar Flashcard</h2>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '18px' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => onSave(d.front, d.back))} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FormField label="Pergunta (frente)" htmlFor="card-front" required error={errors.front?.message}>
              <Textarea
                id="card-front"
                placeholder="Pergunta ou conceito"
                error={!!errors.front}
                style={{ minHeight: '80px' }}
                {...register('front')}
              />
            </FormField>

            <FormField label="Resposta (verso)" htmlFor="card-back" required error={errors.back?.message}>
              <Textarea
                id="card-back"
                placeholder="Resposta ou explicação"
                error={!!errors.back}
                style={{ minHeight: '80px' }}
                {...register('back')}
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
