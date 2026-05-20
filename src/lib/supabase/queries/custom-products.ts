import { createClient } from '@/utils/supabase/client'
import type {
  CustomProduct,
  CustomProductVariant,
  CustomProductWithVariants,
} from '@/types/custom-product'

/**
 * 取得目前 user 全部「未刪除」自訂營養品，含 variants。
 *
 * - RLS 已限制只看得到自己的列，所以不用再帶 user_id 條件
 * - variant 按 sort_order asc 排序
 * - 失敗時回傳 []，error 進 console（沿用既有 query pattern）
 */
export async function listActiveCustomProducts(): Promise<
  CustomProductWithVariants[]
> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_custom_products')
    .select(
      `
        *,
        variants:user_custom_variants(*)
      `
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active custom products:', error)
    return []
  }

  return sortVariants((data ?? []) as CustomProductWithVariants[])
}

/**
 * 取得目前 user 全部自訂產品（含已 soft-delete），含 variants。
 *
 * 用途：snapshot 反查時，即使原始自訂產品已軟刪除，仍需查得到名字 / variants
 * 以還原當時的計算（不過 snapshot.selected_products 本來就有凍結資料，所以這
 * 個函式主要是給「個人中心切換顯示已刪除」這類場景）。
 */
export async function listAllCustomProducts(): Promise<
  CustomProductWithVariants[]
> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_custom_products')
    .select(
      `
        *,
        variants:user_custom_variants(*)
      `
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all custom products:', error)
    return []
  }

  return sortVariants((data ?? []) as CustomProductWithVariants[])
}

/**
 * 依 id 取單一自訂產品（含 variants）。
 * 找不到回傳 null（含已刪除）。
 */
export async function getCustomProductById(
  id: string
): Promise<CustomProductWithVariants | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_custom_products')
    .select(
      `
        *,
        variants:user_custom_variants(*)
      `
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching custom product by id:', error)
    return null
  }
  if (!data) return null

  return sortVariantsOne(data as CustomProductWithVariants)
}

/**
 * 統計目前 user 未刪除的自訂產品數量。
 *
 * 給 UI 顯示「n / MAX_CUSTOM_PRODUCTS」，以及 import 流程預判剩餘額度用。
 * mutation 內部會再做一次權威性 cap 檢查；這個只是 UI 友善顯示。
 */
export async function countActiveCustomProducts(): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('user_custom_products')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  if (error) {
    console.error('Error counting custom products:', error)
    return 0
  }
  return count ?? 0
}

// ---------------------------------------------------------------------
// 私有 helpers
// ---------------------------------------------------------------------

/**
 * Supabase 巢狀 select 取出來的 variants 順序不保證，這邊強制依 sort_order asc，
 * 同 sort_order 再用 created_at asc 當 tiebreaker（穩定排序）。
 */
function sortVariants(
  products: CustomProductWithVariants[]
): CustomProductWithVariants[] {
  return products.map(sortVariantsOne)
}

function sortVariantsOne(
  product: CustomProductWithVariants
): CustomProductWithVariants {
  const variants = [...(product.variants ?? [])].sort(compareVariantOrder)
  return { ...product, variants }
}

function compareVariantOrder(
  a: CustomProductVariant,
  b: CustomProductVariant
): number {
  if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
  return a.created_at.localeCompare(b.created_at)
}

// 把 CustomProduct 也 export 一個型別 alias，方便 caller 不用同時 import types
export type { CustomProduct }
