import { createClient } from '@/utils/supabase/client'
import { createClientForServer } from '@/utils/supabase/server'
import type {
  MyProductReport,
  ProductReportStatus,
  ProductReportWithMeta,
} from '@/types/product-report'

/**
 * Admin 列表：列出所有 product_report，依時間倒序。
 * 走 list_product_reports RPC（SECURITY DEFINER + assert_caller_is_admin）。
 */
export async function listProductReports(
  status: ProductReportStatus | null = null,
): Promise<ProductReportWithMeta[]> {
  const supabase = await createClientForServer()
  const { data, error } = await supabase.rpc('list_product_reports', {
    p_status: status,
  })

  if (error) {
    console.error('Error listing product reports:', error)
    return []
  }

  return (data ?? []) as ProductReportWithMeta[]
}

/**
 * 待處理 report 數量。判定：status = 'planned'。
 * 走 RPC，避免 client / server 兩邊各寫一份條件。
 */
export async function getPendingProductReportCount(): Promise<number> {
  const supabase = await createClientForServer()
  const { data, error } = await supabase.rpc('get_pending_product_report_count')

  if (error) {
    console.error('Error fetching pending product report count:', error)
    return 0
  }

  return (data as number | null) ?? 0
}

/**
 * 個人中心：列出登入使用者自己回報的問題，依時間倒序。含 unread_count + 產品名。
 * 走 list_my_product_reports RPC（SECURITY INVOKER；product_reports_select_own
 * RLS 仍然過濾）。
 */
export async function listMyProductReports(): Promise<MyProductReport[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('list_my_product_reports')

  if (error) {
    console.error('Error listing my product reports:', error)
    return []
  }

  return (data ?? []) as MyProductReport[]
}
