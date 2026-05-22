import {
  CustomProductExportFileSchema,
  CUSTOM_PRODUCT_EXPORT_FORMAT,
  CUSTOM_PRODUCT_EXPORT_VERSION,
  type CustomProductExportFile,
  type CustomProductExportItem,
  type CustomProductExportProduct,
  type CustomProductExportVariant,
} from './schema'
import {
  CUSTOM_PRODUCT_FORM_WEIGHT_UNIT,
  MAX_CUSTOM_PRODUCTS,
  MAX_CUSTOM_PRODUCT_NAME_ZH_LENGTH,
  NUTRIENT_UNITS,
} from '@/utils/constants'
import type {
  CustomProductInput,
  CustomProductVariantInput,
  CustomProductWithVariants,
  NutritionFacts,
} from '@/types/custom-product'
import {
  createCustomProduct,
  updateCustomProduct,
} from '@/lib/supabase/mutations/custom-products'
import {
  uploadCustomProductImage,
  deleteCustomProductImage,
} from '@/lib/supabase/storage/custom-product-images'

/**
 * 自訂營養品匯入（P8）。
 *
 * 流程：解析 + 驗證（與 export 同一份 schema、擋版本） → 預覽（新增/同名衝突）
 *       → 依策略執行（跳過 / 覆蓋 / 建立副本），過程中重建被精簡掉的欄位、
 *       把 base64 圖重新上傳到使用者自己的私有 bucket，並尊重 cap 上限。
 */

export type ConflictStrategy = 'skip' | 'overwrite' | 'copy'

export type ParseResult =
  | { ok: true; file: CustomProductExportFile }
  | { ok: false; error: string }

/** 解析 + 驗證匯入檔。版本/格式不符給友善訊息。 */
export function parseImportFile(text: string): ParseResult {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, error: '檔案不是有效的 JSON' }
  }

  const obj = json as { format?: unknown; version?: unknown }
  if (obj?.format !== CUSTOM_PRODUCT_EXPORT_FORMAT) {
    return { ok: false, error: '這不是 NutriBase 自訂營養品匯出檔' }
  }
  if (obj?.version !== CUSTOM_PRODUCT_EXPORT_VERSION) {
    return {
      ok: false,
      error: `檔案版本不支援（僅支援 v${CUSTOM_PRODUCT_EXPORT_VERSION}）`,
    }
  }

  const parsed = CustomProductExportFileSchema.safeParse(json)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: `檔案格式有誤：${first?.message ?? '驗證失敗'}` }
  }
  return { ok: true, file: parsed.data }
}

/** 衝突判斷鍵：name_zh + brand（去空白、不分大小寫）。 */
function conflictKey(nameZh: string, brand: string): string {
  return `${nameZh.trim().toLowerCase()}|${brand.trim().toLowerCase()}`
}

export interface ImportPreview {
  total: number
  /** 與現有未刪除產品同名（name+brand）的筆數 */
  conflicts: number
  /** 不衝突、會新增的筆數 */
  newItems: number
}

export function previewImport(
  items: CustomProductExportItem[],
  existing: CustomProductWithVariants[]
): ImportPreview {
  const keys = new Set(existing.map((e) => conflictKey(e.name_zh, e.brand)))
  let conflicts = 0
  for (const it of items) {
    if (keys.has(conflictKey(it.product.name_zh, it.product.brand))) conflicts++
  }
  return { total: items.length, conflicts, newItems: items.length - conflicts }
}

/** 精簡 product → 完整 CustomProductInput（補回 weight_unit 與每項 unit）。 */
export function rehydrateProduct(
  p: CustomProductExportProduct
): CustomProductInput {
  const nutrition_facts: NutritionFacts = {}
  for (const [key, value] of Object.entries(p.nutrition)) {
    if (Number.isFinite(value)) {
      nutrition_facts[key] = { unit: NUTRIENT_UNITS[key] ?? '', value }
    }
  }
  return {
    name_zh: p.name_zh,
    name_en: p.name_en ?? null,
    brand: p.brand,
    form: p.form,
    standard_weight: p.standard_weight,
    weight_unit: CUSTOM_PRODUCT_FORM_WEIGHT_UNIT[p.form],
    nutrition_facts,
  }
}

/** 精簡 variants → 完整 input（sort_order 依陣列順序補）。 */
export function rehydrateVariants(
  vs: CustomProductExportVariant[]
): CustomProductVariantInput[] {
  return vs.map((v, idx) => ({
    quantity: v.quantity,
    volume: v.volume,
    unit: v.unit,
    is_default: v.is_default ?? false,
    sort_order: idx,
  }))
}

/** data URL（base64）→ Blob，給重新上傳用。 */
function dataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(',')
  const header = comma >= 0 ? dataUrl.slice(0, comma) : ''
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
  const mime = /data:(.*?);base64/.exec(header)?.[1] ?? 'image/webp'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

/** 「建立副本」時改名，避免與原本同名又一次衝突；超長則截斷。 */
function makeCopyName(name: string): string {
  const suffix = '（副本）'
  if (name.length + suffix.length <= MAX_CUSTOM_PRODUCT_NAME_ZH_LENGTH) {
    return name + suffix
  }
  return name.slice(0, MAX_CUSTOM_PRODUCT_NAME_ZH_LENGTH - suffix.length) + suffix
}

export interface ImportResult {
  added: number
  overwritten: number
  /** 同名且策略為「跳過」而略過 */
  skippedConflict: number
  /** 因達 cap 上限而略過 */
  skippedCap: number
  failed: number
}

/**
 * 執行匯入。逐筆處理（保持檔案順序），單筆失敗不中斷整體。
 * - 覆蓋：更新既有同名產品；檔案有帶圖才換圖（並刪舊圖），沒帶就保留原圖。
 * - 建立副本 / 新增：建立新列，受 cap 限制；超出則略過。
 */
export async function runImport(
  userId: string,
  items: CustomProductExportItem[],
  existing: CustomProductWithVariants[],
  strategy: ConflictStrategy
): Promise<ImportResult> {
  const result: ImportResult = {
    added: 0,
    overwritten: 0,
    skippedConflict: 0,
    skippedCap: 0,
    failed: 0,
  }

  const byKey = new Map<string, CustomProductWithVariants>()
  for (const e of existing) byKey.set(conflictKey(e.name_zh, e.brand), e)

  let count = existing.length

  for (const item of items) {
    const match =
      byKey.get(conflictKey(item.product.name_zh, item.product.brand)) ?? null

    try {
      // ---- 同名衝突 ----
      if (match) {
        if (strategy === 'skip') {
          result.skippedConflict++
          continue
        }
        if (strategy === 'overwrite') {
          const product = rehydrateProduct(item.product)
          const variants = rehydrateVariants(item.variants)
          let imagePath: string | null | undefined = undefined // undefined = 不動原圖
          let oldToDelete: string | null = null
          if (item.product.image_base64) {
            imagePath = await uploadCustomProductImage(
              userId,
              dataUrlToBlob(item.product.image_base64)
            )
            if (match.image_path) oldToDelete = match.image_path
          }
          await updateCustomProduct(match.id, product, variants, imagePath)
          if (oldToDelete) await deleteCustomProductImage(oldToDelete)
          result.overwritten++
          continue
        }
        // strategy === 'copy' → 往下走「建立新列」流程
      }

      // ---- 新增（含 copy）----
      if (count >= MAX_CUSTOM_PRODUCTS) {
        result.skippedCap++
        continue
      }

      const product = rehydrateProduct(item.product)
      if (match && strategy === 'copy') {
        product.name_zh = makeCopyName(product.name_zh)
      }
      const variants = rehydrateVariants(item.variants)

      let imagePath: string | null = null
      if (item.product.image_base64) {
        imagePath = await uploadCustomProductImage(
          userId,
          dataUrlToBlob(item.product.image_base64)
        )
      }

      try {
        await createCustomProduct(userId, product, variants, imagePath)
        count++
        result.added++
      } catch (err) {
        // 圖已上傳但建立失敗 → 清孤兒圖再往外拋
        if (imagePath) await deleteCustomProductImage(imagePath)
        throw err
      }
    } catch (err) {
      console.error('Import item failed:', err)
      result.failed++
    }
  }

  return result
}
