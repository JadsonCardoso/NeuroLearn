// POST /api/push/notify — envia push para usuários com cards vencidos
// Chamado pelo cron diário ou manualmente (CRON_SECRET obrigatório)
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL ?? 'mailto:noreply@neurolearn.tech',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
  process.env.VAPID_PRIVATE_KEY ?? ''
)

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  // Protege o endpoint com CRON_SECRET — Vercel Cron envia Authorization: Bearer <secret>
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || cronSecret.trim() === '' || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Cliente admin com service role — necessário para ler push_subscriptions de todos os usuários (ignora RLS)
  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  const today = new Date().toISOString().split('T')[0]

  // Busca todos os usuários com flashcards vencidos hoje ou antes
  const { data: dueCards, error: cardsError } = await supabase
    .from('flashcards')
    .select('user_id')
    .lte('next_review', today)

  if (cardsError) {
    console.error('[push/notify] Erro ao buscar cards vencidos:', cardsError.message)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }

  // Agrupa por user_id e conta
  const userCounts = new Map<string, number>()
  for (const card of dueCards ?? []) {
    userCounts.set(card.user_id, (userCounts.get(card.user_id) ?? 0) + 1)
  }

  if (userCounts.size === 0) {
    return NextResponse.json({ sent: 0, message: 'Nenhum usuário com cards vencidos' })
  }

  // Busca subscriptions dos usuários com cards vencidos
  const userIds = Array.from(userCounts.keys())
  const { data: subscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', userIds)

  if (subError) {
    console.error('[push/notify] Erro ao buscar subscriptions:', subError.message)
    return NextResponse.json({ error: 'Erro ao buscar subscriptions' }, { status: 500 })
  }

  let sent = 0
  let failed = 0
  const expiredEndpoints: string[] = []

  for (const sub of subscriptions ?? []) {
    const count = userCounts.get(sub.user_id) ?? 0
    const body = count === 1
      ? 'Você tem 1 card para revisar. 1 minuto garante sua retenção de hoje.'
      : `Você tem ${count} cards para revisar. Mantenha seu streak!`

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title: 'NeuroLearn — Hora de revisar!',
          body,
          url: '/review',
        })
      )
      sent++
    } catch (err: unknown) {
      failed++
      // 410 Gone = subscription expirada — remove do banco
      if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode: number }).statusCode === 410) {
        expiredEndpoints.push(sub.endpoint)
      } else {
        console.error('[push/notify] Falha ao enviar para', sub.endpoint, err)
      }
    }
  }

  // Remove subscriptions expiradas
  if (expiredEndpoints.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', expiredEndpoints)
  }

  return NextResponse.json({ sent, failed, expiredRemoved: expiredEndpoints.length })
}
