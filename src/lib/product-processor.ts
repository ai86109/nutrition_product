import { NUTRIENT_UNITS } from '@/utils/constants'
import { getCategoryLabel } from '@/utils/product-categories'
import type { ProductImagePublic } from '@/types/product-images'
import type { CustomProductWithVariants } from '@/types/custom-product'
import type { ApiProductData, ApiProductListData } from '@/types/api'

type FormMapKey = keyof typeof formMap
type UnitMapKey = keyof typeof unitMap
type UnitConversionKey = keyof typeof UNIT_CONVERSIONS

const formMap = {
  'powder': '粉劑',
  'liquid': '液劑',
  'solid': '固態',
  'other': '其他',
} as const

const unitMap = {
  "spoon": "匙",
  "pack": "包",
  "can": "罐",
} as const

// Raw Supabase row shapes
interface RawVariant {
  is_default?: boolean
  volume?: number
  quantity?: number | string
  unit?: string
}

interface RawIngredientEntry {
  unit?: string
  value?: unknown
}

interface RawProduct {
  license_no: string
  name_zh: string
  name_en: string
  brand: string
  form?: string
  standard_weight?: number
  is_approved?: string | boolean
  product_status?: string | null
  categories?: string[]
  nutrition_facts?: Record<string, RawIngredientEntry>
  product_variants?: RawVariant[]
}

const categoryProcessor = (categories: string[]): string[] => {
  return categories.map(getCategoryLabel)
}

/**
 * 將 nutrition_facts 裡 AI 抓到的雜亂單位字串，正規化成單純的質量單位 token。
 *
 * 涵蓋的變體（皆收斂到 'ug' / 'mg' / 'g'）：
 *   - 空白：'µg RE'、'mg α-TE'、'ugRE '
 *   - 連字號：'µg-RE'
 *   - micro sign：'µg' → 'ug'
 *   - 美式寫法：'mcg' → 'ug'
 *   - 當量後綴：RE（視網醇）、NE（菸鹼素）、α-TE / αTE（α-生育醇）
 *   - 大小寫：一律 lowercase
 *
 * 沒命中規則的字串會原樣 lowercase 回傳；後續的 convertToStandardUnit
 * 會走守衛 fallback，避免被當成「克」灌水。
 */
export const normalizeUnit = (unit: string | undefined): string => {
  if (!unit) return ''
  return unit
    .replace(/\s+/g, '')              // 1. 清掉所有空白（前後、中間）
    .replace(/µ/g, 'u')               // 2. µ → u
    .replace(/^mcg/i, 'ug')           // 3. mcg → ug（美式寫法）
    .replace(/-?(α-?TE|RE|NE)$/i, '') // 4. 去掉當量後綴（含可選的連字號）
    .toLowerCase()
}

const UNIT_CONVERSIONS = {
  'g': 1,
  'mg': 1000,
  'ug': 1000000,
} as const

const isKnownUnit = (unit: string): unit is UnitConversionKey =>
  unit in UNIT_CONVERSIONS

/**
 * 質量單位換算。兩邊單位都必須在 UNIT_CONVERSIONS 表內才會換算；
 * 任一邊不認得就 console.warn 並回傳原值，避免把 'ugRE' 之類的怪單位
 * 當成「克」(factor=1) 灌水成天文數字。
 */
export const convertToStandardUnit = (value: number, fromUnit: string, toUnit: string): number => {
  if (!isKnownUnit(fromUnit) || !isKnownUnit(toUnit)) {
    console.warn(
      `[product-processor] unknown unit, skip conversion: from="${fromUnit}" to="${toUnit}" value=${value}`
    )
    return value
  }

  const normalizedFrom = UNIT_CONVERSIONS[fromUnit]
  const normalizedTo = UNIT_CONVERSIONS[toUnit]

  if (normalizedFrom === normalizedTo) return value

  const factor = normalizedTo / normalizedFrom
  return value * factor
}

const ingredientsProcessor = (
  ingredients: Record<string, RawIngredientEntry>,
  factor: number
): Record<string, number> => {
  if (!factor || factor <= 0) return {}

  const processedIngredients: Record<string, number> = {}
  for (const [key, entry] of Object.entries(ingredients)) {
    const defaultUnit = normalizeUnit(NUTRIENT_UNITS[key])
    const unit = normalizeUnit(entry.unit)
    let convertedValue = Number(entry.value) || 0
    if (unit !== defaultUnit) {
      convertedValue = convertToStandardUnit(convertedValue, unit, defaultUnit)
    }
    processedIngredients[key] = Number((convertedValue * factor).toFixed(2))
  }

  return processedIngredients
}

const hasValidDefaultAmount = (product: RawProduct): boolean => {
  const defaultAmount = product.product_variants?.find(variant => variant.is_default)?.volume || null
  return !!defaultAmount
}

const isValidProduct = (product: RawProduct): boolean => {
  // check defaultAmount
  if (!hasValidDefaultAmount(product)) return false;

  // check nutrition_facts
  if (!product.nutrition_facts || Object.keys(product.nutrition_facts).length === 0) return false;

  return true;
}

// 清單用的 validator：nutrition_facts 已在 DB 端過濾，這邊只檢查 defaultAmount
const isValidProductListItem = hasValidDefaultAmount

// 清單格式（不含 ingredients / spec / defaultAmount）
export const formatProductList = (products: RawProduct[]) => {
  return products
    .filter(isValidProductListItem)
    .map((product) => {
      const { is_approved, product_status, categories: rawCate, form } = product
      const categories = is_approved ? categoryProcessor(rawCate || []) : []
      const type = formMap[form as FormMapKey] || form || ''

      return {
        id: product.license_no,
        name: product.name_zh,
        engName: product.name_en,
        brand: product.brand,
        type,
        categories,
        reviewStatus: String(is_approved ?? ''),
        productStatus: product_status ?? null,
      }
    })
}

// 詳細格式（含完整 nutrition 資料，單筆使用）
//   images 在 server side 預先算好 publicUrl 後傳入，這裡只是組裝
export const formatProductDetail = (
  product: RawProduct,
  images: ProductImagePublic[] = []
) => {
  if (!isValidProduct(product)) return null

  const { is_approved, categories: rawCate, product_variants, form, standard_weight } = product
  const categories = is_approved ? categoryProcessor(rawCate || []) : []
  const defaultAmount = product_variants?.find(variant => variant.is_default)?.volume || null
  const type = formMap[form as FormMapKey] || form || ''
  const factor = defaultAmount && standard_weight ? defaultAmount / standard_weight : 1
  const per100Factor = standard_weight ? 100 / standard_weight : 1
  const ingredients = ingredientsProcessor(product.nutrition_facts ?? {}, factor)
  const ingredientsPer100 = ingredientsProcessor(product.nutrition_facts ?? {}, per100Factor)
  const spec = (product_variants ?? []).map(variant => ({
    defaultAmount: variant.quantity,
    unit: unitMap[variant.unit as UnitMapKey] || variant.unit,
    volume: variant.volume,
  }))

  return {
    id: product.license_no,
    name: product.name_zh,
    engName: product.name_en,
    brand: product.brand,
    type,
    categories,
    defaultAmount,
    ingredients,
    ingredientsPer100,
    spec,
    reviewStatus: is_approved,
    images,
  }
}

// ---------------------------------------------------------------------
// 自訂營養品 formatters
//
// 把 user_custom_products + user_custom_variants 轉成跟 FDA 公開產品
// 一致的 ApiProductListData / ApiProductData 形狀，下游的搜尋、收藏、
// 計算、snapshot 流程就不需要任何 if (isCustom) 分支。
//
// 兩邊差異對應：
//   license_no              → custom product uuid（沒有碰撞，可共用 id 欄位）
//   reviewStatus            → 自訂視為使用者自己審過 → 'true'
//   productStatus           → 自訂沒有上下架概念 → null
//   categories              → 自訂目前沒分類欄位 → 空陣列
//   isCustom                → true（讓 UI 顯示「自訂」badge）
// ---------------------------------------------------------------------

const customVariantsAsRaw = (variants: CustomProductWithVariants['variants']): RawVariant[] =>
  variants.map((v) => ({
    is_default: v.is_default,
    volume: v.volume,
    quantity: v.quantity,
    unit: v.unit,
  }))

const hasUsableCustomNutrition = (cp: CustomProductWithVariants): boolean => {
  if (!cp.nutrition_facts || Object.keys(cp.nutrition_facts).length === 0) return false
  const hasDefaultVariant = cp.variants.some((v) => v.is_default)
  return hasDefaultVariant
}

/** 自訂產品列表 → ApiProductListData[]（給首頁 server-side 渲染）。 */
export const formatCustomProductList = (
  customProducts: CustomProductWithVariants[]
): ApiProductListData[] => {
  return customProducts
    .filter(hasUsableCustomNutrition)
    .map((cp) => {
      const type = formMap[cp.form as FormMapKey] || cp.form || ''
      return {
        id: cp.id,
        name: cp.name_zh,
        engName: cp.name_en ?? '',
        brand: cp.brand,
        type,
        reviewStatus: 'true',
        productStatus: null,
        categories: [],
        isCustom: true,
      }
    })
}

/** 單一自訂產品 → ApiProductData（給 /api/products/[id] 詳細路由）。
 *  images 由 server side 用 createSignedUrl 預先算好 publicUrl 後傳入。 */
export const formatCustomProductDetail = (
  cp: CustomProductWithVariants,
  images: ProductImagePublic[] = []
): ApiProductData | null => {
  if (!hasUsableCustomNutrition(cp)) return null

  const rawVariants = customVariantsAsRaw(cp.variants)
  const defaultAmount = rawVariants.find((v) => v.is_default)?.volume ?? null
  const type = formMap[cp.form as FormMapKey] || cp.form || ''
  const standardWeight = cp.standard_weight
  const factor = defaultAmount && standardWeight ? defaultAmount / standardWeight : 1
  const per100Factor = standardWeight ? 100 / standardWeight : 1
  const ingredients = ingredientsProcessor(cp.nutrition_facts, factor)
  const ingredientsPer100 = ingredientsProcessor(cp.nutrition_facts, per100Factor)
  const spec = rawVariants.map((variant) => ({
    type: '',
    defaultAmount: variant.quantity != null ? String(variant.quantity) : undefined,
    unit: unitMap[variant.unit as UnitMapKey] || variant.unit,
    volume: variant.volume != null ? String(variant.volume) : undefined,
  }))

  return {
    id: cp.id,
    name: cp.name_zh,
    engName: cp.name_en ?? '',
    brand: cp.brand,
    type,
    defaultAmount: defaultAmount != null ? String(defaultAmount) : '',
    reviewStatus: 'true',
    categories: [],
    spec,
    ingredients,
    ingredientsPer100,
    images,
    isCustom: true,
  }
}

// 保留舊函式，供既有測試相容
export const formatProductData = (products: RawProduct[]) => {
  return products
    .filter(isValidProduct)
    .map((product) => {
      const { is_approved, categories: rawCate, product_variants, form, standard_weight } = product
      const categories = is_approved ? categoryProcessor(rawCate || []) : []
      const defaultAmount = product_variants?.find(variant => variant.is_default)?.volume || null
      const type = formMap[form as FormMapKey] || form || ''
      const factor = defaultAmount && standard_weight ? defaultAmount / standard_weight : 1
      const ingredients = ingredientsProcessor(product.nutrition_facts ?? {}, factor)
      const spec = (product_variants ?? []).map(variant => ({
        defaultAmount: variant.quantity,
        unit: unitMap[variant.unit as UnitMapKey] || variant.unit,
        volume: variant.volume,
      }))

      return {
        brand: product.brand,
        categories,
        defaultAmount,
        id: product.license_no,
        name: product.name_zh,
        engName: product.name_en,
        ingredients,
        type,
        spec,
        reviewStatus: is_approved
      }
    })
}