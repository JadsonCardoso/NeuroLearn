import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LandingPage } from '@/modules/landing/LandingPage'

export const metadata: Metadata = {
  title: 'NeuroLearn — Aprenda sem esquecer',
  description: 'Plataforma de aprendizagem baseada em neurociência. Revisão espaçada, Modo Professor e Skill Tracker para transformar estudo em retenção real.',
  keywords: ['aprendizagem', 'revisão espaçada', 'neurociência', 'flashcards', 'SM-2', 'estudo', 'memorização'],
  openGraph: {
    title: 'NeuroLearn — Aprenda sem esquecer',
    description: 'Plataforma de aprendizagem baseada em neurociência. Transforme estudo em retenção e habilidade real.',
    url: 'https://neurolearn.tech',
    siteName: 'NeuroLearn',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeuroLearn — Aprenda sem esquecer',
    description: 'Plataforma de aprendizagem baseada em neurociência.',
  },
}

export default async function RootPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
  } catch {
    // Falha silenciosa — renderiza landing para usuários não autenticados
  }

  return <LandingPage />
}
