'use client'

import { useState, useRef } from 'react'
import type { Content, FlashCard } from '@/types'
import type { FlashcardGenerated } from '@/types/ai'
import { uid } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

// Estados internos do fluxo de geração
type GenStep = 'form' | 'loading' | 'review'

interface Props {
  content: Content
  onAdd: (cards: FlashCard[]) => void
  onClose: () => void
}

export function GenerateFlashcardsModal({ content, onAdd, onClose }: Props) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [step, setStep] = useState<GenStep>('form')
  const [notes, setNotes] = useState('')
  const [count, setCount] = useState(5)
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState<FlashcardGenerated[]>([])
  // Índices dos cards selecionados para aprovação
  const [selected, setSelected] = useState<Set<number>>(new Set())
  // Guard síncrono contra double-submit — impede dois clicks rápidos antes do re-render.
  // Combinado com isSubmitting (state) para feedback visual no botão.
  const submitting = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDirty = notes.trim().length > 0 || step !== 'form'

  function tryClose() {
    if (isDirty) setShowCloseConfirm(true)
    else onClose()
  }

  async function handleGenerate() {
    if (submitting.current) return
    if (notes.trim().length < 50) {
      setError('As anotações precisam ter pelo menos 50 caracteres.')
      return
    }
    submitting.current = true
    setIsSubmitting(true)
    setError('')
    setStep('loading')
    try {
      const res = await fetch('/api/ai/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes.trim(), title: content.title, count }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao gerar flashcards. Tente novamente.')
        setStep('form')
        return
      }
      const cards: FlashcardGenerated[] = data.cards ?? []
      setGenerated(cards)
      // Seleciona todos por padrão
      setSelected(new Set(cards.map((_, i) => i)))
      setStep('review')
    } catch {
      setError('Falha na conexão. Verifique sua internet e tente novamente.')
      setStep('form')
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  function toggleCard(i: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) { next.delete(i) } else { next.add(i) }
      return next
    })
  }

  function updateFront(i: number, val: string) {
    setGenerated((prev) => prev.map((c, idx) => idx === i ? { ...c, front: val } : c))
  }

  function updateBack(i: number, val: string) {
    setGenerated((prev) => prev.map((c, idx) => idx === i ? { ...c, back: val } : c))
  }

  function handleConfirm() {
    const approved = generated
      .filter((_, i) => selected.has(i))
      .map((c) => ({
        id: uid(),
        cid: content.id,
        front: c.front.trim(),
        back: c.back.trim(),
        ef: 2.5,
        interval: 1,
        reps: 0,
        nextReview: new Date().toISOString(),
        lastReview: '',
        mastery: 'learning' as const,
        retention: 100,
      }))
    if (approved.length === 0) {
      setError('Selecione ao menos um flashcard para adicionar.')
      return
    }
    onAdd(approved)
    onClose()
  }

  return (
    <div
      data-testid="generate-flashcards-modal"
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) tryClose() }}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: '560px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text)', marginBottom: '3px' }}>
              Gerar Flashcards com IA
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{content.title}</p>
          </div>
          <button
            onClick={tryClose}
            aria-label="Fechar modal"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: '20px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* STEP: FORM */}
        {step === 'form' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                Suas anotações sobre o conteúdo *
              </label>
              <textarea
                data-testid="gen-notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cole aqui suas anotações, resumos ou trechos do conteúdo (mín. 50 caracteres)..."
                rows={7}
                style={{
                  width: '100%', resize: 'vertical', background: 'var(--card2)',
                  border: '1px solid var(--border2)', borderRadius: '8px',
                  padding: '10px 12px', fontSize: '13px', color: 'var(--text)',
                  fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                {notes.trim().length} / 10 000 caracteres
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                Quantidade de flashcards a gerar
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[3, 5, 8, 10, 15].map((n) => (
                  <button
                    key={n}
                    data-testid={`gen-count-${n}`}
                    onClick={() => setCount(n)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                      cursor: 'pointer', transition: 'all .15s',
                      border: count === n ? '1.5px solid #7c3aed' : '1px solid var(--border2)',
                      background: count === n ? 'rgba(124,58,237,.12)' : 'var(--card2)',
                      color: count === n ? '#7c3aed' : 'var(--text2)',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p data-testid="gen-error" style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={tryClose}
                style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '13px', background: 'none', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                data-testid="btn-generate"
                onClick={handleGenerate}
                disabled={isSubmitting}
                className="btn-primary"
                style={{ padding: '9px 20px', fontSize: '13px', opacity: isSubmitting ? 0.6 : 1 }}
              >
                Gerar com IA
              </button>
            </div>
          </div>
        )}

        {/* STEP: LOADING */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>⚙️</div>
            <p style={{ fontSize: '14px', color: 'var(--text2)', fontWeight: '600' }}>Gerando flashcards…</p>
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '6px' }}>Isso pode levar alguns segundos.</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* STEP: REVIEW */}
        {step === 'review' && (
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '16px' }}>
              {selected.size} de {generated.length} flashcards selecionados. Edite ou desmarque antes de aprovar.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {generated.map((card, i) => (
                <div
                  key={i}
                  data-testid={`gen-card-${i}`}
                  style={{
                    border: selected.has(i) ? '1.5px solid #7c3aed' : '1px solid var(--border)',
                    borderRadius: '10px', padding: '14px',
                    background: selected.has(i) ? 'rgba(124,58,237,.05)' : 'var(--card2)',
                    opacity: selected.has(i) ? 1 : 0.5,
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Card {i + 1}</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text3)' }}>
                      <input
                        type="checkbox"
                        data-testid={`gen-card-checkbox-${i}`}
                        checked={selected.has(i)}
                        onChange={() => toggleCard(i)}
                        style={{ accentColor: '#7c3aed' }}
                      />
                      Incluir
                    </label>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '3px' }}>FRENTE</label>
                    <textarea
                      data-testid={`gen-card-front-${i}`}
                      value={card.front}
                      onChange={(e) => updateFront(i, e.target.value)}
                      rows={2}
                      style={{
                        width: '100%', resize: 'vertical', background: 'var(--card)',
                        border: '1px solid var(--border2)', borderRadius: '6px',
                        padding: '7px 10px', fontSize: '12px', color: 'var(--text)',
                        fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '3px' }}>VERSO</label>
                    <textarea
                      data-testid={`gen-card-back-${i}`}
                      value={card.back}
                      onChange={(e) => updateBack(i, e.target.value)}
                      rows={3}
                      style={{
                        width: '100%', resize: 'vertical', background: 'var(--card)',
                        border: '1px solid var(--border2)', borderRadius: '6px',
                        padding: '7px 10px', fontSize: '12px', color: 'var(--text)',
                        fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p data-testid="gen-error" style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setStep('form'); setError('') }}
                style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '13px', background: 'none', border: '1px solid var(--border2)', color: 'var(--text2)', cursor: 'pointer' }}
              >
                Refazer
              </button>
              <button
                data-testid="btn-approve-cards"
                onClick={handleConfirm}
                className="btn-primary"
                style={{ padding: '9px 20px', fontSize: '13px' }}
              >
                Adicionar {selected.size} card{selected.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={showCloseConfirm}
          title="Descartar geração?"
          description="Você tem anotações não salvas ou uma geração em andamento. Deseja fechar e descartar tudo?"
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
