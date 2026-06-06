'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppData } from '@/hooks/useAppData'
import { calcRetention } from '@/engine/retention'
import type { Content, ContentType } from '@/types'
import { Plus } from '@/components/icons'
import { AddContentModal } from './AddContentModal'

const TYPE_CONFIG: Record<ContentType, { icon: string }> = {
  book: { icon: '📚' },
  course: { icon: '🎓' },
  video: { icon: '🎥' },
  article: { icon: '📄' },
  note: { icon: '📝' },
}

export function LibraryView() {
  const { state, dispatch } = useAppData()
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)

  function handleAdd(content: Content) {
    dispatch({ type: 'ADD_CONTENT', payload: content })
    setShowAdd(false)
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

          return (
            <div
              key={c.id}
              className="card content-card"
              style={{ padding: '20px' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = c.color + '80')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'var(--border)')
              }
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
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px',
                  }}
                >
                  {c.progress === 100 && (
                    <span
                      className="badge"
                      style={{ background: 'rgba(16,185,129,.2)', color: '#10b981' }}
                    >
                      ✓ Concluído
                    </span>
                  )}
                  {cards.length > 0 && (
                    <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{avgR}% ret.</span>
                  )}
                </div>
              </div>
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--text)',
                  marginBottom: '3px',
                }}
              >
                {c.title}
              </h3>
              {c.author && (
                <p style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '8px' }}>
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
                  }}
                >
                  {c.desc}
                </p>
              )}
              <div style={{ marginBottom: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '3px',
                  }}
                >
                  <span style={{ fontSize: '10px', color: 'var(--text3)' }}>Progresso</span>
                  <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{c.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: c.progress + '%', background: c.color }} />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                  {cards.length} flashcards
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '5px 10px', color: 'var(--color-danger, #ef4444)', borderColor: 'rgba(239,68,68,.3)' }}
                    onClick={() => {
                      if (confirm(`Remover "${c.title}"? Os flashcards associados também serão removidos.`)) {
                        dispatch({ type: 'DELETE_CONTENT', payload: c.id })
                      }
                    }}
                    title="Remover conteúdo"
                  >
                    ✕
                  </button>
                  <button
                    className="btn-primary"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => router.push(`/focus/${c.id}`)}
                  >
                    Estudar →
                  </button>
                </div>
              </div>
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
