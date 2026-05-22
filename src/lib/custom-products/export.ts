import {
  CUSTOM_PRODUCT_EXPORT_FORMAT,
  CUSTOM_PRODUCT_EXPORT_VERSION,
  type CustomProductExportFile,
  type CustomProductExportItem,
} from './schema'
import type { CustomProductWithVariants } from '@/types/custom-product'

/**
 * 自訂營養品匯出（P7）。
 *
 * 格式為精簡版（與 schema.ts 的 CustomProductExportFileSchema 對齊）：
 *   - product 不含 weight_unit（import 由 form 推導）
 *   - nutrition 為 token -> 數值（單位由 token 補回）
 *   - variant 不含 sort_order（import 由陣列順序補）
 *   - image_base64 選填，有圖才帶
 *
 * 這裡只做純資料轉換 + 觸發下載；圖片的 base64 由 caller 先抓好傳進來
 * （downloadCustomProductImageAsDataUrl），保持本檔無 I/O、好測。
 */

/** 單一產品 → 匯出 item。imageBase64 有值才會帶 image_base64。 */
export function toExportItem(
  p: CustomProductWithVariants,
  imageBase64?: string | null
): CustomProductExportItem {
  const nutrition: Record<string, number> = {}
  for (const [key, entry] of Object.entries(p.nutrition_facts ?? {})) {
    if (entry && Number.isFinite(entry.value)) {
      nutrition[key] = entry.value
    }
  }

  const variants = [...p.variants]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v) => ({
      quantity: v.quantity,
      volume: v.volume,
      unit: v.unit,
      is_default: v.is_default,
    }))

  return {
    product: {
      name_zh: p.name_zh,
      name_en: p.name_en ?? null,
      brand: p.brand,
      form: p.form,
      standard_weight: p.standard_weight,
      nutrition,
      ...(imageBase64 ? { image_base64: imageBase64 } : {}),
    },
    variants,
  }
}

/** 把 items 包成一份匯出檔（補 format / version / exported_at）。 */
export function buildCustomProductExportFile(
  items: CustomProductExportItem[]
): CustomProductExportFile {
  return {
    format: CUSTOM_PRODUCT_EXPORT_FORMAT,
    version: CUSTOM_PRODUCT_EXPORT_VERSION,
    exported_at: new Date().toISOString(),
    products: items,
  }
}

/** 把字串清成可用的檔名片段（去掉路徑/控制字元，限長度）。 */
function sanitizeFilenamePart(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '') // 檔名非法字元
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50)
}

/** 單筆匯出檔名：<產品名>.nutribase.json */
export function singleExportFilename(nameZh: string): string {
  const safe = sanitizeFilenamePart(nameZh) || 'custom-product'
  return `${safe}.nutribase.json`
}

/** 全部匯出檔名：nutribase-custom-products-YYYYMMDD.json */
export function allExportFilename(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `nutribase-custom-products-${y}${m}${d}.json`
}

/** 觸發瀏覽器下載一份 JSON 檔。 */
export function downloadJsonFile(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
