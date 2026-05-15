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
 * 個人中心：列出登入使用者自己的許願，依時間倒序。含 unread_count（admin
 * 寫給我、且 created_at > last_read_by_user_at 的訊息數）。
 * 走 list_my_wishes RPC（SECURITY INVOKER；wishes_select_own RLS 仍然過濾）。
 */
export async function listMyWishes(): Promise<MyWish[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('list_my_wishes')

  if (error) {
    console.error('Error listing my wishes:', error)
    return []
  }

  return (data ?? []) as MyWish[]
}
