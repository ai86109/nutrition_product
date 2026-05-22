import { z } from 'zod'
import {
  CUSTOM_PRODUCT_FORMS,
  CUSTOM_PRODUCT_REQUIRED_NUTRIENTS,
  CUSTOM_PRODUCT_WEIGHT_UNITS,
  MAX_CUSTOM_PRODUCT_BRAND_LENGTH,
  MAX_CUSTOM_PRODUCT_NAME_EN_LENGTH,
  MAX_CUSTOM_PRODUCT_NAME_ZH_LENGTH,
  MAX_CUSTOM_PRODUCT_VARIANT_UNIT_LENGTH,
} from '@/utils/constants'

/**
 * 自訂營養品的表單與 import 共用驗證 schema。
 *
 * 設計重點：
 * - nutrition_facts 強制含 4 項基本營養素（calories / protein / carbohydrates / fat），
 *   其他微量元素可以省略；對應使用者選的「只填必要 + 可選擇性填」策略。
 * - variants 至少 1 組，恰好 1 組 is_default = true（如全部為 false 則第一筆視為 default）。
 *   variant 數量上限：DB 不擋（依 Derek 2026-05-20 對齊「不限」）。
 * - 字串欄位皆 trim 後再判長度，避免「全是空白」混進去。
 * - form / weight_unit 用 z.enum，與 DB check constraint 同步（透過 constants 共用）。
 */

// ---------------------------------------------------------------------
// 營養素 entry
// ---------------------------------------------------------------------
export const NutrientEntrySchema = z.object({
  unit: z.string().min(1, 'unit 不可為空'),
  value: z.number().nonnegative('value 不可為負'),
})

export const NutritionFactsSchema = z
  .record(z.string(), NutrientEntrySchema)
  .refine(
    (facts) => CUSTOM_PRODUCT_REQUIRED_NUTRIENTS.every((k) => k in facts),
    {
      message: `必須填寫熱量、蛋白質、碳水化合物、脂肪四項基本營養素（缺少 ${CUSTOM_PRODUCT_REQUIRED_NUTRIENTS.join(' / ')} 之一）`,
    }
  )

// ---------------------------------------------------------------------
// Variant
// ---------------------------------------------------------------------
export const CustomProductVariantInputSchema = z.object({
  quantity: z.number().positive('quantity 必須 > 0'),
  volume: z.number().positive('volume 必須 > 0'),
  unit: z
    .string()
    .trim()
    .min(1, 'unit 不可為空')
    .max(
      MAX_CUSTOM_PRODUCT_VARIANT_UNIT_LENGTH,
      `unit 長度不可超過 ${MAX_CUSTOM_PRODUCT_VARIANT_UNIT_LENGTH} 字`
    ),
  is_default: z.boolean().optional(),
  sort_order: z.number().int().nonnegative().optional(),
})

// ---------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------
export const CustomProductInputSchema = z.object({
  name_zh: z
    .string()
    .trim()
    .min(1, '產品名稱不可為空')
    .max(
      MAX_CUSTOM_PRODUCT_NAME_ZH_LENGTH,
      `產品名稱不可超過 ${MAX_CUSTOM_PRODUCT_NAME_ZH_LENGTH} 字`
    ),
  name_en: z
    .union([
      z
        .string()
        .trim()
        .max(
          MAX_CUSTOM_PRODUCT_NAME_EN_LENGTH,
          `英文名不可超過 ${MAX_CUSTOM_PRODUCT_NAME_EN_LENGTH} 字`
        ),
      z.null(),
    ])
    .optional(),
  brand: z
    .string()
    .trim()
    .min(1, '品牌不可為空')
    .max(
      MAX_CUSTOM_PRODUCT_BRAND_LENGTH,
      `品牌不可超過 ${MAX_CUSTOM_PRODUCT_BRAND_LENGTH} 字`
    ),
  form: z.enum(CUSTOM_PRODUCT_FORMS),
  standard_weight: z.number().positive('標準重量必須 > 0'),
  weight_unit: z.enum(CUSTOM_PRODUCT_WEIGHT_UNITS),
  nutrition_facts: NutritionFactsSchema,
})

/** 建立 / 更新時整體 payload：product + variants 一起驗。 */
export const CustomProductPayloadSchema = z.object({
  product: CustomProductInputSchema,
  variants: z
    .array(CustomProductVariantInputSchema)
    .min(1, '至少需要一組包裝規格')
    .refine(
      (vs) => vs.filter((v) => v.is_default).length <= 1,
      { message: '只能有一組設為預設' }
    ),
})

// ---------------------------------------------------------------------
// JSON 匯入用 schema（P8 會用到，先一起定義避免未來 schema 漂移）
// ---------------------------------------------------------------------
export const CUSTOM_PRODUCT_EXPORT_FORMAT = 'nutribase.custom-product' as const
export const CUSTOM_PRODUCT_EXPORT_VERSION = 1 as const

// 匯出/匯入用的精簡產品形狀：
//   - 不含 weight_unit（import 由 form 推導：液劑→ml、粉劑/固態→g）
//   - nutrition 為 token -> 數值（單位由 token 從 NUTRIENT_UNITS 補回）
//   - image_base64 選填（有圖才帶；data URL，例：'data:image/webp;base64,...'）
export const CustomProductExportProductSchema = z.object({
  name_zh: z
    .string()
    .trim()
    .min(1, '產品名稱不可為空')
    .max(MAX_CUSTOM_PRODUCT_NAME_ZH_LENGTH),
  name_en: z
    .union([z.string().trim().max(MAX_CUSTOM_PRODUCT_NAME_EN_LENGTH), z.null()])
    .optional(),
  brand: z
    .string()
    .trim()
    .min(1, '品牌不可為空')
    .max(MAX_CUSTOM_PRODUCT_BRAND_LENGTH),
  form: z.enum(CUSTOM_PRODUCT_FORMS),
  standard_weight: z.number().positive('標準重量必須 > 0'),
  nutrition: z
    .record(z.string(), z.number().nonnegative('營養素數值不可為負'))
    .refine((n) => CUSTOM_PRODUCT_REQUIRED_NUTRIENTS.every((k) => k in n), {
      message: `必須包含四項基本營養素（${CUSTOM_PRODUCT_REQUIRED_NUTRIENTS.join(' / ')}）`,
    }),
  image_base64: z.string().optional(),
})

// 匯出/匯入用的精簡 variant 形狀：不含 sort_order（import 由陣列順序補）
export const CustomProductExportVariantSchema = z.object({
  quantity: z.number().positive('quantity 必須 > 0'),
  volume: z.number().positive('volume 必須 > 0'),
  unit: z
    .string()
    .trim()
    .min(1, 'unit 不可為空')
    .max(MAX_CUSTOM_PRODUCT_VARIANT_UNIT_LENGTH),
  is_default: z.boolean().optional(),
})

export const CustomProductExportItemSchema = z.object({
  product: CustomProductExportProductSchema,
  variants: z
    .array(CustomProductExportVariantSchema)
    .min(1, '至少需要一組包裝規格'),
})

export const CustomProductExportFileSchema = z.object({
  format: z.literal(CUSTOM_PRODUCT_EXPORT_FORMAT),
  version: z.literal(CUSTOM_PRODUCT_EXPORT_VERSION),
  exported_at: z.string(),
  products: z.array(CustomProductExportItemSchema).min(1),
})

// ---------------------------------------------------------------------
// 型別 helper
// ---------------------------------------------------------------------
export type CustomProductPayload = z.infer<typeof CustomProductPayloadSchema>
export type CustomProductExportProduct = z.infer<typeof CustomProductExportProductSchema>
export type CustomProductExportVariant = z.infer<typeof CustomProductExportVariantSchema>
export type CustomProductExportItem = z.infer<typeof CustomProductExportItemSchema>
export type CustomProductExportFile = z.infer<typeof CustomProductExportFileSchema>
