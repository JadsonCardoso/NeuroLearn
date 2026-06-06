import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppProvider } from '@/store/AppContext'
import { AppShell } from './AppShell'

// Server Component — valida sessão e monta o shell do app
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  )
}
