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

type DrisItem = { item: string; value: number | number[] }

type WomanState =
  | { type: "pregnancy" | "lactation"; pregnancyState: string | null }
  | null

/**
 * 進度條 — 條塊最多畫到 100%，文字顯示實際 %（即使超標）。
 * 跟現有 nutrition-bar-chart.tsx 的邏輯一致。
 */
function ProgressBar({ percentage }: { percentage: number }) {
  const fill = Math.min(percentage, 100)
  return (
    <div
      className="h-2 w-full rounded-full bg-muted overflow-hidden"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${fill}%`, backgroundColor: BAR_BASE_COLOR }}
      />
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
  const { tdee, submittedValues } = useBioInfo()
  const { gender, age } = submittedValues
  const { pbw, ibw, abw } = useBioInfoCalculations()
  const { isTdeeValid } = useNutritionChartData()
  const { drisContent } = useDRIsCalculation("calories", value, state, value)

  // useNutritionChartData 回傳的 percentage 已經在 hook 內被 cap 到 100（給 recharts 畫條塊用），
  // 這裡要顯示真實百分比給使用者看，所以自己算一次。
  const tdeeNum = Number(tdee)
  const percentage =
    isTdeeValid && tdeeNum > 0 && value > 0
      ? Number(((value / tdeeNum) * 100).toFixed(1))
      : 0

  const showProgress = isTdeeValid && value > 0
  const hasGenderAndAge = !!gender && age > 0
  const hasReferenceLevels = !!drisContent && drisContent.length > 0
  const showReferenceLevels = hasGenderAndAge && hasReferenceLevels
  const showSubGrid =
    pbw > 0 || ibw > 0 || abw > 0 || showReferenceLevels

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

      {/* Progress bar + 百分比/目標說明 */}
      {showProgress ? (
        <div className="space-y-1.5">
          <ProgressBar percentage={percentage} />
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-bold tabular-nums">{percentage}%</span>
            <span className="text-muted-foreground">目標 {tdee} kcal</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {value > 0 ? "請先填寫 TDEE 才能比對熱量目標" : "尚未選擇營養品"}
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
