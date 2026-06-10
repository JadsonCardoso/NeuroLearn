'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Content, ContentType, FlashCard, StudySession, LearningTrail } from '@/types'
import { calcRetention } from '@/engine/retention/retentionModel'
import { contentSchema, type ContentFormValues } from '@/lib/validation/schemas'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { LoadingButton } from '@/components/ui/LoadingButton'

const TYPE_LABELS: Record<ContentType, string> = {
  book: '📚 Livro',
  course: '🎓 Curso',
  video: '🎥 Vídeo',
  article: '📄 Artigo',
  note: '📝 Nota',
}

const TYPE_CONFIG: Record<ContentType, { icon: string; color: string }> = {
  book: { icon: '📚', color: '#7c3aed' },
  course: { icon: '🎓', color: '#06b6d4' },
  video: { icon: '🎥', color: '#ef4444' },
  article: { icon: '📄', color: '#f59e0b' },
  note: { icon: '📝', color: '#10b981' },
}

interface ContentDrawerProps {
  content: Content | null
  cards: FlashCard[]
  sessions: StudySession[]
  trails: LearningTrail[]
  onClose: () => void
  onEdit: (id: string, updates: ContentFormValues) => void
  onDelete: (contentId: string) => Promise<void>
  onEditCard: (card: FlashCard) => void
  onDeleteCard: (card: FlashCard) => void
  onGenerateFlashcards: (content: Content) => void
}

type DrawerTab = 'cards' | 'sessions'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`
}

export function ContentDrawer({
  content,
  cards,
  sessions,
  trails,
  onClose,
  onEdit,
  onDelete,
  onEditCard,
  onDeleteCard,
  onGenerateFlashcards,
}: ContentDrawerProps) {
  const router = useRouter()
  const [tab, setTab] = useState<DrawerTab>('cards')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const contentCards = content ? cards.filter((c) => c.cid === content.id) : []
  const allContentSessions = content
    ? sessions
        .filter((s) => s.cid === content.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : []
  const contentSessions = allContentSessions.slice(0, 5)
  const totalSessions = allContentSessions.length

  const avgRetention =
    contentCards.length > 0
      ? Math.round(contentCards.reduce((a, c) => a + calcRetention(c), 0) / contentCards.length)
      : 0

  const trailName = content?.trailId ? trails.find((t) => t.id === content.trailId)?.title : null

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: content
      ? { title: content.title, type: content.type, author: content.author, desc: content.desc }
      : undefined,
  })

  // Sincroniza form quando content muda
  useEffect(() => {
    if (content) {
      reset({
        title: content.title,
        type: content.type,
        author: content.author,
        desc: content.desc,
      })
      setEditing(false)
      setTab('cards')
    }
  }, [content, reset])

  // ESC: fecha ConfirmDialog primeiro; só depois fecha o drawer
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (confirmDelete) {
          setConfirmDelete(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, confirmDelete])

  async function onSubmit(values: ContentFormValues) {
    if (!content) return
    setSaving(true)
    onEdit(content.id, values)
    setSaving(false)
    setEditing(false)
  }

  async function handleDelete() {
    if (!content) return
    setDeleting(true)
    await onDelete(content.id)
    setDeleting(false)
    setConfirmDelete(false)
    onClose()
  }

  if (!content) return null

  const isOpen = !!content

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        data-testid="drawer-overlay"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer */}
      <div
        data-testid="content-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={content.title}
        className={`fixed right-0 top-0 z-50 h-full w-[480px] max-w-[95vw] flex flex-col bg-[var(--bg)] border-l border-[var(--border)] shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[var(--border)] shrink-0">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{TYPE_CONFIG[content.type]?.icon ?? '📄'}</span>
              <span className="text-xs text-[var(--muted)] bg-[var(--card)] border border-[var(--border)] rounded-full px-2 py-0.5">
                {TYPE_LABELS[content.type]}
              </span>
              {trailName && (
                <span className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5 truncate max-w-[120px]">
                  {trailName}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-[var(--foreground)] leading-tight line-clamp-2">
              {content.title}
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{content.author}</p>
          </div>
          <button
            type="button"
            data-testid="drawer-close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition-colors shrink-0"
            aria-label="Fechar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3 px-5 py-4 border-b border-[var(--border)] shrink-0">
          <div className="text-center">
            <p className="text-xs text-[var(--muted)] mb-1">Progresso</p>
            <p className="text-lg font-bold text-[var(--foreground)]">{content.progress}%</p>
            <div className="mt-1 h-1 rounded-full bg-[var(--border)] overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-500"
                style={{ width: `${content.progress}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-[var(--muted)] mb-1">Retenção</p>
            <p className="text-lg font-bold text-[var(--foreground)]">{avgRetention}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[var(--muted)] mb-1">Flashcards</p>
            <p className="text-lg font-bold text-[var(--foreground)]">{contentCards.length}</p>
          </div>
        </div>

        {/* CTAs rápidos */}
        {!editing && (
          <div className="flex gap-2 px-5 py-3 border-b border-[var(--border)] shrink-0">
            <button
              type="button"
              onClick={() => router.push(`/focus/${content.id}`)}
              className="flex-1 text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2 transition-colors"
            >
              ▶ Iniciar Sessão
            </button>
            <button
              type="button"
              onClick={() => onGenerateFlashcards(content)}
              className="flex-1 text-xs font-medium border border-[var(--border)] text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--bg2)] rounded-lg py-2 transition-colors"
            >
              ✨ Gerar Cards
            </button>
          </div>
        )}

        {/* Tabs */}
        {!editing && (
          <div className="flex border-b border-[var(--border)] shrink-0">
            <button
              type="button"
              data-testid="drawer-tab-cards"
              onClick={() => setTab('cards')}
              className={`flex-1 text-xs font-medium py-2.5 transition-colors ${tab === 'cards' ? 'text-violet-400 border-b-2 border-violet-500' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              Flashcards ({contentCards.length})
            </button>
            <button
              type="button"
              data-testid="drawer-tab-sessions"
              onClick={() => setTab('sessions')}
              className={`flex-1 text-xs font-medium py-2.5 transition-colors ${tab === 'sessions' ? 'text-violet-400 border-b-2 border-violet-500' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              Sessões ({contentSessions.length})
            </button>
          </div>
        )}

        {/* Corpo scrollável */}
        <div className="flex-1 overflow-y-auto">
          {/* Modo edição */}
          {editing && (
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4" noValidate>
              <FormField
                htmlFor="drawer-title"
                label="Título"
                error={errors.title?.message}
                required
              >
                <Input
                  id="drawer-title"
                  {...register('title')}
                  placeholder="Título do conteúdo"
                  data-testid="drawer-input-title"
                />
              </FormField>
              <FormField htmlFor="drawer-type" label="Tipo" error={errors.type?.message} required>
                <select
                  id="drawer-type"
                  {...register('type')}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg2)] text-[var(--foreground)] px-3 py-2 text-sm"
                >
                  {(Object.keys(TYPE_LABELS) as ContentType[]).map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField
                htmlFor="drawer-author"
                label="Autor"
                error={errors.author?.message}
                required
              >
                <Input id="drawer-author" {...register('author')} placeholder="Autor" />
              </FormField>
              <FormField htmlFor="drawer-desc" label="Descrição" error={errors.desc?.message}>
                <Textarea
                  id="drawer-desc"
                  {...register('desc')}
                  placeholder="Descrição..."
                  rows={3}
                />
              </FormField>
              <div className="flex gap-2 pt-2">
                <LoadingButton
                  type="submit"
                  loading={saving}
                  data-testid="drawer-save-btn"
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  Salvar
                </LoadingButton>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    reset({
                      title: content.title,
                      type: content.type,
                      author: content.author,
                      desc: content.desc,
                    })
                  }}
                  className="flex-1 border border-[var(--border)] text-[var(--foreground)] text-sm font-medium py-2 rounded-lg hover:bg-[var(--bg2)] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Tab Flashcards */}
          {!editing && tab === 'cards' && (
            <div className="p-5 space-y-2">
              {contentCards.length === 0 && (
                <p className="text-center text-sm text-[var(--muted)] py-8">
                  Nenhum flashcard ainda. Use &ldquo;Gerar Cards&rdquo; para criar com IA.
                </p>
              )}
              {contentCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3"
                >
                  <p className="text-xs font-medium text-[var(--foreground)] line-clamp-2 mb-1">
                    {card.front}
                  </p>
                  <p className="text-xs text-[var(--muted)] line-clamp-1">{card.back}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        card.mastery === 'strong'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : card.mastery === 'review'
                            ? 'bg-blue-500/20 text-blue-400'
                            : card.mastery === 'learning'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-[var(--border)] text-[var(--muted)]'
                      }`}
                    >
                      {card.mastery === 'strong'
                        ? 'Dominado'
                        : card.mastery === 'review'
                          ? 'Revisão'
                          : card.mastery === 'learning'
                            ? 'Aprendendo'
                            : 'Novo'}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEditCard(card)}
                        className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                        aria-label="Editar card"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCard(card)}
                        className="p-1 rounded text-[var(--muted)] hover:text-red-400 transition-colors"
                        aria-label="Remover card"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Sessões */}
          {!editing && tab === 'sessions' && (
            <div className="p-5 space-y-2">
              {contentSessions.length === 0 && (
                <p className="text-center text-sm text-[var(--muted)] py-8">
                  Nenhuma sessão registrada. Inicie uma Sessão de Foco para começar.
                </p>
              )}
              {totalSessions > 5 && (
                <p className="text-center text-xs text-[var(--muted)] pb-1">
                  Exibindo 5 de {totalSessions} sessões
                </p>
              )}
              {contentSessions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[var(--foreground)]">
                      {formatDate(s.date)}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {formatDuration(s.duration)}
                    </span>
                  </div>
                  {s.notes && (
                    <p className="text-xs text-[var(--muted)] line-clamp-2 mt-1">{s.notes}</p>
                  )}
                  {s.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.highlights.slice(0, 3).map((h, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-1.5 py-0.5 line-clamp-1 max-w-[140px]"
                        >
                          {h}
                        </span>
                      ))}
                      {s.highlights.length > 3 && (
                        <span className="text-[10px] text-[var(--muted)]">
                          +{s.highlights.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer com ações */}
        {!editing && (
          <div className="flex gap-2 p-5 border-t border-[var(--border)] shrink-0">
            <button
              type="button"
              data-testid="drawer-edit-btn"
              onClick={() => setEditing(true)}
              className="flex-1 text-sm font-medium border border-[var(--border)] text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--bg2)] rounded-lg py-2 transition-colors"
            >
              ✏️ Editar
            </button>
            <button
              type="button"
              data-testid="drawer-delete-btn"
              onClick={() => setConfirmDelete(true)}
              className="flex-1 text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg py-2 transition-colors"
            >
              🗑️ Remover
            </button>
          </div>
        )}
      </div>

      {/* Confirm de remoção */}
      <ConfirmDialog
        open={confirmDelete}
        title="Remover conteúdo?"
        description={`"${content.title}" e todos os seus ${contentCards.length} flashcard${contentCards.length !== 1 ? 's' : ''} serão permanentemente removidos. Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}
