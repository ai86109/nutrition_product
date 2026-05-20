import { createClient } from '@/utils/supabase/client'
import type {
  CustomProduct,
  CustomProductInput,
  CustomProductVariant,
  CustomProductVariantInput,
  CustomProductWithVariants,
} from '@/types/custom-product'
import { CapLimitError } from '@/lib/errors'
import { MAX_CUSTOM_PRODUCTS } from '@/utils/constants'

/**
 * 建立自訂營養品 + 一組以上 variants。
 *
 * Atomicity 注意：
 *   product insert 與 variants insert 是兩個獨立呼叫，理論上有 partial-fail
 *   風險（product 已建好但 variants 失敗）。沿用既有 mutation 的 client-side
 *   pattern；若日後需要嚴格交易，改寫成 RPC + transaction。發生 variants
 *   失敗時這裡會主動 rollback product（best-effort delete）。
 *
 * Cap：未軟刪除的產品數達 MAX_CUSTOM_PRODUCTS 時 throw CapLimitError。
 */
export async function createCustomProduct(
  userId: string,
  product: CustomProductInput,
  variants: CustomProductVariantInput[]
): Promise<CustomProductWithVariants> {
  if (variants.length === 0) {
    throw new Error('至少需要一組包裝規格')
  }

  const supabase = createClient()

  // ---- 1) Cap 檢查（只算未軟刪除的）
  const { count, error: countError } = await supabase
    .from('user_custom_products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null)
  if (countError) {
    console.error('Error counting custom products:', countError)
    throw countError
  }
  if (count !== null && count >= MAX_CUSTOM_PRODUCTS) {
    throw new CapLimitError(
      `自訂營養品已達上限 ${MAX_CUSTOM_PRODUCTS} 筆，請先刪除其他自訂產品`
    )
  }

  // ---- 2) 建 product
  const { data: productRow, error: productError } = await supabase
    .from('user_custom_products')
    .insert({
      user_id: userId,
      name_zh: product.name_zh.trim(),
      name_en: product.name_en?.trim() || null,
      brand: product.brand.trim(),
      form: product.form,
      standard_weight: product.standard_weight,
      weight_unit: product.weight_unit,
      nutrition_facts: product.nutrition_facts,
      notes: product.notes?.trim() || null,
    })
    .select()
    .single()

  if (productError) {
    console.error('Error creating custom product:', productError)
    throw productError
  }

  const createdProduct = productRow as CustomProduct

  // ---- 3) 建 variants（保證 default 唯一性 + sort_order 連續）
  const normalizedVariants = normalizeVariants(variants).map((v) => ({
    custom_product_id: createdProduct.id,
    quantity: v.quantity,
    volume: v.volume,
    unit: v.unit.trim(),
    is_default: v.is_default ?? false,
    sort_order: v.sort_order ?? 0,
  }))

  const { data: variantRows, error: variantsError } = await supabase
    .from('user_custom_variants')
    .insert(normalizedVariants)
    .select()

  if (variantsError) {
    // Best-effort rollback：把剛建好的 product 刪掉（不靠 cascade 因為沒 variants）
    await supabase.from('user_custom_products').delete().eq('id', createdProduct.id)
    console.error('Error creating custom variants, rolled back product:', variantsError)
    throw variantsError
  }

  return {
    ...createdProduct,
    variants: (variantRows ?? []) as CustomProductVariant[],
  }
}

/**
 * 更新自訂產品本體 + variants（變更策略：variants 整批替換）。
 *
 * 為什麼整批替換：variant 沒有獨立業務 id 可被外部引用（snapshot 直接凍結 data），
 * 所以最簡單也最安全的策略就是 DELETE FROM variants WHERE product_id = X，再
 * batch INSERT 新的。這樣不會留孤兒 row、不需 reconcile UI 順序。
 *
 * RLS 已限制只能改自己的 row。
 */
export async function updateCustomProduct(
  productId: string,
  product: CustomProductInput,
  variants: CustomProductVariantInput[]
): Promise<CustomProductWithVariants> {
  if (variants.length === 0) {
    throw new Error('至少需要一組包裝規格')
  }

  const supabase = createClient()

  // ---- 1) update product
  const { data: productRow, error: productError } = await supabase
    .from('user_custom_products')
    .update({
      name_zh: product.name_zh.trim(),
      name_en: product.name_en?.trim() || null,
      brand: product.brand.trim(),
      form: product.form,
      standard_weight: product.standard_weight,
      weight_unit: product.weight_unit,
      nutrition_facts: product.nutrition_facts,
      notes: product.notes?.trim() || null,
    })
    .eq('id', productId)
    .select()
    .single()

  if (productError) {
    console.error('Error updating custom product:', productError)
    throw productError
  }
  const updatedProduct = productRow as CustomProduct

  // ---- 2) replace variants
  const { error: delError } = await supabase
    .from('user_custom_variants')
    .delete()
    .eq('custom_product_id', productId)
  if (delError) {
    console.error('Error clearing custom variants:', delError)
    throw delError
  }

  const normalizedVariants = normalizeVariants(variants).map((v) => ({
    custom_product_id: productId,
    quantity: v.quantity,
    volume: v.volume,
    unit: v.unit.trim(),
    is_default: v.is_default ?? false,
    sort_order: v.sort_order ?? 0,
  }))

  const { data: variantRows, error: variantsError } = await supabase
    .from('user_custom_variants')
    .insert(normalizedVariants)
    .select()
  if (variantsError) {
    console.error('Error inserting replacement custom variants:', variantsError)
    throw variantsError
  }

  return {
    ...updatedProduct,
    variants: (variantRows ?? []) as CustomProductVariant[],
  }
}

/**
 * 軟刪除：設定 deleted_at = now()。
 *
 * - 不真的刪除 row，歷史 snapshot 反查時還拿得到
 * - 軟刪除後不再計入 cap、不再出現在搜尋
 * - 後續同名匯入會略過（衝突偵測仍會比對已刪除產品的 name_zh + brand —— P8 再決定要不要）
 */
export async function softDeleteCustomProduct(productId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('user_custom_products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', productId)

  if (error) {
    console.error('Error soft deleting custom product:', error)
    throw error
  }
}

/**
 * 還原軟刪除：清掉 deleted_at。
 *
 * 還原時會再次檢查 cap，避免「刪掉某筆 → 新增到上限 → 再還原」突破限制。
 */
export async function restoreCustomProduct(
  userId: string,
  productId: string
): Promise<void> {
  const supabase = createClient()

  const { count, error: countError } = await supabase
    .from('user_custom_products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null)
  if (countError) {
    console.error('Error counting custom products on restore:', countError)
    throw countError
  }
  if (count !== null && count >= MAX_CUSTOM_PRODUCTS) {
    throw new CapLimitError(
      `自訂營養品已達上限 ${MAX_CUSTOM_PRODUCTS} 筆，無法還原此產品`
    )
  }

  const { error } = await supabase
    .from('user_custom_products')
    .update({ deleted_at: null })
    .eq('id', productId)

  if (error) {
    console.error('Error restoring custom product:', error)
    throw error
  }
}

/**
 * 硬刪除：徹底刪掉 product + cascade 砍 variants。
 *
 * 目前沒有 UI 入口（個人中心只給軟刪除）；保留給未來「清理已刪除」或匯入衝突
 * 「覆蓋」流程用。呼叫前注意：底下 snapshot 的 product_id 會變孤兒 reference
 * （但因為 snapshot.selected_products 是 frozen jsonb，仍然顯示得出來）。
 */
export async function hardDeleteCustomProduct(productId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('user_custom_products')
    .delete()
    .eq('id', productId)

  if (error) {
    console.error('Error hard deleting custom product:', error)
    throw error
  }
}

// ---------------------------------------------------------------------
// 私有 helpers
// ---------------------------------------------------------------------

/**
 * Variant 標準化：
 * - sort_order：依輸入順序補 0..n-1（caller 沒指定時）
 * - is_default：如果整組都 false，把第一筆設為 true（保證唯一 default index 不會空）
 *               如果多筆 true，只留第一個（Zod 已先擋，這裡是保險）
 */
function normalizeVariants(
  variants: CustomProductVariantInput[]
): CustomProductVariantInput[] {
  // Step 1: 補 sort_order；多個 is_default 只保留第一個
  let firstDefaultSeen = false
  const normalized = variants.map((v, idx) => {
    let isDefault = v.is_default ?? false
    if (isDefault) {
      if (firstDefaultSeen) isDefault = false
      else firstDefaultSeen = true
    }
    return {
      ...v,
      is_default: isDefault,
      sort_order: v.sort_order ?? idx,
    }
  })

  // Step 2: 若整組都不是 default，把第一筆設為 default（保證每個產品恰好一組 default）
  if (normalized.length > 0 && !normalized.some((v) => v.is_default)) {
    normalized[0] = { ...normalized[0], is_default: true }
  }

  return normalized
}
