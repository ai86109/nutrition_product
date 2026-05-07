import { createClient } from '@/utils/supabase/client'
import type { WishStatus } from '@/types/wish'

/**
 * 一般使用者新增許願。
 * 走一般 INSERT（RLS：authenticated + auth.uid() = user_id）。
 * 內容會在送出前 trim；空字串或超過 1000 字會被 DB constraint 擋下。
 */
export async function createWish(userId: string, content: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('wishes')
    .insert({
      user_id: userId,
      content: content.trim(),
    })

  if (error) {
    console.error('Error creating wish:', error)
    throw error
  }
}

/**
 * Admin 更新 wish 狀態（含 admin_note）。
 * 走 SECURITY DEFINER RPC，函式內部會 assert_caller_is_admin()。
 */
export async function updateWishStatus(
  id: string,
  status: WishStatus,
  adminNote: string | null = null,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('update_wish_status', {
    p_id: id,
    p_status: status,
    p_admin_note: adminNote,
  })

  if (error) {
    console.error('Error updating wish status:', error)
    throw error
  }
}
