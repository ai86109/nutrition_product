import { createClient } from '@/utils/supabase/client'
import { createClientForServer } from '@/utils/supabase/server'
import type {
  ConversationKind,
  ConversationMessage,
  ConversationMessageAdmin,
} from '@/types/conversation'

/**
 * 一般使用者：列出自己對話的訊息（依時間正序，老的在上、新的在下，便於聊天 UI）。
 * 走一般 SELECT，靠 RLS conversation_messages_select_own_user policy 過濾。
 */
export async function listMyConversationMessages(
  kind: ConversationKind,
  id: string,
): Promise<ConversationMessage[]> {
  const supabase = createClient()
  const column = kind === 'wish' ? 'wish_id' : 'report_id'

  const { data, error } = await supabase
    .from('conversation_messages')
    .select('id, sender_id, sender_role, content, created_at')
    .eq(column, id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error listing my conversation messages:', error)
    return []
  }

  return (data ?? []) as ConversationMessage[]
}

/**
 * Admin：列出某對話的所有訊息（含寄件者 email）。
 * 走 list_conversation_messages_admin RPC（SECURITY DEFINER + assert_caller_is_admin）。
 */
export async function listConversationMessagesAdmin(
  kind: ConversationKind,
  id: string,
): Promise<ConversationMessageAdmin[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('list_conversation_messages_admin', {
    p_kind: kind,
    p_id: id,
  })

  if (error) {
    console.error('Error listing admin conversation messages:', error)
    return []
  }

  return (data ?? []) as ConversationMessageAdmin[]
}

/**
 * 個人中心 nav bar 紅點用：使用者所有未讀訊息總數。
 * 走 get_my_total_unread_count RPC（SECURITY INVOKER）。
 */
export async function getMyTotalUnreadCount(): Promise<number> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_my_total_unread_count')

  if (error) {
    console.error('Error fetching my total unread count:', error)
    return 0
  }

  return (data as number | null) ?? 0
}

/**
 * 同上，但給 server component（layout / nav-on-server）使用。
 */
export async function getMyTotalUnreadCountServer(): Promise<number> {
  const supabase = await createClientForServer()
  const { data, error } = await supabase.rpc('get_my_total_unread_count')

  if (error) {
    console.error('Error fetching my total unread count (server):', error)
    return 0
  }

  return (data as number | null) ?? 0
}

/**
 * Admin nav bar 紅點用：admin 端所有未讀訊息總數。
 * 走 get_admin_total_unread_count RPC（SECURITY DEFINER + assert）。
 */
export async function getAdminTotalUnreadCount(): Promise<number> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_admin_total_unread_count')

  if (error) {
    console.error('Error fetching admin total unread count:', error)
    return 0
  }

  return (data as number | null) ?? 0
}
