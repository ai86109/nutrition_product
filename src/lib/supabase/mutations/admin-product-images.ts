import { createClient } from '@/utils/supabase/client'

const BUCKET = 'product-images'

export interface AddProductImageArgs {
  licenseNo: string
  storagePath: string
  width: number
  height: number
  byteSize: number
}

/**
 * 新增圖片紀錄（admin 直送 approved）。
 * SQL 端會檢查每個產品 approved + pending 總和上限 5 張。
 *
 * 注意：此 function 僅寫 DB row。實際 storage 上傳請先呼叫
 *   supabase.storage.from('product-images').upload(path, blob)
 * 完成後再呼叫此 function 把 row 寫進 DB。
 *
 * @returns 新建立的 image id
 */
export async function addProductImage({
  licenseNo,
  storagePath,
  width,
  height,
  byteSize,
}: AddProductImageArgs): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('add_product_image', {
    target_license_no: licenseNo,
    p_storage_path: storagePath,
    p_width: width,
    p_height: height,
    p_byte_size: byteSize,
  })

  if (error) {
    console.error('Error adding product image:', error)
    throw error
  }

  return data as string
}

/**
 * 重新排序某產品的圖片。
 * 傳入的 orderedIds 必須是該產品當前所有 approved + pending 圖片 id 的完整集合，
 * 否則 SQL 端會 raise exception（避免遺漏）。
 */
export async function reorderProductImages(
  licenseNo: string,
  orderedIds: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.rpc('reorder_product_images', {
    target_license_no: licenseNo,
    ordered_ids: orderedIds,
  })

  if (error) {
    console.error('Error reordering product images:', error)
    throw error
  }
}

/**
 * 刪除圖片：先刪 DB row，再刪 storage 物件。
 *
 * 順序刻意選 row → storage：若 storage.remove 失敗，DB row 已不存在，
 * storage 留下的孤兒檔頂多浪費一點空間，比起反過來（row 還在但 storage 已沒了）
 * 造成前端壞圖體驗來得安全。
 *
 * 若極度在意 storage 不留孤兒，未來可加排程清掃 job。
 */
export async function deleteProductImage(imageId: string): Promise<void> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('delete_product_image', {
    image_id: imageId,
  })

  if (error) {
    console.error('Error deleting product image row:', error)
    throw error
  }

  const removedPath = data as string | null
  if (!removedPath) return

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([removedPath])

  if (storageError) {
    // DB row 已刪除成功，storage 失敗只 log，不 throw（避免上層誤以為整體失敗）
    console.warn(
      `Image row deleted but storage object remained (${removedPath}):`,
      storageError
    )
  }
}
