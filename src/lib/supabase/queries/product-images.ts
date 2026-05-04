import { createClient } from '@/utils/supabase/client'
import type {
  ProductImageRow,
  ProductImageWithUrl,
} from '@/types/product-images'

const BUCKET = 'product-images'

/**
 * 取得某產品所有圖片（admin 用，含 pending / rejected）。
 * 走 RPC get_product_images，admin 權限檢查在 SQL 端。
 *
 * 回傳已附上 storage public URL，可直接餵給 <img src>。
 */
export async function getProductImages(
  licenseNo: string
): Promise<ProductImageWithUrl[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_product_images', {
    target_license_no: licenseNo,
  })

  if (error) {
    console.error('Error fetching product images:', error)
    throw error
  }

  const rows = (data ?? []) as ProductImageRow[]

  return rows.map((row) => {
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(row.storage_path)
    return { ...row, publicUrl: urlData.publicUrl }
  })
}
