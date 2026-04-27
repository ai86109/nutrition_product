import { createClientForServer } from '@/utils/supabase/server'
import { formatProductData, formatProductList, formatProductDetail } from './product-processor'

// 清單用：DB 端過濾掉沒 nutrition_facts 的產品，且不抓 nutrition_facts/standard_weight 欄位以降低 payload
export async function getProductListFromSupabase() {
  try {
    const supabase = await createClientForServer()
    const { data: products, error } = await supabase
      .from('products')
      .select(`license_no, name_zh, name_en, brand, form, is_approved, categories, product_variants (*)`)
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

// 詳細用：單筆查詢，回傳完整 nutrition 資料
export async function getProductDetailFromSupabase(id: string) {
  try {
    const supabase = await createClientForServer()
    const { data: product, error } = await supabase
      .from('products')
      .select(`*, product_variants (*)`)
      .eq('license_no', id)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return formatProductDetail(product)
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