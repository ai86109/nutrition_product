import { createClient } from '@/utils/supabase/client'
import type { ConversationKind } from '@/types/conversation'

/**
 * 一般使用者送訊息。
 * 走一般 INSERT，靠 RLS conversation_messages_insert_own_user policy 限制：
 *   - sender_id = auth.uid()
 *   - sender_role = 'user'
 *   - 對話的 wish/report 屬於我、且 status in ('planned','in-progress')
 * 內容會在送出前 trim；空字串或超過 1000 字會被 DB constraint 擋下。
 */
export async function createMyConversationMessage(
  kind: ConversationKind,
  id: string,
  senderId: string,
  content: string,
): Promise<void> {
  const supabase = createClient()
  const trimmed = content.trim()

  const payload = {
    wish_id: kind === 'wish' ? id : null,
    report_id: kind === 'report' ? id : null,
    sender_id: senderId,
    sender_role: 'user' as const,
    content: trimmed,
  }

  const { error } = await supabase
    .from('conversation_messages')
    .insert(payload)

  if (error) {
    console.error('Error creating user conversation message:', error)
    throw error
  }
}

/**
 * Admin 送訊息。
 * 走 insert_conversation_message_admin RPC，內部會 assert_caller_is_admin
 * 並檢查對話狀態 != 'completed'。
 */
export async function createAdminConversationMessage(
  kind: ConversationKind,
  id: string,
  content: string,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('insert_conversation_message_admin', {
    p_kind: kind,
    p_id: id,
    p_content: content.trim(),
  })

  if (error) {
    console.error('Error creating admin conversation message:', error)
    throw error
  }
}

/**
 * 標記對話為已讀。
 * 必須帶 viewerRole（'user' | 'admin'），由前端決定要更新哪條指針 —
 * 因為「caller 是 admin」不代表「視角是 admin」（admin 帳號的開發者
 * 也會在 /profile 看自己的對話，那是 user 視角）。
 * - 'user'：更新 last_read_by_user_at，且 RPC 內 where user_id = auth.uid()
 * - 'admin'：更新 last_read_by_admin_at，但 RPC 會 assert_caller_is_admin()
 */
export async function markConversationRead(
  kind: ConversationKind,
  id: string,
  viewerRole: 'user' | 'admin',
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('mark_conversation_read', {
    p_kind: kind,
    p_id: id,
    p_viewer_role: viewerRole,
  })

  if (error) {
    console.error('Error marking conversation as read:', error)
    throw error
  }
}
