import { createClientForServer } from '@/utils/supabase/server'
import {
  formatProductData,
  formatProductList,
  formatProductDetail,
  formatCustomProductList,
  formatCustomProductDetail,
} from './product-processor'
import type { ProductImagePublic } from '@/types/product-images'
import type { CustomProductWithVariants } from '@/types/custom-product'

const PRODUCT_IMAGES_BUCKET = 'product-images'
const CUSTOM_PRODUCT_IMAGES_BUCKET = 'custom-product-images'

// 從 join 進來的 product_images row 形狀（最少需要的欄位）
interface RawProductImageRow {
  id: string
  storage_path: string
  display_order: number
  width: number | null
  height: number | null
}

/**
 * 判斷 id 是否為 v4 UUID 字串（自訂產品 id 是 uuid，FDA license_no 是中文 + 數字）。
 * 寬鬆寫法接受任何 RFC 4122 形狀，不只 v4，足夠用來分流。
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const isUuid = (s: string): boolean => UUID_REGEX.test(s)

/**
 * 取目前 user 的未刪除自訂產品（含 variants）。
 * 未登入時 RLS 會返回空陣列。
 */
async function getCustomProductsForCurrentUser(): Promise<CustomProductWithVariants[]> {
  try {
    const supabase = await createClientForServer()
    const { data, error } = await supabase
      .from('user_custom_products')
      .select(`*, variants:user_custom_variants(*)`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Custom products fetch error:', error)
      return []
    }
    return (data ?? []) as CustomProductWithVariants[]
  } catch (error) {
    console.error('Error fetching custom products from Supabase:', error)
    return []
  }
}

/**
 * 取目前 user 的單一自訂產品（含 variants）。
 * 未登入或非本人 RLS 會擋下，回傳 null。
 */
async function getCustomProductForCurrentUser(
  id: string
): Promise<CustomProductWithVariants | null> {
  try {
    const supabase = await createClientForServer()
    const { data, error } = await supabase
      .from('user_custom_products')
      .select(`*, variants:user_custom_variants(*)`)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Custom product detail fetch error:', error)
      return null
    }
    return (data ?? null) as CustomProductWithVariants | null
  } catch (error) {
    console.error(`Error fetching custom product detail (${id}):`, error)
    return null
  }
}

// 清單用：DB 端過濾掉沒 nutrition_facts 的產品，且不抓 nutrition_facts/standard_weight 欄位以降低 payload
// 自訂產品另外撈一次後合併（並行 fetch，未登入時 RLS 返回空陣列）
export async function getProductListFromSupabase() {
  try {
    const supabase = await createClientForServer()
    const [{ data: products, error }, customProducts] = await Promise.all([
      supabase
        .from('products')
        .select(`license_no, name_zh, name_en, brand, form, is_approved, product_status, categories, product_variants (*)`)
        .not('nutrition_facts', 'is', null),
      getCustomProductsForCurrentUser(),
    ])

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    const publicList = formatProductList(products)
    const customList = formatCustomProductList(customProducts)
    // 自訂放最前面，方便用戶搜尋時優先看到自己加的
    return [...customList, ...publicList]
  } catch (error) {
    console.error('Error fetching product list from Supabase:', error)
    return []
  }
}

// 詳細用：單筆查詢，回傳完整 nutrition 資料 + 圖片清單
//   product_images 用 LEFT JOIN（沒圖的產品仍會回傳，images 為空陣列）
//   .eq filter 對 foreign table 做欄位篩選；RLS 端也會擋 non-approved，雙保險
//   id 若為 UUID 則走自訂產品路徑；否則為 FDA license_no
export async function getProductDetailFromSupabase(id: string) {
  // 自訂產品（UUID）走獨立路徑
  if (isUuid(id)) {
    const customProduct = await getCustomProductForCurrentUser(id)
    if (!customProduct) return null

    // 私有 bucket：用 createSignedUrl 產生有時效網址，沿用 ApiProductData.images 顯示
    let images: ProductImagePublic[] = []
    if (customProduct.image_path) {
      const supabase = await createClientForServer()
      const { data } = await supabase.storage
        .from(CUSTOM_PRODUCT_IMAGES_BUCKET)
        .createSignedUrl(customProduct.image_path, 60 * 60)
      if (data?.signedUrl) {
        images = [
          { id: customProduct.id, publicUrl: data.signedUrl, width: null, height: null },
        ]
      }
    }

    return formatCustomProductDetail(customProduct, images)
  }

  try {
    const supabase = await createClientForServer()
    const { data: product, error } = await supabase
      .from('products')
      .select(
        `*,
         product_variants (*),
         product_images (id, storage_path, display_order, width, height)`
      )
      .eq('license_no', id)
      .eq('product_images.status', 'approved')
      .order('display_order', { referencedTable: 'product_images', ascending: true })
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // 把 storage_path 轉成 publicUrl
    const rawImages = (product?.product_images ?? []) as RawProductImageRow[]
    const images: ProductImagePublic[] = rawImages.map((img) => ({
      id: img.id,
      publicUrl: supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .getPublicUrl(img.storage_path).data.publicUrl,
      width: img.width,
      height: img.height,
    }))

    return formatProductDetail(product, images)
  } catch (error) {
    console.error(`Error fetching product detail (${id}) from Supabase:`, error)
    return null
  }
}

/**
 * 取得 products 表最後同步時間，給 footer 顯示「資料最後同步」。
 * 優先用 updated_at，欄位不存在則 fallback 到 created_at；都查不到回傳 null（footer 就不顯示日期）。
 */
export async function getProductsLastSyncedAt(): Promise<string | null> {
  const supabase = await createClientForServer()

  // 嘗試 updated_at
  const updatedResult = await supabase
    .from('products')
    .select('updated_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!updatedResult.error) {
    const row = updatedResult.data as { updated_at?: string | null } | null
    if (row?.updated_at) return row.updated_at
  }

  // fallback created_at
  const createdResult = await supabase
    .from('products')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!createdResult.error) {
    const row = createdResult.data as { created_at?: string | null } | null
    if (row?.created_at) return row.created_at
  }

  return null
}

// 保留舊函式，供既有程式碼相容（首頁已改用 getProductListFromSupabase；這個只剩潛在 caller / 測試會用）
export async function getProductFromSupabase() {
  try {
    const supabase = await createClientForServer()
    const { data: products, error } = await supabase
      .from('products')
      .select(`*, product_variants (*)`)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return formatProductData(products)
  } catch (error) {
    console.error('Error fetching products from Supabase:', error)
    return []
  }
}