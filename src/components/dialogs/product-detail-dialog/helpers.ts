// dialog 內部共用的純函式 helpers

import type { IngredientsData } from "@/types"

/** 數值格式：去尾零、最多 2 位小數；undefined / NaN 顯示 "-" */
export const formatValue = (raw: number | undefined): string => {
  if (raw === undefined || Number.isNaN(raw)) return "-"
  return Number(raw.toFixed(2)).toString()
}

/**
 * 依 kcal 模式縮放所有營養素數值。
 *
 *   factor = kcal / calories
 *
 * 給定產品本身的營養素表（每 100 g/ml）+ 使用者指定 kcal，回傳「在那個 kcal 下」
 * 的營養素表。若不在 kcal 模式或產品沒有 calories 資訊，原樣回傳。
 *
 * 桌機 ProductPanelContent 與手機 MobileCompareView 共用同一份邏輯。
 */
export const applyKcalScaling = (
  ingredients: IngredientsData,
  isKcalMode: boolean,
  kcalInput: string,
): IngredientsData => {
  const calories = ingredients["calories"] ?? 0
  if (!isKcalMode || calories <= 0) return ingredients
  const kcal = parseFloat(kcalInput)
  if (!kcal || kcal <= 0 || isNaN(kcal)) return ingredients
  const factor = kcal / calories
  const result: IngredientsData = {}
  for (const key of Object.keys(ingredients)) {
    const v = ingredients[key]
    result[key] = v !== undefined ? v * factor : undefined
  }
  return result
}

/** 依產品劑型決定「每 100 X」的顯示文字 */
export const getUnitLabel = (type: string) =>
  type === "液劑" ? "100 ml" : type === "粉劑" ? "100 g" : "100 g/ml"

/**
 * 把 useDRIsCalculation 回傳的 drisContent + 縮放後的營養素值，
 * 拆成多段純文字（每 row 各一行）。
 *
 *   - rda/ai/ul/cdrr：「RDA 50g（60%）」
 *   - amdr（範圍）   ：「AMDR 30%-40%（目前 18%）」
 *   - amdr（單一上限）：「AMDR <10%（目前 18%）」
 */
export function formatDriParts(
  drisContent: { item: string; value: number | number[] }[],
  unit: string,
  scaledValue: number | undefined,
  amdrPct: number,
): string[] {
  if (drisContent.length === 0) return []
  return drisContent.map(({ item, value }) => {
    const itemUp = item.toUpperCase()
    if (item === "amdr") {
      const range = Array.isArray(value)
        ? `${value[0]}%-${value[1]}%`
        : `<${value}%`
      return `${itemUp} ${range}（目前 ${amdrPct}%）`
    }
    const target = value as number
    if (scaledValue === undefined || target <= 0) {
      return `${itemUp} ${target}${unit}`
    }
    const pct = Number(((scaledValue / target) * 100).toFixed(1))
    return `${itemUp} ${target}${unit}（${pct}%）`
  })
}
