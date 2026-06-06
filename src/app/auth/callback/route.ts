import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Handler do OAuth callback (Google, magic link, etc.)
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextRaw = searchParams.get('next') ?? '/dashboard'
  // Rejeita qualquer valor que não seja caminho relativo seguro (evita open redirect)
  const next = /^\/[^/]/.test(nextRaw) ? nextRaw : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
}
