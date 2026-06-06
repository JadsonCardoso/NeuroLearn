import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { logSecurityEvent } from '@/lib/security/logger'

// DELETE /api/user/delete — exclui todos os dados do usuário autenticado (LGPD Art. 18)
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const userId = user.id

  try {
    // Deleção em cascata respeitando FK constraints (tabelas com user_id primeiro)
    await supabase.from('review_cycles').delete().eq('user_id', userId)
    await supabase.from('retention_metrics').delete().eq('user_id', userId)
    await supabase.from('cognitive_events').delete().eq('user_id', userId)
    await supabase.from('study_sessions').delete().eq('user_id', userId)
    await supabase.from('user_skills').delete().eq('user_id', userId)
    await supabase.from('flashcards').delete().eq('user_id', userId)
    await supabase.from('contents').delete().eq('user_id', userId)
    // Tabela users usa `id` como chave primária (não user_id)
    await supabase.from('users').delete().eq('id', userId)

    // Deleta o usuário do auth Supabase (requer service role key)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (serviceKey && supabaseUrl) {
      const adminClient = createAdminClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      await adminClient.auth.admin.deleteUser(userId)
    }

    logSecurityEvent('data.deletion', { userId })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erro na exclusão de dados:', err)
    return NextResponse.json({ error: 'Erro interno ao excluir dados' }, { status: 500 })
  }
}
