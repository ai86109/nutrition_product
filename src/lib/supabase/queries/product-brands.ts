import { createClient } from '@/utils/supabase/client'

/**
 * 取得目錄（products 表）所有「現有品牌」的去重名單，依出現次數多到少排序。
 *
 * 給沒有 ProductProvider 的頁面（例如 /profile 個人中心）用來填自訂營養品表單的
 * 品牌下拉建議。來源與首頁 brandOptions 一致：同樣只算有 nutrition_facts 的產品，
 * RLS 會限制只看得到已核准產品。失敗時回傳 []。
 */
export async function listProductBrandNames(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('brand')
    .not('nutrition_facts', 'is', null)

  if (error) {
    console.error('Error fetching product brand names:', error)
    return []
  }

  const counts = new Map<string, number>()
  for (const row of (data ?? []) as { brand: string | null }[]) {
    const brand = row.brand?.trim()
    if (!brand) continue
    counts.set(brand, (counts.get(brand) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([brand]) => brand)
}
