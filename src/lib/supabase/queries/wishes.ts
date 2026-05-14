import { createClient } from '@/utils/supabase/client'
import { createClientForServer } from '@/utils/supabase/server'
import type { MyWish, WishStatus, WishWithUser } from '@/types/wish'

/**
 * Admin 列表：列出所有 wish，依時間倒序。
 * 走 list_wishes RPC（SECURITY DEFINER + assert_caller_is_admin）。
 */
export async function listWishes(
  status: WishStatus | null = null,
): Promise<WishWithUser[]> {
  const supabase = await createClientForServer()
  const { data, error } = await supabase.rpc('list_wishes', {
    p_status: status,
  })

  if (error) {
    console.error('Error listing wishes:', error)
    return []
  }

  return (data ?? []) as WishWithUser[]
}

/**
 * 個人中心：列出登入使用者自己的許願，依時間倒序。
 * 走一般 SELECT，靠 RLS 的 wishes_select_own policy 過濾（auth.uid() = user_id）。
 */
export async function listMyWishes(userId: string): Promise<MyWish[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('wishes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error listing my wishes:', error)
    return []
  }

  return (data ?? []) as MyWish[]
}
