"use client"

import type { IngredientsData } from "@/types"
import { calcMacroRatios } from "@/utils/nutrition-calculations"
import { MACRO_DISPLAY, MACRO_KEYS } from "@/utils/macro-display"

/**
 * 三大營養素佔比 chips（醣類 / 蛋白質 / 脂肪）。
 * 顏色與標籤一律從 @/utils/macro-display 取，與 product-calculate 的 pie chart 共用同源。
 */
export function MacroRatioLine({ ingredients }: { ingredients: IngredientsData }) {
  const ratios = calcMacroRatios(ingredients)
  if (!ratios) return null
  return (
    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
      {MACRO_KEYS.map((key) => {
        const cfg = MACRO_DISPLAY[key]
        return (
          <span
            key={key}
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: cfg.bgTint, color: cfg.color }}
          >
            {cfg.label} {ratios[key]}%
          </span>
        )
      })}
    </div>
  )
}
