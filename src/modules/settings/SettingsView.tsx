'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useAppData } from '@/hooks/useAppData'
import { useToast } from '@/hooks/useToast'
import { restoreToSupabase } from '@/services/backupService'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Settings, Download, Upload, Trash, User } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'

// ── Schema Zod para validação do JSON importado ──────────────────────────────

const BackupDataSchema = z.object({
  version: z.string(),
  app: z.literal('NeuroLearn'),
  data: z.object({
    contents: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        type: z.enum(['book', 'course', 'video', 'article', 'note']),
        author: z.string(),
        desc: z.string(),
        progress: z.number(),
        color: z.string(),
        addedAt: z.string(),
        trailId: z.string().nullable().optional().default(null),
      })
    ),
    cards: z.array(
      z.object({
        id: z.string(),
        cid: z.string(),
        front: z.string(),
        back: z.string(),
        ef: z.number(),
        interval: z.number(),
        reps: z.number(),
        nextReview: z.string().nullable(),
        lastReview: z.string().nullable(),
        mastery: z.enum(['new', 'learning', 'review', 'strong']),
      })
    ),
    skills: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        level: z.number(),
        xp: z.number(),
        maxXp: z.number(),
        cat: z.enum([
          'product',
          'tech',
          'soft',
          'data',
          'business',
          'leadership',
          'design',
          'languages',
          'methods',
          'science',
        ]),
        color: z.string(),
      })
    ),
    sessions: z.array(
      z.object({
        id: z.string(),
        cid: z.string(),
        date: z.string(),
        duration: z.number(),
        cardsCreated: z.number().default(0),
        highlights: z.array(z.string()),
        notes: z.string(),
        teach: z.string(),
      })
    ),
    streak: z.number(),
    lastStudyDate: z.string(),
    totalXp: z.number(),
    trails: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          type: z.enum(['course', 'book', 'article', 'free', 'certification', 'research', 'tech']),
          description: z.string(),
          color: z.string(),
          iconEmoji: z.string(),
          goal: z.string(),
          skillId: z.string().nullable(),
          createdAt: z.string(),
        })
      )
      .optional()
      .default([]),
  }),
})

type BackupData = z.infer<typeof BackupDataSchema>

// ── Helpers ──────────────────────────────────────────────────────────────────

function downloadJson(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Componente ───────────────────────────────────────────────────────────────

export function SettingsView() {
  const { state, dispatch, userId } = useAppData()
  const { toast } = useToast()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  // Estado para confirmação de importação
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null)
  const [importError, setImportError] = useState('')
  const [restoring, setRestoring] = useState(false)

  // Estado para confirmação de exclusão de conta
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Email do usuário autenticado — useEffect evita side-effect no render (SEC-SET-01)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        setUserEmail(data.user?.email ?? '')
      })
  }, [])

  // ── Export ─────────────────────────────────────────────────────────────────

  function handleExport() {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      app: 'NeuroLearn',
      data: {
        contents: state.contents,
        cards: state.cards,
        skills: state.skills,
        sessions: state.sessions,
        streak: state.streak,
        lastStudyDate: state.lastStudyDate,
        totalXp: state.totalXp,
      },
    }
    const date = new Date().toISOString().slice(0, 10)
    downloadJson(backup, `neurolearn-backup-${date}.json`)
    toast.success('Backup exportado com sucesso!')
  }

  // ── Import ─────────────────────────────────────────────────────────────────

  const MAX_IMPORT_BYTES = 5 * 1024 * 1024 // 5 MB — SEC-SET-02

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError('')

    if (file.size > MAX_IMPORT_BYTES) {
      setImportError('Arquivo muito grande. O backup não deve ultrapassar 5 MB.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const raw = JSON.parse(evt.target?.result as string)
        const result = BackupDataSchema.safeParse(raw)
        if (!result.success) {
          setImportError(
            'Arquivo inválido ou incompatível. Certifique-se de usar um backup exportado pelo NeuroLearn.'
          )
          return
        }
        setPendingImport(result.data)
      } catch {
        setImportError('Não foi possível ler o arquivo. Verifique se é um JSON válido.')
      }
    }
    reader.readAsText(file)

    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = ''
  }

  async function confirmImport() {
    if (!pendingImport || !userId) return
    setRestoring(true)
    try {
      dispatch({ type: 'LOAD_STATE', payload: pendingImport.data })
      await restoreToSupabase(userId, pendingImport.data)
      toast.success('Dados restaurados e sincronizados com sucesso!')
    } catch {
      toast.error('Dados restaurados localmente, mas houve erro ao sincronizar com o servidor.')
    } finally {
      setRestoring(false)
      setPendingImport(null)
    }
  }

  // ── Delete account ─────────────────────────────────────────────────────────

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      // Remove subscription de push do browser antes de deletar a conta
      // Evita subscription órfã que impediria notificações em nova conta
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const reg = await navigator.serviceWorker.ready.catch(() => null)
        const sub = await reg?.pushManager.getSubscription().catch(() => null)
        await sub?.unsubscribe().catch(() => null)
      }

      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao excluir conta')
      toast.success('Conta excluída. Até logo!')
      router.push('/auth/login')
    } catch {
      toast.error('Erro ao excluir conta. Tente novamente.')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────

  const totalItems =
    state.contents.length + state.cards.length + state.skills.length + state.sessions.length

  return (
    <div
      className="slide-in"
      style={{ padding: 'var(--space-6)', maxWidth: '700px', margin: '0 auto' }}
    >
      <PageHeader
        icon={<Settings />}
        title="Configurações"
        subtitle="Gerencie sua conta e seus dados"
      />

      {/* Seção: Conta */}
      <section
        className="card"
        style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}
      >
        <h2
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: '700',
            color: 'var(--text)',
            margin: '0 0 var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <User /> Conta
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text3)',
                margin: '0 0 var(--space-1)',
              }}
            >
              E-mail
            </p>
            <p
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text)',
                fontWeight: 500,
                margin: 0,
              }}
            >
              {userEmail ?? '—'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {[
              { label: 'Conteúdos', value: state.contents.length },
              { label: 'Flashcards', value: state.cards.length },
              { label: 'Habilidades', value: state.skills.length },
              { label: 'Sessões', value: state.sessions.length },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'var(--bg2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-2) var(--space-3)',
                  textAlign: 'center',
                  minWidth: '90px',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: '800',
                    color: 'var(--color-primary)',
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text3)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção: Backup de Dados */}
      <section
        className="card"
        style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}
      >
        <h2
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: '700',
            color: 'var(--text)',
            margin: '0 0 var(--space-2)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <Download /> Backup de Dados
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text3)',
            margin: '0 0 var(--space-4)',
          }}
        >
          Exporte todos os seus dados como JSON ou restaure a partir de um backup anterior. Seus
          dados incluem {totalItems} itens no total.
        </p>

        {/* Export */}
        <div
          style={{
            background: 'var(--color-primary-dim)',
            border: '1px solid rgba(124,58,237,.2)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <h3
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: '700',
              color: 'var(--color-primary-text)',
              margin: '0 0 var(--space-2)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <Download /> Exportar dados
          </h3>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text3)',
              margin: '0 0 var(--space-1)',
            }}
          >
            Baixa um arquivo JSON com todos os seus conteúdos, flashcards, habilidades e sessões.
            Útil como backup ou para migração.
          </p>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-warning)',
              margin: '0 0 var(--space-3)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-1)',
            }}
          >
            ⚠ O arquivo exportado contém dados pessoais. Guarde-o em local seguro e não compartilhe
            com terceiros.
          </p>
          <button
            className="btn-primary"
            onClick={handleExport}
            disabled={totalItems === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Download /> Exportar neurolearn-backup.json
          </button>
          {totalItems === 0 && (
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text4)',
                margin: 'var(--space-2) 0 0',
              }}
            >
              Nenhum dado para exportar ainda.
            </p>
          )}
        </div>

        {/* Import */}
        <div
          style={{
            background: 'var(--color-info-dim)',
            border: '1px solid rgba(6,182,212,.2)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
          }}
        >
          <h3
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: '700',
              color: 'var(--color-info-text, var(--color-info))',
              margin: '0 0 var(--space-2)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <Upload /> Importar dados
          </h3>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text3)',
              margin: '0 0 var(--space-3)',
            }}
          >
            Restaura dados a partir de um backup exportado pelo NeuroLearn.{' '}
            <strong style={{ color: 'var(--color-warning)' }}>Atenção:</strong> substituirá todos os
            dados atuais.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-label="Selecionar arquivo de backup JSON"
          />
          <button
            className="btn-secondary"
            onClick={() => fileRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <Upload /> Selecionar arquivo JSON
          </button>
          {importError && (
            <p
              role="alert"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-danger)',
                margin: 'var(--space-2) 0 0',
              }}
            >
              {importError}
            </p>
          )}
        </div>
      </section>

      {/* Seção: Zona de Perigo */}
      <section
        className="card"
        style={{
          padding: 'var(--space-5)',
          border: '1px solid rgba(239,68,68,.25)',
          background: 'rgba(239,68,68,.03)',
        }}
      >
        <h2
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: '700',
            color: 'var(--color-danger)',
            margin: '0 0 var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <Trash /> Zona de Perigo
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text3)',
            margin: '0 0 var(--space-4)',
          }}
        >
          Exclusão permanente de conta e todos os dados associados. Esta ação é irreversível.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            background: 'transparent',
            border: '1px solid var(--color-danger)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-2) var(--space-4)',
            cursor: 'pointer',
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            transition: 'background var(--duration-fast)',
          }}
        >
          <Trash /> Excluir minha conta
        </button>
      </section>

      {/* Dialog de confirmação de importação */}
      <ConfirmDialog
        open={pendingImport !== null}
        title="Confirmar restauração de dados"
        description={
          pendingImport
            ? `Serão importados: ${pendingImport.data.contents.length} conteúdos, ${pendingImport.data.cards.length} flashcards, ${pendingImport.data.skills.length} habilidades e ${pendingImport.data.sessions.length} sessões. Os dados atuais serão substituídos.`
            : ''
        }
        confirmLabel="Restaurar dados"
        cancelLabel="Cancelar"
        variant="warning"
        loading={restoring}
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />

      {/* Dialog de confirmação de exclusão de conta */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Excluir conta permanentemente?"
        description="Todos os seus dados serão removidos do Supabase. Esta ação não pode ser desfeita. Exporte um backup antes de continuar."
        confirmLabel="Sim, excluir minha conta"
        cancelLabel="Cancelar"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
