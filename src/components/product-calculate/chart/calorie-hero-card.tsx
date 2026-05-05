"use client"

import { redirect } from "next/navigation"
import InfoPopover from "@/components/info-popover"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useBioInfo } from "@/contexts/BioInfoContext"
import { useBioInfoCalculations } from "@/hooks/useBioInfoCalculations"
import { useDRIsCalculation } from "@/hooks/useDRIsCalculation"
import { useNutritionChartData } from "@/hooks/product-calculate/useNutritionChartData"
import {
  NUTRIENT_INFO_TEXTS,
  NUTRIENT_LABELS,
  NUTRIENT_UNITS,
} from "@/utils/constants"

const BAR_BASE_COLOR = "#ad7c48"
const TICK_COLOR = "rgba(0, 0, 0, 0.45)"

type DrisItem = { item: string; value: number | number[] }

type WomanState =
  | { type: "pregnancy" | "lactation"; pregnancyState: string | null }
  | null

/**
 * 區間進度條：
 *  - 條塊 0–100% 對應 0–maxValue；超過 max 的部分 cap 在 100%
 *  - minValue 位置畫一條刻度線
 *  - 條塊下方：左側顯示 %數區間（value/max% ~ value/min%），右側顯示 min / max 數字
 */
function CalorieRangeBar({
  value,
  minValue,
  maxValue,
}: {
  value: number
  minValue: number
  maxValue: number
}) {
  if (maxValue <= 0) return null
  const fillPct = Math.min((value / maxValue) * 100, 100)
  const minPct = Math.min(Math.max((minValue / maxValue) * 100, 0), 100)

  const pctOfMax = Number(((value / maxValue) * 100).toFixed(1))
  const pctOfMin = minValue > 0 ? Number(((value / minValue) * 100).toFixed(1)) : null
  const pctLabel =
    pctOfMin !== null
      ? `${Math.max(pctOfMax, pctOfMin)}% ~ ${Math.min(pctOfMax, pctOfMin)}%`
      : `${pctOfMax}%`

  return (
    <div className="space-y-1">
      <div
        className="relative h-2 w-full rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={maxValue}
      >
        <div
          className="absolute inset-y-0 left-0 transition-[width]"
          style={{ width: `${fillPct}%`, backgroundColor: BAR_BASE_COLOR }}
        />
        <div
          className="absolute inset-y-0 w-[2px]"
          style={{
            left: `calc(${minPct}% - 1px)`,
            backgroundColor: TICK_COLOR,
          }}
          aria-hidden
        />
      </div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-bold tabular-nums">{pctLabel}</span>
        <span className="text-muted-foreground tabular-nums">
          {minValue} ~ {maxValue}
        </span>
      </div>
    </div>
  )
}

function CaloriesPerWeight({ value }: { value: number }) {
  const { pbw, ibw, abw, rounding } = useBioInfoCalculations()
  if (pbw <= 0 && ibw <= 0 && abw <= 0) return null
  return (
    <div className="text-xs text-muted-foreground space-y-0.5">
      {pbw > 0 && <p>{rounding(value / pbw)} kcal/kg PBW</p>}
      {ibw > 0 && <p>{rounding(value / ibw)} kcal/kg IBW</p>}
      {abw > 0 && <p>{rounding(value / abw)} kcal/kg ABW</p>}
    </div>
  )
}

function ReferenceLevels({
  drisContent,
  caloriesValue,
}: {
  drisContent: DrisItem[]
  caloriesValue: number
}) {
  return (
    <div className="text-xs text-muted-foreground space-y-0.5">
      {drisContent.map(({ item, value }) => {
        const numeric = Array.isArray(value) ? value[0] : value
        const meetPct = numeric > 0 ? (caloriesValue / numeric) * 100 : 0
        const isMet = meetPct >= 100
        return (
          <div
            key={item}
            className={isMet ? "font-bold text-foreground" : ""}
          >
            <span>{item}: </span>
            <span>{numeric} kcal</span>
          </div>
        )
      })}
    </div>
  )
}

function ReferenceLevelsLocked({ drisContent }: { drisContent: DrisItem[] }) {
  return (
    <div className="text-xs text-muted-foreground/70 space-y-0.5">
      {drisContent.map(({ item }) => (
        <div key={item}>
          <span>{item}: </span>
          <span>—</span>
        </div>
      ))}
    </div>
  )
}

export function CalorieHeroCard({
  value,
  state,
}: {
  value: number
  state: WomanState
}) {
  const { isLoggedIn } = useAuth()
  const { calorieRange, submittedValues } = useBioInfo()
  const { gender, age } = submittedValues
  const { pbw, ibw, abw } = useBioInfoCalculations()
  const { isCalorieRangeValid } = useNutritionChartData()
  const { drisContent } = useDRIsCalculation("calories", value, state, value)

  const minVal = Math.min(Number(calorieRange.min), Number(calorieRange.max))
  const maxVal = Math.max(Number(calorieRange.min), Number(calorieRange.max))

  const showRangeBar = isCalorieRangeValid && value > 0
  const hasGenderAndAge = !!gender && age > 0
  const hasReferenceLevels = !!drisContent && drisContent.length > 0
  const showReferenceLevels = hasGenderAndAge && hasReferenceLevels
  const showSubGrid =
    pbw > 0 || ibw > 0 || abw > 0 || showReferenceLevels

  const isInRange = value >= minVal && value <= maxVal
  const isBelow = value < minVal
  const deviation = isInRange
    ? 0
    : Number((isBelow ? minVal - value : value - maxVal).toFixed(1))
  const statusText = isInRange
    ? "符合目標範圍"
    : `${isBelow ? "低於" : "高於"}目標範圍 ${deviation} kcal`

  const label = NUTRIENT_LABELS["calories"] ?? "熱量"
  const unit = NUTRIENT_UNITS["calories"] ?? "kcal"
  const infoText = NUTRIENT_INFO_TEXTS["calories"]

  return (
    <div className="flex flex-col gap-3 py-3 w-full max-w-[400px]">
      {/* Header */}
      <div className="flex items-center gap-1">
        <span className="text-base font-bold">{label}</span>
        {infoText && (
          <InfoPopover size={14}>
            <p className="text-sm">{infoText}</p>
          </InfoPopover>
        )}
      </div>

      {/* Big number */}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums leading-none">
          {value}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>

      {/* Range bar + 狀態文字 */}
      {showRangeBar ? (
        <div className="space-y-2">
          <CalorieRangeBar value={value} minValue={minVal} maxValue={maxVal} />
          <p className="text-xs font-bold">{statusText}</p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {value > 0 ? "請先填寫目標熱量範圍" : "尚未選擇營養品"}
        </p>
      )}

      {/* Sub info: kcal/kg + 參考等級 */}
      {showSubGrid && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <CaloriesPerWeight value={value} />
          {showReferenceLevels && drisContent && (
            isLoggedIn ? (
              <ReferenceLevels
                drisContent={drisContent}
                caloriesValue={value}
              />
            ) : (
              <ReferenceLevelsLocked drisContent={drisContent} />
            )
          )}
        </div>
      )}

      {showReferenceLevels && !isLoggedIn && (
        <Button
          className="w-fit cursor-pointer"
          onClick={() => redirect("/auth")}
        >
          <span
            className="material-icons"
            style={{ fontSize: "14px", height: "14px" }}
          >
            lock
          </span>
          <span className="text-xs font-bold">登入後查看 DRIs</span>
        </Button>
      )}
    </div>
  )
}
