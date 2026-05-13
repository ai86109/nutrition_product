import { createClientForServer } from '@/utils/supabase/server'
import type { PublicTutorial, Tutorial } from '@/types/tutorial'

/**
 * 公開頁面用：列出所有已發佈的 tutorial，依 sort_order asc, created_at asc。
 * 走一般 select，靠 RLS policy 過濾 is_published = true。
 */
export async function listPublishedTutorials(): Promise<PublicTutorial[]> {
  const supabase = await createClientForServer()
  const { data, error } = await supabase
    .from('tutorials')
    .select('id, title, description, href')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error listing published tutorials:', error)
    return []
  }

  return (data ?? []) as PublicTutorial[]
}

/**
 * Admin 用：列出所有 tutorial（含未發佈），依 sort_order asc, created_at asc。
 * 走 list_tutorials_admin RPC（SECURITY DEFINER + assert_caller_is_admin）。
 */
export async function listTutorialsAdmin(): Promise<Tutorial[]> {
  const supabase = await createClientForServer()
  const { data, error } = await supabase.rpc('list_tutorials_admin')

  if (error) {
    console.error('Error listing tutorials (admin):', error)
    return []
  }

  return (data ?? []) as Tutorial[]
}
