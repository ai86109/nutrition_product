"use client"

import InfoPopover from "@/components/info-popover"
import { useAuth } from "@/contexts/AuthContext"
import { useBioInfo } from "@/contexts/BioInfoContext"
import { useDRIsCalculation } from "@/hooks/useDRIsCalculation"
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

function MiniBar({ percentage }: { percentage: number }) {
  const fill = Math.min(Math.max(percentage, 0), 100)
  return (
    <div
      className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
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

function formatDrisItemValue(
  item: string,
  value: number | number[],
  unit: string,
): string {
  if (item === "amdr") {
    if (Array.isArray(value)) return `${value[0]}% - ${value[1]}%`
    return `<${value}%`
  }
  return `${value} ${unit}`
}

function DrisInfoStack({
  drisContent,
  unit,
  isLoggedIn,
  nutrientValue,
}: {
  drisContent: DrisItem[]
  unit: string
  isLoggedIn: boolean
  nutrientValue: number
}) {
  return (
    <div
      className={`text-xs space-y-0.5 text-right ${
        isLoggedIn ? "text-muted-foreground" : "text-muted-foreground/60"
      }`}
    >
      {drisContent.map(({ item, value }) => {
        const target = Array.isArray(value) ? value[0] : value
        const isMet = isLoggedIn && target > 0 && nutrientValue >= target
        return (
          <div key={item} className={isMet ? "font-bold text-foreground" : ""}>
            <span className="uppercase">{item}: </span>
            <span>
              {isLoggedIn ? formatDrisItemValue(item, value, unit) : "—"}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function NutrientRow({
  nutrient,
  value,
  state,
  caloriesValue,
}: {
  nutrient: string
  value: number
  state: WomanState
  caloriesValue?: number
}) {
  const { isLoggedIn } = useAuth()
  const { submittedValues } = useBioInfo()
  const { gender, age } = submittedValues
  const { drisContent, calculatedValue, markColor } = useDRIsCalculation(
    nutrient,
    value,
    state,
    caloriesValue,
  )

  const label = NUTRIENT_LABELS[nutrient] ?? nutrient
  const unit = NUTRIENT_UNITS[nutrient] ?? ""
  const infoText = NUTRIENT_INFO_TEXTS[nutrient]

  const hasGenderAndAge = !!gender && age > 0
  const hasDris = !!drisContent && drisContent.length > 0
  const showDris = hasGenderAndAge && hasDris

  // 主要指標：amdr 優先，其次 ai/rda；只有 ul/cdrr 的話沒有「達成度」概念，row 2 不顯示條塊
  const primaryItem =
    drisContent?.find(i => i.item === "amdr") ??
    drisContent?.find(i => i.item === "ai" || i.item === "rda")

  const isAMDR = primaryItem?.item === "amdr"

  let displayPct = 0
  if (showDris && primaryItem) {
    if (isAMDR) {
      displayPct = calculatedValue
    } else {
      const target = Array.isArray(primaryItem.value)
        ? primaryItem.value[0]
        : primaryItem.value
      displayPct =
        target > 0 ? Number(((value / target) * 100).toFixed(1)) : 0
    }
  }

  const isMarkColorMeaningful = markColor !== "text-gray-400"
  const showBar = showDris && isLoggedIn && !!primaryItem && !isAMDR && value > 0
  const showPct = showDris && isLoggedIn && !!primaryItem
  const showDot = showDris && isLoggedIn && value > 0 && isMarkColorMeaningful
  const showRow2Extras = showBar || showPct || showDot

  return (
    <div className="flex flex-col gap-1.5 py-2">
      {/* Row 1: name + DRIs reference */}
      <div className={`flex ${drisContent && drisContent.length >= 2 ? "items-end" : "items-start"} justify-between gap-3`}>
        <span className="text-sm font-bold whitespace-nowrap flex items-center gap-1">
          {label}
          {infoText && (
            <InfoPopover size={14}>
              <p className="text-sm">{infoText}</p>
            </InfoPopover>
          )}
        </span>
        {showDris && drisContent && (
          <DrisInfoStack
            drisContent={drisContent}
            unit={unit}
            isLoggedIn={isLoggedIn}
            nutrientValue={value}
          />
        )}
      </div>

      {/* Row 2: value + bar + % + dot */}
      <div className="flex items-center gap-2">
        <span className="text-xl tabular-nums whitespace-nowrap">
          <span className="font-bold">{value}</span>
          <span className="text-xs text-muted-foreground ml-1">{unit}</span>
        </span>
        {showRow2Extras && (
          <>
            {showBar ? (
              <div className="flex-1 min-w-[40px]">
                <MiniBar percentage={displayPct} />
              </div>
            ) : (
              <div className="flex-1" />
            )}
            {showPct && (
              <span
                className="text-xs font-bold tabular-nums whitespace-nowrap min-w-[44px] text-right"
              >
                {displayPct}%
              </span>
            )}
            {showDot && (
              <span
                className={`material-icons ${markColor}`}
                style={{
                  fontSize: "12px",
                  height: "12px",
                  lineHeight: "12px",
                }}
                aria-hidden
              >
                circle
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
