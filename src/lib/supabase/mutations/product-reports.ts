import { createClient } from '@/utils/supabase/client'
import type {
  CreateProductReportInput,
  ProductReportStatus,
} from '@/types/product-report'

/**
 * 一般使用者新增錯誤回報（含未登入）。
 * 走一般 INSERT。RLS：
 *   - anon：必須 user_id IS NULL
 *   - authenticated：必須 user_id = auth.uid()
 * 內容會在送出前 trim；空字串或超過長度會被 DB constraint 擋下。
 */
export async function createProductReport(
  input: CreateProductReportInput,
): Promise<void> {
  const supabase = createClient()
  const trimmedName = input.reporter_name?.trim()
  const { error } = await supabase.from('product_reports').insert({
    product_id: input.product_id,
    user_id: input.user_id,
    reporter_name: trimmedName ? trimmedName : null,
    category: input.category,
    description: input.description.trim(),
  })

  if (error) {
    console.error('Error creating product report:', error)
    throw error
  }
}

/**
 * Admin 更新 report 狀態（含 admin_note）。
 * 走 SECURITY DEFINER RPC，函式內部會 assert_caller_is_admin()。
 */
export async function updateProductReportStatus(
  id: string,
  status: ProductReportStatus,
  adminNote: string | null = null,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('update_product_report_status', {
    p_id: id,
    p_status: status,
    p_admin_note: adminNote,
  })

  if (error) {
    console.error('Error updating product report status:', error)
    throw error
  }
}
