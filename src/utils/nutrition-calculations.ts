import { IngredientsData } from "@/types"

/** BMI = 體重(kg) / 身高(m)²，四捨五入到小數第一位；資料不足時回傳 null */
export function calcBMI(height: number, weight: number): number | null {
  if (!height || !weight || height <= 0 || weight <= 0) return null
  const val = weight / (height / 100) ** 2
  if (!isFinite(val) || isNaN(val)) return null
  return Math.round(val * 10) / 10
}

/** IBW = 身高(m)² × 22，四捨五入到整數；資料不足時回傳 null */
export function calcIBW(height: number): number | null {
  if (!height || height <= 0) return null
  const val = (height / 100) ** 2 * 22
  if (!isFinite(val) || isNaN(val)) return null
  return Math.round(val)
}

/** ABW = IBW + 0.25 × (體重 - IBW)，四捨五入到整數；資料不足時回傳 null */
export function calcABW(height: number, weight: number): number | null {
  const ibw = calcIBW(height)
  if (ibw === null || !weight || weight <= 0) return null
  return Math.round(ibw + 0.25 * (weight - ibw))
}

export type MacroRatios = {
  carb: number
  protein: number
  fat: number
}

/**
 * 計算三大營養素熱量佔比（%）
 * - 醣類：(淨醣 × 4 + 膳食纖維 × 2) / 熱量
 * - 蛋白質：蛋白質 × 4 / 熱量
 * - 脂肪：脂肪 × 9 / 熱量
 *
 * 熱量為 0、或三大營養素皆為 0 時回傳 null。
 */
export function calcMacroRatios(ingredients: IngredientsData): MacroRatios | null {
  const calories = ingredients["calories"] ?? 0
  const carbohydrates = ingredients["carbohydrates"] ?? 0
  const protein = ingredients["protein"] ?? 0
  const fat = ingredients["fat"] ?? 0
  const dietary_fiber = ingredients["dietary_fiber"] ?? 0

  if (calories === 0) return null
  if (carbohydrates === 0 && protein === 0 && fat === 0) return null

  const adjustedCarbohydrates = carbohydrates - dietary_fiber
  return {
    carb: Number(Math.max(((adjustedCarbohydrates * 4 + dietary_fiber * 2) / calories) * 100, 0).toFixed(1)),
    protein: Number(Math.max(((protein * 4) / calories) * 100, 0).toFixed(1)),
    fat: Number(Math.max(((fat * 9) / calories) * 100, 0).toFixed(1)),
  }
}
