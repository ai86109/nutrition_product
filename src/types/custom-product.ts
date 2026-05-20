import type {
  CUSTOM_PRODUCT_FORMS,
  CUSTOM_PRODUCT_WEIGHT_UNITS,
} from '@/utils/constants'

// =====================================================================
// nutrition_facts 內每個營養素的 entry
// 與既有 products.nutrition_facts 結構一致，product-processor 直接吃。
// =====================================================================
export interface NutrientEntry {
  unit: string
  value: number
}

/** key = 營養素 token（calories / protein / vitamin_a ...），value = NutrientEntry */
export type NutritionFacts = Record<string, NutrientEntry>

export type CustomProductForm = typeof CUSTOM_PRODUCT_FORMS[number]
export type CustomProductWeightUnit = typeof CUSTOM_PRODUCT_WEIGHT_UNITS[number]

// =====================================================================
// DB row shapes
// =====================================================================
export interface CustomProduct {
  id: string
  user_id: string

  name_zh: string
  name_en: string | null
  brand: string
  form: CustomProductForm
  standard_weight: number
  weight_unit: CustomProductWeightUnit

  nutrition_facts: NutritionFacts

  /** 軟刪除時間戳；NULL = 未刪除。 */
  deleted_at: string | null

  created_at: string
  updated_at: string
}

export interface CustomProductVariant {
  id: string
  custom_product_id: string

  quantity: number
  volume: number
  unit: string          // 容器/份單位（罐、包、匙、瓶...），對齊既有 product_variants
  is_default: boolean
  sort_order: number

  created_at: string
  updated_at: string
}

/** UI 與計算用：產品 + 該產品的 variants（依 sort_order 排序）。 */
export interface CustomProductWithVariants extends CustomProduct {
  variants: CustomProductVariant[]
}

// =====================================================================
// Input shapes（建立 / 更新用）
// id / user_id / timestamps / deleted_at 由 server 或 mutation 補
// =====================================================================
export interface CustomProductInput {
  name_zh: string
  name_en?: string | null
  brand: string
  form: CustomProductForm
  standard_weight: number
  weight_unit: CustomProductWeightUnit
  nutrition_facts: NutritionFacts
}

export interface CustomProductVariantInput {
  quantity: number
  volume: number
  unit: string
  is_default?: boolean
  sort_order?: number
}
