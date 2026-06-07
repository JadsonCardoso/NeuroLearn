import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Handler do OAuth callback (Google, magic link, etc.)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const nextRaw = searchParams.get('next') ?? '/dashboard'
  // Rejeita qualquer valor que não seja caminho relativo seguro (evita open redirect)
  const next = /^\/[^/]/.test(nextRaw) ? nextRaw : '/dashboard'

  // Usa env var para evitar origin interno do servidor (ex: 0.0.0.0:3000 em proxies)
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? ''
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (host ? `${proto}://${host}` : 'https://neurolearn.tech')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${siteUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${siteUrl}/auth/login?error=callback_failed`)
}
