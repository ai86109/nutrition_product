"use client"

import { useBioInfo } from "@/contexts/BioInfoContext"
import { useDRIsCalculation } from "@/hooks/useDRIsCalculation"
import type { IngredientsData } from "@/types"
import {
  NUTRIENTS_GROUP,
  NUTRIENT_LABELS,
  NUTRIENT_UNITS,
} from "@/utils/constants"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatValue, formatDriParts } from "./helpers"

/**
 * 單筆營養素列：左標籤 / 右數值 + 單位；下方依 BioInfo & showDris 顯示 DRIs 文字。
 *
 * state 傳 null：dialog 內不考慮孕/哺乳，孕哺切換留在計算頁。
 */
export function NutrientRow({
  nutrientKey,
  value,
  caloriesValue,
  showDris,
}: {
  nutrientKey: string
  value: number | undefined
  caloriesValue: number
  showDris: boolean
}) {
  const label = NUTRIENT_LABELS[nutrientKey] ?? nutrientKey
  const unit = NUTRIENT_UNITS[nutrientKey] ?? ""

  const { submittedValues } = useBioInfo()
  const hasBioInfo = !!submittedValues.gender && submittedValues.age > 0

  const { drisContent, calculatedValue } = useDRIsCalculation(
    nutrientKey,
    value ?? 0,
    null,
    caloriesValue,
  )

  const driParts =
    showDris && hasBioInfo && value !== undefined && drisContent && drisContent.length > 0
      ? formatDriParts(drisContent, unit, value, calculatedValue)
      : []

  return (
    <div className="flex flex-col gap-0.5 py-1.5 border-b border-border/40 last:border-b-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-foreground/80">{label}</span>
        <span className="text-sm font-medium tabular-nums whitespace-nowrap">
          {formatValue(value)}
          {value !== undefined && unit && (
            <span className="text-xs text-muted-foreground ml-1">{unit}</span>
          )}
        </span>
      </div>
      {driParts.length > 0 && (
        <div className="text-[11px] text-muted-foreground tabular-nums text-right leading-snug space-y-0.5">
          {driParts.map((part, i) => (
            <div key={i}>{part}</div>
          ))}
        </div>
      )}
    </div>
  )
}

/** 一個營養素群組（巨量、礦物質、維生素…）+ 群組內所有 row */
export function NutrientGroupBlock({
  groupKey,
  items,
  ingredients,
  singleColumn,
  caloriesValue,
  showDris,
}: {
  groupKey: string
  items: string[]
  ingredients: IngredientsData
  singleColumn: boolean
  caloriesValue: number
  showDris: boolean
}) {
  return (
    <section>
      <h3 className="text-xs font-bold text-amber-800 mb-1.5 tracking-wide">
        {NUTRIENTS_GROUP[groupKey] ?? groupKey}
      </h3>
      <div
        className={cn(
          "grid gap-x-6",
          singleColumn ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
        )}
      >
        {items.map((key) => (
          <NutrientRow
            key={key}
            nutrientKey={key}
            value={ingredients[key]}
            caloriesValue={caloriesValue}
            showDris={showDris}
          />
        ))}
      </div>
    </section>
  )
}

/** 載入中骨架（與 NutrientGroupBlock 同樣 grid layout） */
export function NutritionSkeleton({ singleColumn }: { singleColumn: boolean }) {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <div
            className={cn(
              "grid gap-x-6 gap-y-2",
              singleColumn ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
            )}
          >
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
