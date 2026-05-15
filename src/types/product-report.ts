export type ProductReportStatus = 'planned' | 'in-progress' | 'completed'

export type ProductReportCategory =
  | 'nutrition'        // 營養品成分有誤
  | 'spec'             // 包裝 / 容量 / 匙數有誤
  | 'classification'   // 營養品分類有誤
  | 'other'            // 其他問題

export interface ProductReport {
  id: string
  product_id: string
  user_id: string | null
  reporter_name: string | null
  category: ProductReportCategory
  description: string
  status: ProductReportStatus
  admin_note: string | null
  created_at: string
  updated_at: string
}

/**
 * Admin 列表用：含產品中文名與回報者 email（join 後取得，可能為 null）。
 * - product_name 為 null：對應的 products row 已被刪除（因 FK on delete cascade，
 *   實務上不會出現 null，但保留欄位以對齊 RPC 回傳型別）。
 * - user_email 為 null：訪客回報，或登入用戶帳號已刪除。
 */
export interface ProductReportWithMeta extends ProductReport {
  product_name: string | null
  user_email: string | null
  /** 對 admin 而言：user 寫的、且 created_at > last_read_by_admin_at 的訊息數 */
  unread_count: number
}

/** 送出 report 時的 payload。user_id 由前端依登入狀態決定。 */
export interface CreateProductReportInput {
  product_id: string
  user_id: string | null
  reporter_name: string | null
  category: ProductReportCategory
  description: string
}

/**
 * 使用者「我回報的問題」用：含產品中文名（透過 supabase 內嵌查詢取得）。
 * 不含 user_email、reporter_name 等 admin 才需要的欄位。
 * product_name 可能為 null：對應產品已被刪除（FK on delete cascade，
 *   實務上看不到，但保留欄位以對齊 supabase response 型別）。
 */
export interface MyProductReport extends ProductReport {
  product_name: string | null
  /** admin 寫給我的、未讀的訊息數 */
  unread_count: number
}
