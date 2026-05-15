export type WishStatus = 'planned' | 'in-progress' | 'completed'

export interface Wish {
  id: string
  user_id: string | null
  content: string
  status: WishStatus
  admin_note: string | null
  created_at: string
  updated_at: string
}

/** Admin 列表用：含許願者 email（join auth.users 後取得，可能為 null） */
export interface WishWithUser extends Wish {
  user_email: string | null
  /** 對 admin 而言：user 寫的、且 created_at > last_read_by_admin_at 的訊息數 */
  unread_count: number
}

/** 使用者「我的許願」用：含 unread_count（admin 寫給我的、未讀的訊息數） */
export interface MyWish extends Wish {
  unread_count: number
}
