'use client'

import { useState, useMemo } from 'react'
import { Pencil, Trash } from '@/components/icons'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAppData } from '@/hooks/useAppData'
import { SessionEditModal } from './SessionEditModal'
import { ExercisesSection } from './ExercisesSection'
import type { Content, StudySession } from '@/types'

// ── Tipos locais ──────────────────────────────────────────────────────────────

interface MemoryGroup {
  content: Content
  sessions: StudySession[]
  totalCards: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface MemoryViewProps {
  contentId?: string
  trailId?: string
}

// ── Componente principal ──────────────────────────────────────────────────────

export function MemoryView({ contentId, trailId }: MemoryViewProps = {}) {
  const { state, dispatch, userId } = useAppData()
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editingSession, setEditingSession] = useState<StudySession | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)

  function toggleSession(sessionId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })
  }

  function handleDeleteSession() {
    if (!deletingSessionId || !userId) return
    dispatch({ type: 'DELETE_SESSION', payload: deletingSessionId })
    setDeletingSessionId(null)
  }

  const allowedContentIds = useMemo<Set<string> | null>(() => {
    if (contentId) return new Set([contentId])
    if (trailId) {
      const ids = state.contents.filter((c) => c.trailId === trailId).map((c) => c.id)
      return new Set(ids)
    }
    return null
  }, [contentId, trailId, state.contents])

  const groups = useMemo<MemoryGroup[]>(() => {
    const map = new Map<string, StudySession[]>()

    for (const session of state.sessions) {
      if (allowedContentIds && !allowedContentIds.has(session.cid)) continue
      const list = map.get(session.cid) ?? []
      list.push(session)
      map.set(session.cid, list)
    }

    return state.contents
      .filter((content) => map.has(content.id))
      .map((content) => ({
        content,
        sessions: (map.get(content.id) ?? []).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        totalCards: state.cards.filter((c) => c.cid === content.id).length,
      }))
  }, [state.sessions, state.contents, state.cards, allowedContentIds])

  const filteredGroups = useMemo<MemoryGroup[]>(() => {
    if (!search.trim()) return groups
    const query = normalize(search.trim())
    return groups.filter((g) => normalize(g.content.title).includes(query))
  }, [groups, search])

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div data-testid="memory-view" style={{ padding: '24px', maxWidth: '860px', margin: '0 auto' }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 800,
            color: 'var(--text)',
            margin: '0 0 6px',
          }}
        >
          📔 Meu Material de Estudo
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text3)', margin: 0 }}>
          Anotações, highlights e reflexões de todas as suas sessões de estudo.
        </p>
      </div>

      {/* Campo de busca */}
      <div style={{ marginBottom: '24px' }}>
        <input
          data-testid="memory-search"
          type="text"
          placeholder="Buscar por conteúdo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--bg2)',
            color: 'var(--text)',
            fontSize: 'var(--text-sm)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Estado vazio: sem sessões */}
      {groups.length === 0 && (
        <div
          data-testid="memory-empty-state"
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text3)',
            fontSize: 'var(--text-sm)',
            background: 'var(--bg2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧠</div>
          <p style={{ margin: 0 }}>
            {contentId
              ? 'Nenhuma sessão registrada para este conteúdo ainda. Inicie uma Sessão de Foco para começar!'
              : trailId
                ? 'Nenhuma sessão registrada para esta trilha ainda. Inicie uma Sessão de Foco para começar!'
                : 'Nenhum conhecimento registrado ainda. Inicie uma Sessão de Foco para começar a construir sua memória cognitiva! 🧠'}
          </p>
        </div>
      )}

      {/* Estado vazio: busca sem resultado */}
      {groups.length > 0 && filteredGroups.length === 0 && (
        <div
          data-testid="memory-empty-search"
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text3)',
            fontSize: 'var(--text-sm)',
            background: 'var(--bg2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
          <p style={{ margin: 0 }}>Nenhum conteúdo encontrado para &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {/* Lista de grupos por conteúdo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredGroups.map((group) => (
          <div
            key={group.content.id}
            data-testid="memory-content-group"
            className="card"
            style={{
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg2)',
              overflow: 'hidden',
            }}
          >
            {/* Cabeçalho do conteúdo */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: group.content.color || 'var(--color-primary)',
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 'var(--text-base)',
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {group.content.title}
                </div>
                {group.content.author && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                    {group.content.author}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <span
                  className="badge"
                  style={{
                    background: 'rgba(124,58,237,.1)',
                    color: '#a78bfa',
                    borderRadius: '20px',
                    padding: '2px 9px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  {group.sessions.length} {group.sessions.length === 1 ? 'sessão' : 'sessões'}
                </span>
                <span
                  className="badge"
                  style={{
                    background: 'rgba(16,185,129,.1)',
                    color: '#34d399',
                    borderRadius: '20px',
                    padding: '2px 9px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  {group.totalCards} {group.totalCards === 1 ? 'card' : 'cards'}
                </span>
              </div>
            </div>

            {/* Sessões do conteúdo */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {group.sessions.map((session, idx) => {
                const isExpanded = expanded.has(session.id)
                const hasHighlights = session.highlights && session.highlights.length > 0
                const hasNotes = !!session.notes?.trim()
                const hasTeach = !!session.teach?.trim()
                const hasContent = hasHighlights || hasNotes || hasTeach

                return (
                  <div
                    key={session.id}
                    data-testid="memory-session-item"
                    style={{
                      borderTop: idx > 0 ? '1px solid var(--border)' : undefined,
                    }}
                  >
                    {/* Linha da sessão: trigger + ações */}
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      {/* Accordion trigger */}
                      <button
                        data-testid="memory-session-accordion-trigger"
                        onClick={() => toggleSession(session.id)}
                        aria-expanded={isExpanded}
                        style={{
                          flex: 1,
                          background: 'none',
                          border: 'none',
                          cursor: hasContent ? 'pointer' : 'default',
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'left',
                          color: 'var(--text)',
                          transition: 'background var(--duration-fast)',
                          minWidth: 0,
                        }}
                      >
                        {/* Chevron */}
                        {hasContent && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            style={{
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform var(--duration-fast)',
                              flexShrink: 0,
                              color: 'var(--text3)',
                            }}
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        )}
                        {!hasContent && <div style={{ width: '12px', flexShrink: 0 }} />}

                        {/* Data */}
                        <span
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 600,
                            color: 'var(--text)',
                            minWidth: '120px',
                          }}
                        >
                          {formatDate(session.date)}
                        </span>

                        {/* Duração */}
                        <span
                          style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text3)',
                            marginLeft: '4px',
                          }}
                        >
                          {session.duration} min
                        </span>

                        {/* Indicadores */}
                        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                          {hasNotes && (
                            <span
                              style={{
                                background: 'rgba(124,58,237,.1)',
                                color: '#a78bfa',
                                borderRadius: '20px',
                                padding: '1px 7px',
                                fontSize: '10px',
                              }}
                            >
                              notas
                            </span>
                          )}
                          {hasHighlights && (
                            <span
                              style={{
                                background: 'rgba(245,158,11,.1)',
                                color: '#fbbf24',
                                borderRadius: '20px',
                                padding: '1px 7px',
                                fontSize: '10px',
                              }}
                            >
                              highlights
                            </span>
                          )}
                          {hasTeach && (
                            <span
                              style={{
                                background: 'rgba(16,185,129,.1)',
                                color: '#34d399',
                                borderRadius: '20px',
                                padding: '1px 7px',
                                fontSize: '10px',
                              }}
                            >
                              professor
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Ações (fora do button para evitar nesting inválido) */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          paddingRight: 12,
                          flexShrink: 0,
                        }}
                      >
                        <button
                          aria-label="Editar sessão"
                          data-testid="session-edit-btn"
                          onClick={() => setEditingSession(session)}
                          style={{
                            background: 'none',
                            border: '1px solid var(--border2)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '4px 7px',
                            cursor: 'pointer',
                            color: 'var(--text2)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Pencil />
                        </button>
                        <button
                          aria-label="Excluir sessão"
                          data-testid="session-delete-btn"
                          onClick={() => setDeletingSessionId(session.id)}
                          style={{
                            background: 'none',
                            border: '1px solid var(--border2)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '4px 7px',
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

                    {/* Accordion body */}
                    {isExpanded && hasContent && (
                      <div
                        data-testid="memory-session-body"
                        style={{
                          padding: '4px 16px 16px 36px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        {/* Highlights */}
                        {hasHighlights && (
                          <div>
                            <div
                              style={{
                                fontSize: 'var(--text-xs)',
                                fontWeight: 700,
                                color: 'var(--text3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                marginBottom: '6px',
                              }}
                            >
                              Highlights
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {session.highlights.map((h, i) => (
                                <span
                                  key={i}
                                  style={{
                                    background: 'rgba(245,158,11,.12)',
                                    color: '#d97706',
                                    border: '1px solid rgba(245,158,11,.25)',
                                    borderRadius: '20px',
                                    padding: '2px 9px',
                                    fontSize: '11px',
                                    fontWeight: 500,
                                  }}
                                >
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notas */}
                        {hasNotes && (
                          <div>
                            <div
                              style={{
                                fontSize: 'var(--text-xs)',
                                fontWeight: 700,
                                color: 'var(--text3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                marginBottom: '6px',
                              }}
                            >
                              Notas
                            </div>
                            <p
                              style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text2)',
                                margin: 0,
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {session.notes}
                            </p>
                          </div>
                        )}

                        {/* Modo Professor */}
                        {hasTeach && (
                          <div>
                            <div
                              style={{
                                fontSize: 'var(--text-xs)',
                                fontWeight: 700,
                                color: 'var(--text3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                marginBottom: '6px',
                              }}
                            >
                              Modo Professor
                            </div>
                            <p
                              style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text2)',
                                margin: 0,
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {session.teach}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Seção de exercícios do conteúdo */}
            {userId && <ExercisesSection contentId={group.content.id} userId={userId} />}
          </div>
        ))}
      </div>

      {/* Modal de edição de sessão */}
      {editingSession && (
        <SessionEditModal session={editingSession} onClose={() => setEditingSession(null)} />
      )}

      {/* Confirmação de exclusão de sessão */}
      <ConfirmDialog
        open={!!deletingSessionId}
        title="Excluir sessão?"
        description="Esta ação não pode ser desfeita. A sessão será removida permanentemente. Seus flashcards e habilidades adquiridas serão preservados."
        confirmLabel="Excluir"
        onConfirm={handleDeleteSession}
        onCancel={() => setDeletingSessionId(null)}
      />
    </div>
  )
}
