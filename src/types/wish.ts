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

/** 使用者「我的許願」用：直接是 wishes 一行（不需要 user_email） */
export type MyWish = Wish
