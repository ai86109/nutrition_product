import { NUTRIENT_UNITS } from '@/utils/constants'
import { getCategoryLabel } from '@/utils/product-categories'

type FormMapKey = keyof typeof formMap
type UnitMapKey = keyof typeof unitMap
type UnitConversionKey = keyof typeof UNIT_CONVERSIONS

const formMap = {
  'powder': '粉劑',
  'liquid': '液劑',
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
  categories?: string[]
  nutrition_facts?: Record<string, RawIngredientEntry>
  product_variants?: RawVariant[]
}

const categoryProcessor = (categories: string[]): string[] => {
  return categories.map(getCategoryLabel)
}

const normalizeDefaultUnit = (unit: string | undefined): string => {
  if (!unit) return ''
  if (unit.includes('µg')) return 'ug'
  if (unit.includes('mg')) return 'mg'
  return unit.trim().toLowerCase()
}

const UNIT_CONVERSIONS = {
  'g': 1,
  'mg': 1000,
  'ug': 1000000,
} as const

const convertToStandardUnit = (value: number, fromUnit: string, toUnit: string): number => {
  const normalizedFrom = UNIT_CONVERSIONS[fromUnit as UnitConversionKey] || 1
  const normalizedTo = UNIT_CONVERSIONS[toUnit as UnitConversionKey] || 1

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
    const defaultUnit = normalizeDefaultUnit(NUTRIENT_UNITS[key]) || ''
    const unit = entry.unit || ''
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
      const { is_approved, categories: rawCate, form } = product
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
      }
    })
}

// 詳細格式（含完整 nutrition 資料，單筆使用）
export const formatProductDetail = (product: RawProduct) => {
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