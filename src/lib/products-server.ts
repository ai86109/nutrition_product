import { createClientForServer } from '@/utils/supabase/server'
import { formatProductData, formatProductList, formatProductDetail } from './product-processor'
import type { ProductImagePublic } from '@/types/product-images'

const PRODUCT_IMAGES_BUCKET = 'product-images'

// 從 join 進來的 product_images row 形狀（最少需要的欄位）
interface RawProductImageRow {
  id: string
  storage_path: string
  display_order: number
  width: number | null
  height: number | null
}

// 清單用：DB 端過濾掉沒 nutrition_facts 的產品，且不抓 nutrition_facts/standard_weight 欄位以降低 payload
export async function getProductListFromSupabase() {
  try {
    const supabase = await createClientForServer()
    const { data: products, error } = await supabase
      .from('products')
      .select(`license_no, name_zh, name_en, brand, form, is_approved, product_status, categories, product_variants (*)`)
      .not('nutrition_facts', 'is', null)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return formatProductList(products)
  } catch (error) {
    console.error('Error fetching product list from Supabase:', error)
    return []
  }
}

// 詳細用：單筆查詢，回傳完整 nutrition 資料 + 圖片清單
//   product_images 用 LEFT JOIN（沒圖的產品仍會回傳，images 為空陣列）
//   .eq filter 對 foreign table 做欄位篩選；RLS 端也會擋 non-approved，雙保險
export async function getProductDetailFromSupabase(id: string) {
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

// 保留舊函式，供既有程式碼相容
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