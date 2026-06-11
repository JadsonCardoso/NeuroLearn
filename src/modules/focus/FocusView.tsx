'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Content, FlashCard, StudySession } from '@/types'
import { useAppData } from '@/hooks/useAppData'
import { useToast } from '@/hooks/useToast'
import { uid } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useFocusSession } from '@/store/FocusSessionContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { FocusStudyPhase } from './FocusStudyPhase'
import { FocusExtractPhase } from './FocusExtractPhase'
import { FocusTeachPhase } from './FocusTeachPhase'
import { useAutoSave } from '@/hooks/useAutoSave'
import { getDraft, deleteDraft } from '@/services/sessionDraftsService'
import { SaveIndicator } from '@/components/ui/SaveIndicator'
import { createClient } from '@/lib/supabase/client'
import { createExercise } from '@/services/exercisesService'

interface FocusViewProps {
  content: Content
}

const TYPE_ICONS: Record<string, string> = {
  book: '📚',
  course: '🎓',
  video: '🎥',
  article: '📄',
  note: '📝',
}

const phases = [
  { id: 'study', l: '1. Sessão de Foco' },
  { id: 'extract', l: '2. Extração' },
  { id: 'teach', l: '3. Ensinar' },
] as const

export function FocusView({ content }: FocusViewProps) {
  const { dispatch } = useAppData()
  const { toast } = useToast()
  const router = useRouter()
  const { setIsRunning } = useFocusSession()
  const { track } = useAnalytics()
  const sessionStartedRef = useRef(false)

  const [phase, setPhase] = useState<'study' | 'extract' | 'teach'>('study')
  const [secs, setSecs] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [notes, setNotes] = useState('')
  const [highlights, setHighlights] = useState<string[]>([])
  const [hiInput, setHiInput] = useState('')
  const [teach, setTeach] = useState('')
  const [qs, setQs] = useState({ imp: '', gap: '', apply: '' })
  const [newCards, setNewCards] = useState<FlashCard[]>([])
  const [cf, setCf] = useState({ front: '', back: '' })
  const [ex, setEx] = useState({ question: '', answer: '' })
  const [savedExCount, setSavedExCount] = useState(0)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [userId, setUserId] = useState<string>('')

  const workerRef = useRef<Worker | null>(null)
  const phaseRef = useRef(phase)

  // Obtém o userId autenticado via Supabase
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) setUserId(data.user.id)
      })
  }, [])

  // Auto-save do rascunho da sessão
  const { saveStatus } = useAutoSave({
    notes,
    highlights,
    teachText: teach,
    contentId: content?.id ?? '',
    userId,
  })

  // Recuperação de rascunho quando o content.id ou userId muda
  useEffect(() => {
    if (!content?.id || !userId) return
    getDraft(userId, content.id).then((draft) => {
      if (!draft) return
      if (draft.notes) setNotes(draft.notes)
      if (draft.highlights?.length) setHighlights(draft.highlights)
      if (draft.teachText) setTeach(draft.teachText)
      setShowDraftBanner(true)
      setTimeout(() => setShowDraftBanner(false), 4000)
    })
  }, [content?.id, userId])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  useEffect(() => {
    setIsRunning(running)
  }, [running, setIsRunning])

  useEffect(() => {
    if (running && !sessionStartedRef.current) {
      sessionStartedRef.current = true
      track('session_started', { content_id: content.id, phase, duration_secs: TOTAL })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  useEffect(() => {
    if (typeof Worker === 'undefined') return
    const worker = new Worker('/timer.worker.js')
    workerRef.current = worker
    worker.onmessage = (e: MessageEvent<{ type: string; secs?: number }>) => {
      const { type, secs: workerSecs } = e.data
      if (type === 'TICK' && workerSecs !== undefined) {
        setSecs(workerSecs)
      } else if (type === 'DONE') {
        setRunning(false)
        if (phaseRef.current === 'study') {
          setPhase('extract')
          setSecs(5 * 60)
        } else {
          setSecs(0)
        }
      }
    }
    return () => {
      worker.terminate()
      setIsRunning(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const worker = workerRef.current
    if (!worker) return
    if (running) {
      worker.postMessage({ type: 'START', payload: { secs } })
    } else {
      worker.postMessage({ type: 'PAUSE' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  useEffect(() => {
    if (!running) return
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      return ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [running])

  const TOTAL = phase === 'study' ? 25 * 60 : 5 * 60
  const r = 44
  const circumference = 2 * Math.PI * r
  const offset = circumference - ((((TOTAL - secs) / TOTAL) * 100) / 100) * circumference
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')

  function handleBack() {
    if (running) {
      setShowLeaveConfirm(true)
    } else {
      router.push('/focus')
    }
  }

  async function handleAddExercise() {
    if (!ex.question.trim() || !ex.answer.trim() || !userId || !content?.id) return
    try {
      await createExercise(userId, content.id, {
        question: ex.question.trim(),
        answer: ex.answer.trim(),
      })
      setSavedExCount((n) => n + 1)
      setEx({ question: '', answer: '' })
    } catch {
      toast.error('Erro ao salvar exercício. Tente novamente.')
    }
  }

  function addCard() {
    if (!cf.front || !cf.back) return
    const card: FlashCard = {
      ...cf,
      id: uid(),
      cid: content.id,
      ef: 2.5,
      interval: 1,
      reps: 0,
      nextReview: new Date().toISOString(),
      lastReview: null,
      mastery: 'new',
    }
    setNewCards((a) => [...a, card])
    setCf({ front: '', back: '' })
  }

  function finish() {
    const session: StudySession = {
      id: uid(),
      cid: content.id,
      date: new Date().toISOString(),
      duration: 25,
      cardsCreated: newCards.length,
      highlights,
      notes,
      teach,
    }
    dispatch({
      type: 'FINISH_SESSION',
      payload: { session, cards: newCards, contentId: content.id },
    })
    if (userId && content?.id) {
      deleteDraft(userId, content.id).catch(() => {})
    }
    track('session_completed', { content_id: content.id, phase, duration_secs: 25 * 60 })
    router.push('/dashboard')
  }

  return (
    <div className="slide-in" style={{ padding: '24px', maxWidth: '920px', margin: '0 auto' }}>
      <ConfirmDialog
        open={showLeaveConfirm}
        variant="warning"
        title="Sessão em andamento"
        description="O timer está rodando. Se sair agora, o progresso desta sessão não será salvo. Deseja mesmo sair?"
        confirmLabel="Sair sem salvar"
        cancelLabel="Continuar estudando"
        onConfirm={() => {
          setShowLeaveConfirm(false)
          setRunning(false)
          router.push('/focus')
        }}
        onCancel={() => setShowLeaveConfirm(false)}
      />

      <button
        data-testid="btn-back-focus"
        onClick={handleBack}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text3)',
          cursor: 'pointer',
          fontSize: '13px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        ← Voltar
      </button>

      <div
        style={{
          display: 'flex',
          gap: 0,
          marginBottom: '22px',
          background: 'var(--card)',
          borderRadius: '10px',
          padding: '4px',
          border: '1px solid var(--border)',
          width: 'fit-content',
        }}
      >
        {phases.map((p) => (
          <button
            key={p.id}
            onClick={() => setPhase(p.id)}
            style={{
              padding: '7px 15px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: 'Inter',
              background: phase === p.id ? '#7c3aed' : 'transparent',
              color: phase === p.id ? '#fff' : 'var(--text3)',
              transition: 'all .2s',
            }}
          >
            {p.l}
          </button>
        ))}
      </div>

      <div
        className="card"
        style={{
          padding: '12px 16px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderColor: content.color + '40',
        }}
      >
        <span style={{ fontSize: '16px' }}>{TYPE_ICONS[content.type] ?? '📚'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>
            {content.title}
          </div>
          {content.author && (
            <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{content.author}</div>
          )}
        </div>
        <SaveIndicator status={saveStatus} />
      </div>

      {showDraftBanner && (
        <div
          data-testid="draft-banner"
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            background: 'rgba(124,58,237,.08)',
            border: '1px solid rgba(124,58,237,.2)',
            fontSize: '12px',
            color: '#a78bfa',
            marginBottom: '12px',
          }}
        >
          📝 Rascunho restaurado — continuando de onde você parou
        </div>
      )}

      {phase === 'study' && (
        <FocusStudyPhase
          running={running}
          notes={notes}
          highlights={highlights}
          hiInput={hiInput}
          mm={mm}
          ss={ss}
          r={r}
          circumference={circumference}
          offset={offset}
          onToggleRunning={() => setRunning(!running)}
          onResetTimer={() => {
            setSecs(25 * 60)
            setRunning(false)
            workerRef.current?.postMessage({ type: 'RESET', payload: { secs: 25 * 60 } })
          }}
          onNotesChange={setNotes}
          onHiInputChange={setHiInput}
          onAddHighlight={() => {
            if (!hiInput.trim()) return
            setHighlights((h) => [...h, hiInput.trim()])
            setHiInput('')
          }}
          onRemoveHighlight={(i) => setHighlights((p) => p.filter((_, j) => j !== i))}
          onNext={() => setPhase('extract')}
        />
      )}

      {phase === 'extract' && (
        <FocusExtractPhase
          qs={qs}
          cf={cf}
          newCards={newCards}
          ex={ex}
          savedExCount={savedExCount}
          onQsChange={setQs}
          onCfChange={setCf}
          onAddCard={addCard}
          onRemoveCard={(i) => setNewCards((p) => p.filter((_, j) => j !== i))}
          onExChange={setEx}
          onAddExercise={handleAddExercise}
          onNext={() => setPhase('teach')}
        />
      )}

      {phase === 'teach' && (
        <FocusTeachPhase
          teach={teach}
          highlights={highlights}
          content={content}
          onTeachChange={setTeach}
          onBack={() => setPhase('extract')}
          onFinish={finish}
        />
      )}
    </div>
  )
}
