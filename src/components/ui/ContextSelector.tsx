'use client'

import { useState, useRef, useEffect } from 'react'
import type { LearningTrail, Content } from '@/types'

export type ReviewContext =
  | { type: 'all' }
  | { type: 'trail'; id: string; name: string }
  | { type: 'content'; id: string; name: string; trailId: string | null }

interface ContextSelectorProps {
  context: ReviewContext
  onChange: (ctx: ReviewContext) => void
  trails: LearningTrail[]
  contents: Content[]
}

export function ContextSelector({ context, onChange, trails, contents }: ContextSelectorProps) {
  const [mode, setMode] = useState<'all' | 'trail' | 'content'>(context.type)
  const [trailOpen, setTrailOpen] = useState(false)
  const [contentOpen, setContentOpen] = useState(false)
  const trailRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (trailRef.current && !trailRef.current.contains(e.target as Node)) setTrailOpen(false)
      if (contentRef.current && !contentRef.current.contains(e.target as Node))
        setContentOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Sincroniza mode quando context prop é resetado externamente (ex: limpar badge)
  useEffect(() => {
    setMode(context.type)
  }, [context.type])

  function selectMode(m: 'all' | 'trail' | 'content') {
    setMode(m)
    setTrailOpen(false)
    setContentOpen(false)
    if (m === 'all') onChange({ type: 'all' })
  }

  // Conteúdos filtrados: usa mode+context para evitar dessincronização ao trocar modos
  const filteredContents =
    mode === 'trail' && context.type === 'trail'
      ? contents.filter((c) => c.trailId === context.id)
      : contents

  const activeLabel =
    context.type === 'all' ? 'Todos' : context.type === 'trail' ? context.name : context.name

  return (
    <div data-testid="context-selector" className="flex flex-wrap items-center gap-2">
      {/* Chips de modo */}
      <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
        <button
          type="button"
          data-testid="context-all"
          onClick={() => selectMode('all')}
          className={`px-3 py-1.5 font-medium transition-colors ${
            mode === 'all'
              ? 'bg-violet-600 text-white'
              : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Todos
        </button>
        <button
          type="button"
          data-testid="context-by-trail"
          onClick={() => selectMode('trail')}
          disabled={trails.length === 0}
          className={`px-3 py-1.5 font-medium transition-colors border-l border-[var(--border)] disabled:opacity-40 ${
            mode === 'trail'
              ? 'bg-violet-600 text-white'
              : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Por Trilha
        </button>
        <button
          type="button"
          data-testid="context-by-content"
          onClick={() => selectMode('content')}
          disabled={contents.length === 0}
          className={`px-3 py-1.5 font-medium transition-colors border-l border-[var(--border)] disabled:opacity-40 ${
            mode === 'content'
              ? 'bg-violet-600 text-white'
              : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Por Conteúdo
        </button>
      </div>

      {/* Dropdown de trilha */}
      {mode === 'trail' && (
        <div ref={trailRef} className="relative">
          <button
            type="button"
            data-testid="context-trail-select"
            onClick={() => setTrailOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--bg2)] transition-colors"
          >
            <span>{context.type === 'trail' ? context.name : 'Selecionar trilha'}</span>
            <span className="text-[var(--muted)]">▼</span>
          </button>
          {trailOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 min-w-[200px] rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden">
              {trails.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onChange({ type: 'trail', id: t.id, name: t.title })
                    setTrailOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-[var(--bg2)] transition-colors"
                >
                  <span>{t.iconEmoji}</span>
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dropdown de conteúdo */}
      {mode === 'content' && (
        <div ref={contentRef} className="relative">
          <button
            type="button"
            data-testid="context-content-select"
            onClick={() => setContentOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--bg2)] transition-colors"
          >
            <span>{context.type === 'content' ? context.name : 'Selecionar conteúdo'}</span>
            <span className="text-[var(--muted)]">▼</span>
          </button>
          {contentOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 min-w-[240px] max-h-60 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg">
              {filteredContents.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onChange({ type: 'content', id: c.id, name: c.title, trailId: c.trailId })
                    setContentOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-[var(--bg2)] transition-colors"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
              {filteredContents.length === 0 && (
                <p className="px-3 py-2 text-xs text-[var(--muted)]">
                  Nenhum conteúdo nesta trilha.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Badge do contexto ativo */}
      {context.type !== 'all' && (
        <span className="flex items-center gap-1 rounded-full bg-violet-500/20 text-violet-400 text-xs px-2.5 py-1 font-medium">
          <span>🎯</span>
          <span className="truncate max-w-[150px]">{activeLabel}</span>
          <button
            type="button"
            onClick={() => {
              setMode('all')
              onChange({ type: 'all' })
            }}
            className="ml-0.5 hover:text-white transition-colors"
            aria-label="Limpar contexto"
          >
            ✕
          </button>
        </span>
      )}
    </div>
  )
}
