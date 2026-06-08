'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const CONSENT_KEY = 'nl_lgpd_consent'

// Lê o consentimento LGPD do localStorage
function getConsentChoice(): 'accepted' | 'minimal' | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { consent: 'accepted' | 'minimal' }
    return parsed.consent ?? null
  } catch {
    return null
  }
}

// Componente interno que rastreia mudanças de rota como page views
function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname || !posthog.__loaded) return
    const url = window.location.origin + pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}

// Provider principal — inicializa PostHog respeitando consentimento LGPD
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false,  // rastreamos manualmente via PostHogPageView
      capture_pageleave: true,
      loaded: (ph) => {
        // Aplica consentimento LGPD na inicialização
        const consent = getConsentChoice()
        if (consent === 'accepted') {
          ph.opt_in_capturing()
        } else {
          // 'minimal' ou sem consentimento ainda → não rastreia
          ph.opt_out_capturing()
        }
      },
    })

    // Escuta mudanças de consentimento em outras abas ou no banner
    function onStorage(e: StorageEvent) {
      if (e.key !== CONSENT_KEY) return
      const consent = getConsentChoice()
      if (consent === 'accepted') posthog.opt_in_capturing()
      else posthog.opt_out_capturing()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <PHProvider client={posthog}>
      {/* Suspense obrigatório para useSearchParams no App Router */}
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}
