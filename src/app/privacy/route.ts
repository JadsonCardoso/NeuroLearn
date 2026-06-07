import { NextResponse, type NextRequest } from 'next/server'

export function GET(request: NextRequest) {
  const url = new URL('/politica-de-privacidade', request.url)
  return NextResponse.redirect(url, { status: 301 })
}
