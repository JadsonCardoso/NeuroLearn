'use client'

import { useRouter } from 'next/navigation'
import { useAppData } from '@/hooks/useAppData'
import type { ContentType } from '@/types'

// Ícones por tipo de conteúdo (consistente com LibraryView)
const TYPE_ICON: Record<ContentType, string> = {
  book: '📚',
  course: '🎓',
  video: '🎥',
  article: '📄',
  note: '📝',
}

// Tela de seleção de conteúdo para iniciar uma sessão de foco
export function FocusIndexView() {
  const { state } = useAppData()
  const router = useRouter()

  const contents = state.contents

  return (
    <div className="slide-in" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>
          Sessão de Foco
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>
          Selecione um conteúdo para iniciar sua sessão Pomodoro
        </p>
      </div>

      {contents.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📚</div>
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '16px' }}>
            Nenhum conteúdo na biblioteca ainda.
          </p>
          <button className="btn-primary" onClick={() => router.push('/library')}>
            Adicionar conteúdo
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {contents.map((content) => (
            <div
              key={content.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'var(--surface)',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                {/* Cor do conteúdo */}
                <div
                  style={{
                    width: '4px',
                    height: '40px',
                    borderRadius: '4px',
                    background: content.color ?? '#7c3aed',
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontSize: '22px', flexShrink: 0 }}>
                  {TYPE_ICON[content.type] ?? '📄'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {content.title}
                  </div>
                  {content.author && (
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                      {content.author}
                    </div>
                  )}
                </div>
              </div>

              {/* Progresso */}
              <div style={{ fontSize: '11px', color: 'var(--text3)', flexShrink: 0 }}>
                {content.progress ?? 0}%
              </div>

              <button
                className="btn-primary"
                style={{ flexShrink: 0, padding: '7px 16px', fontSize: '12px' }}
                onClick={() => router.push(`/focus/${content.id}`)}
              >
                ▶ Iniciar Foco
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
