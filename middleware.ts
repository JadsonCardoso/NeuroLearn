import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { checkRateLimit, getRateLimitKey } from '@/lib/security/rateLimit'
import { logSecurityEvent } from '@/lib/security/logger'
import { extractRole, hasRole } from '@/lib/security/rbac'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'

  // Rate limiting para rotas de autenticação (proteção brute force)
  if (pathname.startsWith('/auth')) {
    const key = getRateLimitKey('auth', ip)
    const { allowed, retryAfterMs } = checkRateLimit(key)

    if (!allowed) {
      logSecurityEvent('rate_limit.exceeded', { ip, pathname })
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(retryAfterMs / 1000)),
          'Content-Type': 'text/plain',
        },
      })
    }
  }

  // Rotas /(app)/* exigem sessão
  const isAppRoute =
    !pathname.startsWith('/auth') &&
    !pathname.startsWith('/api') &&
    pathname !== '/' &&
    pathname !== '/politica-de-privacidade' &&
    pathname !== '/privacy' &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/favicon')

  if (isAppRoute && !user) {
    logSecurityEvent('session.invalid', { ip, pathname })
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Usuário autenticado não deve acessar páginas de auth
  if (pathname.startsWith('/auth') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // RBAC: rotas /api/admin/* exigem role admin ou superior
  if (pathname.startsWith('/api/admin')) {
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const role = extractRole(user.user_metadata)
    if (!hasRole(role, 'admin')) {
      logSecurityEvent('rbac.violation', { ip, pathname, userRole: role })
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
