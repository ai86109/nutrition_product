"use client"

import { redirect } from "next/navigation"
import InfoPopover from "@/components/info-popover"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useBioInfo } from "@/contexts/BioInfoContext"
import { useDRIsCalculation } from "@/hooks/useDRIsCalculation"
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
 * 進度條（B · 刻度線）：
 *  - 條塊 0–100% 對應 0–max；超過 max 的部分一律 cap 在 100%（跟熱量卡一致）
 *  - min 位置畫一條刻度線
 *  - 條塊下方標示 min / max 的數值（max 由條塊右邊緣本身代表，不另畫刻度線）
 */
function ProteinRangeBar({
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
      <div className="relative h-4 text-[10px] text-muted-foreground">
        <span
          className="absolute whitespace-nowrap"
          style={{ left: `${minPct}%`, transform: "translateX(-50%)" }}
        >
          {minValue} g
        </span>
        <span className="absolute right-0">{maxValue} g</span>
      </div>
    </div>
  )
}

function ProteinDris({
  drisContent,
  proteinValue,
}: {
  drisContent: DrisItem[]
  proteinValue: number
}) {
  return (
    <div className="text-xs text-muted-foreground space-y-0.5">
      {drisContent.map(({ item, value }) => {
        const numeric = Array.isArray(value) ? value[0] : value
        const meetPct = numeric > 0 ? (proteinValue / numeric) * 100 : 0
        const isMet = meetPct >= 100
        return (
          <div key={item} className={isMet ? "font-bold text-foreground" : ""}>
            <span className="uppercase">{item}: </span>
            <span>{numeric} g / 天</span>
            {numeric > 0 && (
              <span className="ml-1">({meetPct.toFixed(1)}%)</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ProteinDrisLocked({ drisContent }: { drisContent: DrisItem[] }) {
  return (
    <div className="text-xs text-muted-foreground/70 space-y-0.5">
      {drisContent.map(({ item }) => (
        <div key={item}>
          <span className="uppercase">{item}: </span>
          <span>—</span>
        </div>
      ))}
    </div>
  )
}

export function ProteinHeroCard({
  value,
  state,
}: {
  value: number
  state: WomanState
}) {
  const { isLoggedIn } = useAuth()
  const { proteinRange, submittedValues } = useBioInfo()
  const { gender, age } = submittedValues
  const { drisContent } = useDRIsCalculation("protein", value, state)

  const minVal = Math.min(Number(proteinRange.min), Number(proteinRange.max))
  const maxVal = Math.max(Number(proteinRange.min), Number(proteinRange.max))
  const isProteinRangeValid = minVal > 0 && maxVal > 0

  const showRangeBar = isProteinRangeValid && value > 0
  const hasGenderAndAge = !!gender && age > 0
  const hasDris = !!drisContent && drisContent.length > 0
  const showDris = hasGenderAndAge && hasDris

  const isInRange = value >= minVal && value <= maxVal
  const isBelow = value < minVal
  const deviation = isInRange
    ? 0
    : Number((isBelow ? minVal - value : value - maxVal).toFixed(1))
  const statusText = isInRange
    ? "符合目標範圍"
    : `${isBelow ? "低於" : "高於"}目標範圍 ${deviation} g`

  const label = NUTRIENT_LABELS["protein"] ?? "蛋白質"
  const unit = NUTRIENT_UNITS["protein"] ?? "g"
  const infoText = NUTRIENT_INFO_TEXTS["protein"]

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

      {/* Bar + 狀態文字 */}
      {showRangeBar ? (
        <div className="space-y-2">
          <ProteinRangeBar
            value={value}
            minValue={minVal}
            maxValue={maxVal}
          />
          <p className="text-xs font-bold">{statusText}</p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {value > 0 ? "請先填寫蛋白質範圍" : "尚未選擇營養品"}
        </p>
      )}

      {/* DRIs */}
      {showDris && drisContent && (
        isLoggedIn ? (
          <ProteinDris drisContent={drisContent} proteinValue={value} />
        ) : (
          <div className="flex flex-col gap-2">
            <ProteinDrisLocked drisContent={drisContent} />
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
          </div>
        )
      )}
    </div>
  )
}
