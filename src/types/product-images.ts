/**
 * Product image 型別（admin layer，snake_case 對應 RPC 回傳）
 *
 * 設計備註：
 *   - source / status 欄位為未來「使用者上傳→admin 審核」流程預留。
 *     目前 admin 直接上傳，全部走 source='admin' / status='approved'。
 *   - storage_path 為 product-images bucket 內的相對路徑，
 *     不含 bucket 前綴，例：'A012345678/<uuid>.webp'。
 */

export type ProductImageStatus = 'pending' | 'approved' | 'rejected'
export type ProductImageSource = 'admin' | 'user'

/** RPC get_product_images 直接回傳的 row 形狀 */
export interface ProductImageRow {
  id: string
  license_no: string
  storage_path: string
  display_order: number
  status: ProductImageStatus
  source: ProductImageSource
  width: number | null
  height: number | null
  byte_size: number | null
  created_at: string
}

/** Wrapper 補上 storage public URL 後的形狀，給 component 使用 */
export interface ProductImageWithUrl extends ProductImageRow {
  publicUrl: string
}

/** 每個產品最多可上傳的有效圖片數（approved + pending），與 SQL 端一致 */
export const PRODUCT_IMAGE_MAX_COUNT = 5

/**
 * 公開頁面（產品 dialog / Lightbox）使用的圖片型別。
 * 不含 admin 相關欄位（status / source / 等），避免不必要的資訊外洩到前端。
 * publicUrl 在 server 端用 supabase.storage.getPublicUrl() 預先算好。
 */
export interface ProductImagePublic {
  id: string
  publicUrl: string
  width: number | null
  height: number | null
}
