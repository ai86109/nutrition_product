import type { IngredientsData } from "@/types"
import {
  MACRO_NUTRIENTS,
  MACRO_MINERALS,
  TRACE_MINERALS,
  VITAMINS,
} from "./constants"

/**
 * 營養素分組。對應 NUTRIENTS_GROUP 的中文標籤 key。
 */
export type NutrientGroupKey =
  | "macroNutrients"
  | "macroMinerals"
  | "traceMinerals"
  | "vitamins"
  | "others"

export interface NutrientGroup {
  key: NutrientGroupKey
  items: string[]
}

/**
 * 從 ingredients 取出所有有效（>= 0 且非 undefined）的 nutrient key。
 */
export function getValidNutrientKeys(ingredients: IngredientsData): string[] {
  return Object.keys(ingredients).filter((key) => {
    const value = ingredients[key]
    return value !== undefined && value >= 0
  })
}

/**
 * 把一組 nutrient keys 依固定順序分成 5 組。空組會被濾掉。
 *
 * 順序：巨量營養素 → 巨量礦物質 → 微量礦物質 → 維生素 → 其他（字母排序）
 *
 * @param validKeys 已過濾過的 nutrient keys（通常先呼叫 getValidNutrientKeys）
 */
export function groupNutrientsByCategory(validKeys: string[]): NutrientGroup[] {
  const macroNutrientsList = MACRO_NUTRIENTS.filter((k) => validKeys.includes(k))
  const macroMineralsList = MACRO_MINERALS.filter((k) => validKeys.includes(k))
  const traceMineralsList = TRACE_MINERALS.filter((k) => validKeys.includes(k))
  const vitaminsList = VITAMINS.filter((k) => validKeys.includes(k))
  const otherNutrientsList = validKeys
    .filter(
      (k) =>
        !MACRO_NUTRIENTS.includes(k) &&
        !MACRO_MINERALS.includes(k) &&
        !TRACE_MINERALS.includes(k) &&
        !VITAMINS.includes(k),
    )
    .sort()

  return (
    [
      { key: "macroNutrients", items: macroNutrientsList },
      { key: "macroMinerals", items: macroMineralsList },
      { key: "traceMinerals", items: traceMineralsList },
      { key: "vitamins", items: vitaminsList },
      { key: "others", items: otherNutrientsList },
    ] satisfies NutrientGroup[]
  ).filter((g) => g.items.length > 0)
}
