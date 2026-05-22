import { createClient } from '@/utils/supabase/client'

/**
 * 自訂營養品縮圖的 Storage 操作層（私有 bucket + 簽名 URL）。
 *
 * - bucket 私有：顯示一律走 createSignedUrl，產生有時效的網址
 * - 路徑格式：<user_id>/<uuid>.webp，storage RLS 以 foldername[1] = auth.uid() 鎖本人
 * - 上傳的 blob 應已是 compressImage() 壓好的 image/webp
 */
const BUCKET = 'custom-product-images'

/** 簽名 URL 預設有效秒數（1 小時）。詳細 / 列表都是看當下，過期再重抓即可。 */
const DEFAULT_SIGNED_URL_TTL = 60 * 60

/**
 * 上傳一張壓縮後的 webp，回傳存進 DB 的相對路徑。
 * 失敗 throw（caller 負責 toast / rollback）。
 */
export async function uploadCustomProductImage(
  userId: string,
  blob: Blob
): Promise<string> {
  const supabase = createClient()
  const path = `${userId}/${crypto.randomUUID()}.webp`

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/webp',
    upsert: false,
  })

  if (error) {
    console.error('Error uploading custom product image:', error)
    throw error
  }

  return path
}

/**
 * 刪除一張圖（best-effort）。失敗只 warn 不 throw —— 殘留孤兒檔頂多浪費空間，
 * 不應讓上層的「更新成功」變成「失敗」。
 */
export async function deleteCustomProductImage(path: string): Promise<void> {
  if (!path) return
  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) {
    console.warn(`Custom product image remove failed (${path}):`, error)
  }
}

/** 單張簽名 URL；失敗回傳 null。 */
export async function createCustomProductImageSignedUrl(
  path: string,
  expiresIn: number = DEFAULT_SIGNED_URL_TTL
): Promise<string | null> {
  if (!path) return null
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error(`Error creating signed url (${path}):`, error)
    return null
  }
  return data?.signedUrl ?? null
}

/**
 * 批次簽名 URL，回傳 path → signedUrl 的 map（給個人中心列表一次簽多張用）。
 * 失敗的個別項目會被略過。
 */
export async function createCustomProductImageSignedUrls(
  paths: string[],
  expiresIn: number = DEFAULT_SIGNED_URL_TTL
): Promise<Record<string, string>> {
  const map: Record<string, string> = {}
  if (paths.length === 0) return map

  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, expiresIn)

  if (error) {
    console.error('Error creating signed urls:', error)
    return map
  }

  for (const item of data ?? []) {
    if (item.path && item.signedUrl) {
      map[item.path] = item.signedUrl
    }
  }
  return map
}
