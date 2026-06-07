// GET /api/cron/retention-snapshot
// Job diário: salva snapshot de retenção para todos os flashcards de todos os usuários.
// Protegido por CRON_SECRET — só o Vercel Cron (ou chamada manual) pode acionar.
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { calcRetention } from '@/engine/retention'
import type { FlashCard, CardMastery } from '@/types'

export const runtime = 'nodejs'

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Valida segredo do cron — rejeita ausente, vazio ou mismatch
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || cronSecret.trim() === '' || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Cliente admin com service role (ignora RLS — exclusivo backend)
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  const today = new Date().toISOString().split('T')[0]

  // Busca todos os flashcards com dados SM-2 suficientes para calcular retenção
  const { data: rows, error: fetchError } = await adminClient
    .from('flashcards')
    .select('id, user_id, ef, interval, repetitions, next_review, last_review, mastery')
    .not('last_review', 'is', null)

  if (fetchError) {
    console.error('[cron/retention-snapshot] fetch error:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 })
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ processed: 0, date: today })
  }

  // Constrói snapshots em lote para upsert eficiente
  const snapshots = rows.map((row) => {
    const card: FlashCard = {
      id: row.id,
      cid: '',
      front: '',
      back: '',
      ef: row.ef,
      interval: row.interval,
      reps: row.repetitions,
      nextReview: row.next_review,
      lastReview: row.last_review ?? '',
      mastery: row.mastery as CardMastery,
    }
    return {
      user_id: row.user_id,
      flashcard_id: row.id,
      retention: Math.max(0, Math.min(1, calcRetention(card) / 100)),
      snapshot_date: today,
    }
  })

  // Upsert em batches de 500 para evitar payloads muito grandes.
  // Em vez de abortar no primeiro erro, continua todos os batches e coleta falhas —
  // garante processamento parcial em vez de rollback total.
  const BATCH = 500
  let processed = 0
  const batchErrors: string[] = []

  for (let i = 0; i < snapshots.length; i += BATCH) {
    const batch = snapshots.slice(i, i + BATCH)
    const { error: upsertError } = await adminClient
      .from('retention_metrics')
      .upsert(batch, { onConflict: 'flashcard_id,snapshot_date' })

    if (upsertError) {
      console.error('[cron/retention-snapshot] upsert error (batch', Math.floor(i / BATCH) + 1, '):', upsertError)
      batchErrors.push(`batch ${Math.floor(i / BATCH) + 1}: ${upsertError.message}`)
    } else {
      processed += batch.length
    }
  }

  if (batchErrors.length > 0) {
    return NextResponse.json(
      { processed, total: snapshots.length, errors: batchErrors, date: today },
      { status: 207 },
    )
  }

  return NextResponse.json({ processed, date: today })
}
