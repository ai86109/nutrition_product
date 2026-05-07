import { createClientForServer } from '@/utils/supabase/server'
import type { WishStatus, WishWithUser } from '@/types/wish'

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
