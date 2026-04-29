import { createClientForServer } from '@/utils/supabase/server'
import type { ProductCategory } from '@/utils/product-categories'

export type ProductStatus = 'active' | 'inactive' | 'extension_pending'

// Re-export 共用 type，讓既有 mutation/component 的 import path 不需改
export type { ProductCategory }

/** 顯示用的衍生狀態：當 nutrition_facts 為空時用 pending_review，UI 會顯示「待處理」並 disable 編輯 */
export type ProductDisplayStatus = ProductStatus | 'pending_review'

export interface AdminProductListItem {
  license_no: string
  name_zh: string | null
  name_en: string | null
  brand: string | null
  categories: ProductCategory[] | null
  is_approved: boolean | null
  license_expiry_date: string | null
  product_status: ProductStatus | null
  has_nutrition_facts: boolean
}

export async function getAdminProductList(): Promise<AdminProductListItem[]> {
  const supabase = await createClientForServer()
  const { data, error } = await supabase.rpc('get_admin_product_list')

  if (error) {
    console.error('Error fetching admin product list:', error)
    return []
  }

  return (data ?? []) as AdminProductListItem[]
}

/**
 * 待處理產品數量。
 * 判定：product_status = 'active' AND (nutrition_facts IS NULL OR = '{}')
 * 走 RPC 確保條件跟 DB 端一致，避免 client / server 兩邊各寫一份易飄移。
 */
export async function getPendingProductCount(): Promise<number> {
  const supabase = await createClientForServer()
  const { data, error } = await supabase.rpc('get_pending_product_count')

  if (error) {
    console.error('Error fetching pending product count:', error)
    return 0
  }

  return (data as number | null) ?? 0
}
