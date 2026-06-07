import { createClient } from '@/lib/supabase/server'
import { waitlistSchema } from '@/lib/validation/schemas'
import { checkRateLimit, getRateLimitKey } from '@/lib/security/rateLimit'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const { allowed, retryAfterMs } = checkRateLimit(getRateLimitKey('waitlist', ip))

  if (!allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em instantes.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = waitlistSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 422 })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('waitlist')
    .insert({ name: parsed.data.name, email: parsed.data.email })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Este email já está na lista.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Erro ao salvar. Tente novamente.' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Inscrição realizada com sucesso!' }, { status: 201 })
}
