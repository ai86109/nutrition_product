import { IngredientsData } from "@/types"

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
