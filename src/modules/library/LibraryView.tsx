'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DndContext, useDroppable, useDraggable, type DragEndEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useAppData } from '@/hooks/useAppData'
import { useTrailCollapse } from '@/hooks/useTrailCollapse'
import { calcRetention } from '@/engine/retention/retentionModel'
import type { Content, ContentType, FlashCard } from '@/types'
import { Plus } from '@/components/icons'
import { ContentDrawer } from '@/components/ui/ContentDrawer'
import { AddContentModal } from './AddContentModal'
import { EditContentModal } from './EditContentModal'
import { GenerateFlashcardsModal } from './GenerateFlashcardsModal'
import { TrailFormModal } from './TrailFormModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FormField } from '@/components/ui/FormField'
import { Textarea } from '@/components/ui/Textarea'
import { LoadingButton } from '@/components/ui/LoadingButton'
import type { LearningTrail } from '@/types'
import type { ContentFormValues } from '@/lib/validation/schemas'

const TYPE_CONFIG: Record<ContentType, { icon: string; color: string }> = {
  book: { icon: '📚', color: '#7c3aed' },
  course: { icon: '🎓', color: '#06b6d4' },
  video: { icon: '🎥', color: '#ef4444' },
  article: { icon: '📄', color: '#f59e0b' },
  note: { icon: '📝', color: '#10b981' },
}

const cardSchema = z.object({
  front: z
    .string()
    .trim()
    .min(1, 'A pergunta não pode estar vazia.')
    .max(500, 'Máximo de 500 caracteres.'),
  back: z
    .string()
    .trim()
    .min(1, 'A resposta não pode estar vazia.')
    .max(1000, 'Máximo de 1000 caracteres.'),
})
type CardFormValues = z.infer<typeof cardSchema>

const PAGE_SIZE = 6

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function LibraryView() {
  const { state, dispatch, loading } = useAppData()
  const router = useRouter()
  const { collapsed, toggle: toggleCollapse, remove: removeCollapse } = useTrailCollapse()

  const [search, setSearch] = useState('')
  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    if (!search.trim()) return state.contents
    const term = normalize(search)
    return state.contents.filter(
      (c) =>
        normalize(c.title).includes(term) ||
        normalize(c.author).includes(term) ||
        normalize(c.desc).includes(term)
    )
  }, [state.contents, search])

  const [trailModal, setTrailModal] = useState<null | 'create' | LearningTrail>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editContent, setEditContent] = useState<Content | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Content | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ContentDrawer — substitui o expand inline
  const [drawerContent, setDrawerContent] = useState<Content | null>(null)

  const [editCard, setEditCard] = useState<FlashCard | null>(null)
  const [confirmDeleteCard, setConfirmDeleteCard] = useState<FlashCard | null>(null)
  const [deletingCard, setDeletingCard] = useState(false)
  const [genContent, setGenContent] = useState<Content | null>(null)
  const [showAll, setShowAll] = useState<Record<string, boolean>>({})

  function handleAdd(content: Content) {
    dispatch({ type: 'ADD_CONTENT', payload: content })
    setShowAdd(false)
  }

  function handleSaveTrail(trail: LearningTrail) {
    if (trailModal === 'create') {
      dispatch({ type: 'ADD_TRAIL', payload: trail })
    } else {
      dispatch({ type: 'UPDATE_TRAIL', payload: trail })
    }
    setTrailModal(null)
  }

  function handleDeleteTrail(id: string) {
    dispatch({ type: 'DELETE_TRAIL', payload: id })
    removeCollapse(id)
    setTrailModal(null)
  }

  function handleSaveContent(
    updates: Partial<Pick<Content, 'title' | 'type' | 'author' | 'desc'>>
  ) {
    if (!editContent) return
    const color = updates.type ? TYPE_CONFIG[updates.type].color : editContent.color
    dispatch({ type: 'UPDATE_CONTENT', payload: { id: editContent.id, ...updates, color } })
    setEditContent(null)
  }

  function handleDrawerEdit(id: string, updates: ContentFormValues) {
    const current = state.contents.find((c) => c.id === id)
    const color = updates.type
      ? TYPE_CONFIG[updates.type as ContentType].color
      : (current?.color ?? '#7c3aed')
    dispatch({ type: 'UPDATE_CONTENT', payload: { id, ...updates, color } })
    // Atualiza o drawerContent para refletir as mudanças imediatamente
    if (drawerContent?.id === id) {
      setDrawerContent((prev) => (prev ? { ...prev, ...updates, color } : null))
    }
  }

  async function handleDeleteContent() {
    if (!confirmDelete) return
    setDeleting(true)
    dispatch({ type: 'DELETE_CONTENT', payload: confirmDelete.id })
    setDeleting(false)
    setConfirmDelete(null)
  }

  async function handleDrawerDelete(contentId: string) {
    dispatch({ type: 'DELETE_CONTENT', payload: contentId })
    setDrawerContent(null)
  }

  async function handleDeleteCard() {
    if (!confirmDeleteCard) return
    setDeletingCard(true)
    dispatch({ type: 'DELETE_CARD', payload: confirmDeleteCard.id })
    setDeletingCard(false)
    setConfirmDeleteCard(null)
  }

  // DnD: move conteúdo para outra trilha (optimistic update)
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const contentId = (active.id as string).replace('content-', '')
    const rawTrailId = over.id as string
    const trailId = rawTrailId === 'trail-orphan' ? null : rawTrailId.replace('trail-', '')

    const content = state.contents.find((c) => c.id === contentId)
    if (!content || content.trailId === trailId) return

    dispatch({ type: 'ASSIGN_CONTENT_TRAIL', payload: { contentId, trailId } })
  }

  const trailGroups = useMemo(
    () =>
      (state.trails ?? []).map((trail) => ({
        trail,
        contents: filtered.filter((c) => c.trailId === trail.id),
      })),
    [state.trails, filtered]
  )

  const orphanContents = useMemo(() => filtered.filter((c) => !c.trailId), [filtered])

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
        {[48, 200, 200, 200].map((h, i) => (
          <div
            key={i}
            style={{
              height: `${h}px`,
              background: 'var(--bg2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-5)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
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
              {search.trim()
                ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} de ${state.contents.length} itens`
                : `${state.contents.length} ${state.contents.length === 1 ? 'item' : 'itens'}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="search"
              aria-label="Buscar conteúdo"
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => {
                const v = e.target.value
                startTransition(() => setSearch(v))
              }}
              data-testid="library-search"
              style={{
                background: 'var(--card2)',
                border: '1px solid var(--border2)',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '13px',
                color: 'var(--text)',
                outline: 'none',
                width: '200px',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            <button
              data-testid="btn-new-trail"
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              onClick={() => setTrailModal('create')}
            >
              + Trilha
            </button>
            <button
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              onClick={() => setShowAdd(true)}
            >
              <Plus />
              Adicionar
            </button>
          </div>
        </div>

        {trailModal !== null && (
          <TrailFormModal
            trail={trailModal === 'create' ? undefined : trailModal}
            onSave={handleSaveTrail}
            onDelete={trailModal !== 'create' ? handleDeleteTrail : undefined}
            onClose={() => setTrailModal(null)}
          />
        )}

        {showAdd && <AddContentModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}

        {genContent && (
          <GenerateFlashcardsModal
            content={genContent}
            onAdd={(cards) => dispatch({ type: 'ADD_CARDS', payload: cards })}
            onClose={() => setGenContent(null)}
          />
        )}

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

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
            {search.trim() ? (
              <>
                <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
                  Nenhum conteúdo encontrado para &ldquo;{search}&rdquo;
                </p>
                <p style={{ fontSize: '12px' }}>Tente outro termo ou limpe a busca</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
                  Biblioteca vazia
                </p>
                <p style={{ fontSize: '12px' }}>Adicione seu primeiro livro ou curso</p>
              </>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {trailGroups.map(({ trail, contents: trailContents }) => {
            if (trailContents.length === 0 && search.trim()) return null

            const isCollapsed = collapsed.has(trail.id)
            const isExpanded = showAll[trail.id] ?? false
            const paginate = !search.trim() && trailContents.length > PAGE_SIZE
            const visibleContents =
              paginate && !isExpanded ? trailContents.slice(0, PAGE_SIZE) : trailContents
            const hiddenCount = trailContents.length - PAGE_SIZE

            return (
              <DroppableTrailSection key={trail.id} droppableId={`trail-${trail.id}`}>
                <section data-testid="trail-section" data-trail-id={trail.id}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '14px',
                    }}
                  >
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        background: trail.color + '22',
                        border: `1px solid ${trail.color}44`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                      }}
                    >
                      {trail.iconEmoji}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, color: trail.color, fontSize: '15px' }}>
                        {trail.title}
                      </span>
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: '11px',
                          background: trail.color + '18',
                          color: trail.color,
                          border: `1px solid ${trail.color}33`,
                          borderRadius: '20px',
                          padding: '1px 8px',
                        }}
                      >
                        {trailContents.length} conteúdo{trailContents.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <button
                      data-testid={`btn-collapse-trail-${trail.id}`}
                      aria-label={
                        isCollapsed
                          ? `Expandir trilha ${trail.title}`
                          : `Colapsar trilha ${trail.title}`
                      }
                      onClick={() => toggleCollapse(trail.id)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border2)',
                        borderRadius: '6px',
                        color: 'var(--text3)',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontSize: '11px',
                        transition: 'transform 0.2s',
                      }}
                    >
                      {isCollapsed ? '▶' : '▼'}
                    </button>
                    <button
                      data-testid="btn-edit-trail"
                      aria-label={`Editar trilha ${trail.title}`}
                      onClick={() => setTrailModal(trail)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border2)',
                        borderRadius: '6px',
                        color: 'var(--text3)',
                        cursor: 'pointer',
                        padding: '4px 10px',
                        fontSize: '12px',
                      }}
                    >
                      ⋯
                    </button>
                  </div>

                  {!isCollapsed && (
                    <>
                      <ContentGrid
                        contents={visibleContents}
                        cards={state.cards}
                        onCardClick={setDrawerContent}
                        onEdit={setEditContent}
                        onDelete={setConfirmDelete}
                        onGenerate={setGenContent}
                        onEditCard={setEditCard}
                        onDeleteCard={setConfirmDeleteCard}
                        router={router}
                      />

                      {paginate && (
                        <div style={{ textAlign: 'center', marginTop: '12px' }}>
                          {isExpanded ? (
                            <button
                              type="button"
                              data-testid={`btn-show-less-${trail.id}`}
                              className="btn-secondary"
                              style={{ fontSize: '12px' }}
                              onClick={() => setShowAll((prev) => ({ ...prev, [trail.id]: false }))}
                            >
                              Menos ↑
                            </button>
                          ) : (
                            <button
                              type="button"
                              data-testid={`btn-show-more-${trail.id}`}
                              className="btn-secondary"
                              style={{ fontSize: '12px' }}
                              onClick={() => setShowAll((prev) => ({ ...prev, [trail.id]: true }))}
                            >
                              Ver mais {hiddenCount} conteúdo{hiddenCount !== 1 ? 's' : ''}
                            </button>
                          )}
                        </div>
                      )}

                      {trailContents.length === 0 && !search.trim() && (
                        <p style={{ fontSize: '12px', color: 'var(--text3)', padding: '16px 0' }}>
                          Nenhum conteúdo nesta trilha. Adicione um conteúdo e atribua a esta
                          trilha.
                        </p>
                      )}
                    </>
                  )}
                </section>
              </DroppableTrailSection>
            )
          })}

          {orphanContents.length > 0 &&
            (() => {
              const isOrphanExpanded = showAll['orphan'] ?? false
              const orphanPaginate = !search.trim() && orphanContents.length > PAGE_SIZE
              const visibleOrphans =
                orphanPaginate && !isOrphanExpanded
                  ? orphanContents.slice(0, PAGE_SIZE)
                  : orphanContents
              const orphanHidden = orphanContents.length - PAGE_SIZE
              return (
                <DroppableTrailSection droppableId="trail-orphan">
                  <section data-testid="trail-section-orphan">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '14px',
                      }}
                    >
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '8px',
                          background: 'var(--card2)',
                          border: '1px solid var(--border2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                        }}
                      >
                        📎
                      </span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text2)', fontSize: '15px' }}>
                          Sem Trilha
                        </span>
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: '11px',
                            background: 'var(--card2)',
                            color: 'var(--text3)',
                            border: '1px solid var(--border2)',
                            borderRadius: '20px',
                            padding: '1px 8px',
                          }}
                        >
                          {orphanContents.length} conteúdo{orphanContents.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <ContentGrid
                      contents={visibleOrphans}
                      cards={state.cards}
                      onCardClick={setDrawerContent}
                      onEdit={setEditContent}
                      onDelete={setConfirmDelete}
                      onGenerate={setGenContent}
                      onEditCard={setEditCard}
                      onDeleteCard={setConfirmDeleteCard}
                      router={router}
                    />
                    {orphanPaginate && (
                      <div style={{ textAlign: 'center', marginTop: '12px' }}>
                        {isOrphanExpanded ? (
                          <button
                            type="button"
                            data-testid="btn-show-less-orphan"
                            className="btn-secondary"
                            style={{ fontSize: '12px' }}
                            onClick={() => setShowAll((prev) => ({ ...prev, orphan: false }))}
                          >
                            Menos ↑
                          </button>
                        ) : (
                          <button
                            type="button"
                            data-testid="btn-show-more-orphan"
                            className="btn-secondary"
                            style={{ fontSize: '12px' }}
                            onClick={() => setShowAll((prev) => ({ ...prev, orphan: true }))}
                          >
                            Ver mais {orphanHidden} conteúdo{orphanHidden !== 1 ? 's' : ''}
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                </DroppableTrailSection>
              )
            })()}
        </div>
      </div>

      {/* ContentDrawer — renderizado fora do scroll para animação correta */}
      <ContentDrawer
        content={drawerContent}
        cards={state.cards}
        sessions={state.sessions}
        trails={state.trails ?? []}
        onClose={() => setDrawerContent(null)}
        onEdit={handleDrawerEdit}
        onDelete={handleDrawerDelete}
        onEditCard={setEditCard}
        onDeleteCard={setConfirmDeleteCard}
        onGenerateFlashcards={setGenContent}
      />
    </DndContext>
  )
}

// ── DroppableTrailSection ────────────────────────────────────────────────────

function DroppableTrailSection({
  droppableId,
  children,
}: {
  droppableId: string
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId })
  return (
    <div
      ref={setNodeRef}
      style={{
        borderRadius: '12px',
        outline: isOver ? '2px dashed #7c3aed' : '2px solid transparent',
        transition: 'outline-color 0.15s',
        padding: '2px',
      }}
    >
      {children}
    </div>
  )
}

// ── ContentGrid ──────────────────────────────────────────────────────────────

interface ContentGridProps {
  contents: Content[]
  cards: FlashCard[]
  onCardClick: (c: Content) => void
  onEdit: (c: Content) => void
  onDelete: (c: Content) => void
  onGenerate: (c: Content) => void
  onEditCard: (c: FlashCard) => void
  onDeleteCard: (c: FlashCard) => void
  router: ReturnType<typeof useRouter>
}

function ContentGrid({
  contents,
  cards,
  onCardClick,
  onEdit,
  onDelete,
  onGenerate,
  onEditCard,
  onDeleteCard,
  router,
}: ContentGridProps) {
  if (contents.length === 0) return null
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))',
        gap: '16px',
      }}
    >
      {contents.map((c) => (
        <DraggableCard
          key={c.id}
          content={c}
          cards={cards.filter((k) => k.cid === c.id)}
          onCardClick={onCardClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onGenerate={onGenerate}
          onEditCard={onEditCard}
          onDeleteCard={onDeleteCard}
          router={router}
        />
      ))}
    </div>
  )
}

// ── DraggableCard ────────────────────────────────────────────────────────────

interface DraggableCardProps {
  content: Content
  cards: FlashCard[]
  onCardClick: (c: Content) => void
  onEdit: (c: Content) => void
  onDelete: (c: Content) => void
  onGenerate: (c: Content) => void
  onEditCard: (c: FlashCard) => void
  onDeleteCard: (c: FlashCard) => void
  router: ReturnType<typeof useRouter>
}

function DraggableCard({
  content: c,
  cards: cardList,
  onCardClick,
  onEdit,
  onDelete,
  onGenerate,
  router,
}: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `content-${c.id}`,
  })

  const avgR = cardList.length
    ? Math.round(cardList.reduce((a, k) => a + calcRetention(k), 0) / cardList.length)
    : 0
  const t = TYPE_CONFIG[c.type] ?? TYPE_CONFIG.book

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      data-testid="content-card"
      data-content-id={c.id}
      className="card content-card"
      style={{
        padding: '20px',
        cursor: isDragging ? 'grabbing' : 'pointer',
        opacity: isDragging ? 0.6 : 1,
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? undefined : 'transform 0.15s, opacity 0.15s',
      }}
      onClick={() => !isDragging && onCardClick(c)}
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
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}
        >
          {c.progress === 100 && (
            <span className="badge" style={{ background: 'rgba(16,185,129,.2)', color: '#10b981' }}>
              ✓ Concluído
            </span>
          )}
          {cardList.length > 0 && (
            <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{avgR}% ret.</span>
          )}
        </div>
      </div>

      <h3
        style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', marginBottom: '3px' }}
      >
        {c.title}
      </h3>
      {c.author && (
        <p
          style={{
            fontSize: '11px',
            color: 'var(--text3)',
            marginBottom: '8px',
            wordBreak: 'break-all',
            overflowWrap: 'anywhere',
          }}
        >
          {c.author}
        </p>
      )}
      {c.desc && (
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text4)',
            marginBottom: '12px',
            lineHeight: '1.5',
            wordBreak: 'break-all',
            overflowWrap: 'anywhere',
          }}
        >
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

      {/* Ações — clique propagado no card inicia o drawer; botões têm stopPropagation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px' }} {...listeners}>
          <button
            data-testid="btn-edit-content"
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '5px 8px' }}
            onClick={(e) => {
              e.stopPropagation()
              onEdit(c)
            }}
            title="Editar conteúdo"
          >
            ✎
          </button>
          <button
            data-testid="btn-delete-content"
            className="btn-secondary"
            style={{
              fontSize: '11px',
              padding: '5px 8px',
              color: 'var(--color-danger)',
              borderColor: 'rgba(239,68,68,.3)',
            }}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(c)
            }}
            title="Remover conteúdo"
          >
            ✕
          </button>
          <button
            data-testid="btn-generate-ai"
            className="btn-secondary"
            style={{
              fontSize: '11px',
              padding: '5px 8px',
              color: '#7c3aed',
              borderColor: 'rgba(124,58,237,.3)',
            }}
            onClick={(e) => {
              e.stopPropagation()
              onGenerate(c)
            }}
            title="Gerar flashcards com IA"
          >
            ✦ IA
          </button>
          {cardList.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text3)',
                padding: '5px 8px',
                alignSelf: 'center',
              }}
            >
              {cardList.length} cards
            </span>
          )}
        </div>
        <button
          className="btn-primary"
          style={{ fontSize: '12px', padding: '6px 12px' }}
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/focus/${c.id}`)
          }}
        >
          Estudar →
        </button>
      </div>
    </div>
  )
}

// ── CardEditModal ─────────────────────────────────────────────────────────────

function CardEditModal({
  card,
  onSave,
  onClose,
}: {
  card: FlashCard
  onSave: (front: string, back: string) => void
  onClose: () => void
}) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: { front: card.front, back: card.back },
  })

  function tryClose() {
    if (isDirty) setShowCloseConfirm(true)
    else onClose()
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.6)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={() => tryClose()}
    >
      <div
        data-testid="card-edit-modal"
        className="card slide-in"
        style={{ padding: '24px', width: '100%', maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>
            Editar Flashcard
          </h2>
          <button
            onClick={tryClose}
            aria-label="Fechar modal"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text3)',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => onSave(d.front, d.back))} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FormField
              label="Pergunta (frente)"
              htmlFor="card-front"
              required
              error={errors.front?.message}
            >
              <Textarea
                id="card-front"
                placeholder="Pergunta ou conceito"
                error={!!errors.front}
                style={{ minHeight: '80px' }}
                {...register('front')}
              />
            </FormField>

            <FormField
              label="Resposta (verso)"
              htmlFor="card-back"
              required
              error={errors.back?.message}
            >
              <Textarea
                id="card-back"
                placeholder="Resposta ou explicação"
                error={!!errors.back}
                style={{ minHeight: '80px' }}
                {...register('back')}
              />
            </FormField>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                className="btn-secondary"
                style={{ flex: 1 }}
                type="button"
                onClick={tryClose}
              >
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

        <ConfirmDialog
          open={showCloseConfirm}
          title="Descartar alterações?"
          description="Você tem alterações não salvas. Deseja fechar e descartar tudo?"
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
