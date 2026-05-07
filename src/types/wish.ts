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
}
