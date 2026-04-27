import { redirect } from 'next/navigation'
import { createClientForServer } from '@/utils/supabase/server'

export async function requireAdmin() {
  const supabase = await createClientForServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  if (error || data?.role !== 'admin') {
    redirect('/')
  }

  return session
}
