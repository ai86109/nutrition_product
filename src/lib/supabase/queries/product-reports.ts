import { createClient } from '@/utils/supabase/client'
import { createClientForServer } from '@/utils/supabase/server'
import type {
  MyProductReport,
  ProductReport,
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
 * 個人中心：列出登入使用者自己回報的問題，依時間倒序。
 * 走一般 SELECT + supabase 內嵌查詢取產品中文名（products 表本來就公開）。
 * 靠 RLS 的 product_reports_select_own policy 過濾（auth.uid() = user_id）。
 */
export async function listMyProductReports(
  userId: string,
): Promise<MyProductReport[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('product_reports')
    .select('*, products(name_zh)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error listing my product reports:', error)
    return []
  }

  // supabase 內嵌查詢 1:1 關聯：products 會是 { name_zh } | null
  type Row = ProductReport & {
    products: { name_zh: string | null } | null
  }

  return ((data ?? []) as Row[]).map((row) => {
    const { products, ...rest } = row
    return {
      ...rest,
      product_name: products?.name_zh ?? null,
    }
  })
}
