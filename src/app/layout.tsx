import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ConsentBanner } from '@/components/lgpd/ConsentBanner'
import { PostHogProvider } from '@/components/analytics/PostHogProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NeuroLearn — Sistema Operacional de Aprendizagem',
  description: 'Plataforma cognitiva de aprendizagem baseada em neurociência. Revisão espaçada, recuperação ativa e consolidação de habilidades.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NeuroLearn',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Aplica o tema antes de qualquer pintura para eliminar o flash dark→light */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('nl_theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={inter.className}>
        <PostHogProvider>
          {children}
          <ConsentBanner />
        </PostHogProvider>
      </body>
    </html>
  )
}
