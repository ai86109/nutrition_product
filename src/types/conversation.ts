/**
 * 對話訊息（許願池 / 錯誤回報共用）
 *
 * 對話有兩種 kind：
 *   - 'wish'   → 對應 wishes 表
 *   - 'report' → 對應 product_reports 表
 *
 * 訊息只儲存在單一張 conversation_messages 表，靠 wish_id / report_id
 * 二擇一的 nullable FK 區分。
 */

export type ConversationKind = 'wish' | 'report'

export type ConversationSenderRole = 'user' | 'admin'

/** 一般使用者讀到的訊息（不含 sender_email） */
export interface ConversationMessage {
  id: string
  sender_id: string | null
  sender_role: ConversationSenderRole
  content: string
  created_at: string
}

/** Admin 讀到的訊息（含寄件者 email） */
export interface ConversationMessageAdmin extends ConversationMessage {
  sender_email: string | null
}
