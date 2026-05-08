"use client"

// 手機比較版面：桌機維持原本左右兩個獨立 panel；手機改成統一的「成分名 | A | B」三欄
// 比較表，上方兩個 mini header 並排，sticky 列僅固定純品名（不含其他資訊）。

import { Fragment, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useBioInfo } from "@/contexts/BioInfoContext"
import { useDRIsCalculation } from "@/hooks/useDRIsCalculation"
import type { ApiProductData, IngredientsData } from "@/types"
import {
  NUTRIENTS_GROUP,
  NUTRIENT_LABELS,
  NUTRIENT_UNITS,
} from "@/utils/constants"
import { calcMacroRatios } from "@/utils/nutrition-calculations"
import { MACRO_DISPLAY, MACRO_KEYS } from "@/utils/macro-display"
import ProductReportDialog from "@/components/dialogs/product-report-dialog"
import { cn } from "@/lib/utils"
import { applyKcalScaling, formatValue, formatDriParts } from "./helpers"
import type { OrderedGroup, ProductDetailDialogItem } from "./types"
import { ProductPanelHeader } from "./product-panel-header"
import { PanelRemoveButton } from "./compare-trigger"
import { KcalUnitDisplay } from "./kcal-unit-display"
import { DrisToggle } from "./dris-toggle"
import { ReportTrigger } from "./report-trigger"

interface MobileCompareViewProps {
  mainItem: ProductDetailDialogItem
  compareItem: ProductDetailDialogItem
  mainDetail: ApiProductData | undefined
  compareDetail: ApiProductData | undefined
  mainLoading: boolean
  compareLoading: boolean
  mainIngredients: IngredientsData
  compareIngredients: IngredientsData
  mainUnitLabel: string
  compareUnitLabel: string
  orderedGroups: OrderedGroup[]
  isKcalMode: boolean
  kcalInput: string
  onToggleKcal: () => void
  onKcalInputChange: (value: string) => void
  onCloseMain: () => void
  onCloseCompare: () => void
  mainSelectedSpecKey: string | null
  compareSelectedSpecKey: string | null
  onMainSelectedSpecKeyChange: (key: string) => void
  onCompareSelectedSpecKeyChange: (key: string) => void
  showDris: boolean
  onShowDrisChange: (next: boolean) => void
}

export function MobileCompareView({
  mainItem,
  compareItem,
  mainDetail,
  compareDetail,
  mainLoading,
  compareLoading,
  mainIngredients,
  compareIngredients,
  mainUnitLabel,
  compareUnitLabel,
  orderedGroups,
  isKcalMode,
  kcalInput,
  onToggleKcal,
  onKcalInputChange,
  onCloseMain,
  onCloseCompare,
  mainSelectedSpecKey,
  compareSelectedSpecKey,
  onMainSelectedSpecKeyChange,
  onCompareSelectedSpecKeyChange,
  showDris,
  onShowDrisChange,
}: MobileCompareViewProps) {
  // 比較模式下使用單一 dialog，由 reportTarget 決定要回報哪一品
  const [reportTarget, setReportTarget] = useState<"A" | "B" | null>(null)
  const reportItem =
    reportTarget === "A" ? mainItem : reportTarget === "B" ? compareItem : null

  const mainDisplay = useMemo(
    () => applyKcalScaling(mainIngredients, isKcalMode, kcalInput),
    [mainIngredients, isKcalMode, kcalInput]
  )
  const compareDisplay = useMemo(
    () => applyKcalScaling(compareIngredients, isKcalMode, kcalInput),
    [compareIngredients, isKcalMode, kcalInput]
  )

  const mainCalories = mainIngredients["calories"] ?? 0
  const compareCalories = compareIngredients["calories"] ?? 0
  // 只要其中一品有 calories 就允許切換 kcal 模式（與桌機版單品行為對齊）
  const canToggleKcal = mainCalories > 0 || compareCalories > 0

  // 當兩品單位相同顯示一行；不同時讓兩個欄位各自顯示自己的單位
  const sameUnit = mainUnitLabel === compareUnitLabel
  const unitShortMain = mainUnitLabel.split(" ").slice(1).join(" ")
  const unitShortCompare = compareUnitLabel.split(" ").slice(1).join(" ")
  const unitToggleLabel = isKcalMode
    ? sameUnit
      ? unitShortMain
      : `${unitShortMain}/${unitShortCompare}`
    : "kcal"

  const isLoading = mainLoading || compareLoading

  const mainRatios = calcMacroRatios(mainIngredients)
  const compareRatios = calcMacroRatios(compareIngredients)
  const showRatios = Boolean(mainRatios || compareRatios)

  return (
    <div className="md:hidden flex flex-col overflow-hidden">
      <div className="overflow-y-auto max-h-[80vh]">
        {/* 完整 mini header 區（左右並排，會被滾走） */}
        <div className="grid grid-cols-2 border-b border-border/60">
          <ProductPanelHeader
            item={mainItem}
            detail={mainDetail}
            slotAction={
              <PanelRemoveButton
                onClick={onCloseMain}
                label="關閉此營養品（退出比較）"
              />
            }
            className="px-3 pt-3 pb-2 border-r border-border/60"
          />
          <ProductPanelHeader
            item={compareItem}
            detail={compareDetail}
            slotAction={
              <PanelRemoveButton
                onClick={onCloseCompare}
                label="關閉此營養品（退出比較）"
              />
            }
            className="px-3 pt-3 pb-2"
          />
        </div>

        {/* sticky 純品名列（不含其他資訊） */}
        <div className="sticky top-0 z-10 grid grid-cols-2 bg-background/95 backdrop-blur border-b border-border/60">
          <div className="px-3 py-2 text-sm font-semibold truncate border-r border-border/60">
            {mainItem.name}
          </div>
          <div className="px-3 py-2 text-sm font-semibold truncate">
            {compareItem.name}
          </div>
        </div>

        {/* 標題 + 單位切換列 */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
          <h3 className="text-sm font-semibold">營養素成分</h3>
          <div className="flex items-center gap-2">
            {isKcalMode ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                每
                <Input
                  type="number"
                  value={kcalInput}
                  onChange={(e) => onKcalInputChange(e.target.value)}
                  className="h-5 w-14 text-xs px-1.5 text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  min={1}
                />
                kcal
              </span>
            ) : sameUnit ? (
              <span className="text-xs text-muted-foreground">
                每 {mainUnitLabel}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                每 100 {unitShortMain}/{unitShortCompare}
              </span>
            )}
            <button
              type="button"
              onClick={onToggleKcal}
              disabled={!canToggleKcal}
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded border transition-colors",
                "border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                !canToggleKcal && "opacity-40 cursor-not-allowed"
              )}
            >
              {unitToggleLabel}
            </button>
          </div>
        </div>

        {/* kcal 模式時，兩欄各自的 kcal-對應-單位顯示 */}
        {isKcalMode && (
          <div className="grid grid-cols-2 gap-x-3 px-3 py-2 border-b border-border/40">
            <div className="border-r border-border/60 pr-2 min-w-0">
              <span className="text-[10px] text-muted-foreground mr-1 font-medium">A</span>
              <KcalUnitDisplay
                spec={mainDetail?.spec}
                type={mainItem.type ?? mainDetail?.type ?? ""}
                caloriesPer100={mainCalories}
                kcalInput={kcalInput}
                selectedKey={mainSelectedSpecKey}
                onSelectedKeyChange={onMainSelectedSpecKeyChange}
                className="inline-flex"
              />
            </div>
            <div className="pl-2 min-w-0">
              <span className="text-[10px] text-muted-foreground mr-1 font-medium">B</span>
              <KcalUnitDisplay
                spec={compareDetail?.spec}
                type={compareItem.type ?? compareDetail?.type ?? ""}
                caloriesPer100={compareCalories}
                kcalInput={kcalInput}
                selectedKey={compareSelectedSpecKey}
                onSelectedKeyChange={onCompareSelectedSpecKeyChange}
                className="inline-flex"
              />
            </div>
          </div>
        )}

        {/* DRIs 顯示切換（兩欄共用） + 各自的回報按鈕 */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/40">
          <div className="flex items-center gap-3">
            <ReportTrigger
              onClick={() => setReportTarget("A")}
              panelLabel="A"
            />
            <ReportTrigger
              onClick={() => setReportTarget("B")}
              panelLabel="B"
            />
          </div>
          <DrisToggle showDris={showDris} onShowDrisChange={onShowDrisChange} />
        </div>

        {/* 三大營養素佔比（兩品分行顯示，便於比較） */}
        {!isLoading && showRatios && (
          <div className="px-3 py-2 space-y-1.5 border-b border-border/40">
            {mainRatios && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-muted-foreground w-4 shrink-0 font-medium">
                  A
                </span>
                {MACRO_KEYS.map((key) => {
                  const cfg = MACRO_DISPLAY[key]
                  return (
                    <span
                      key={key}
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: cfg.bgTint, color: cfg.color }}
                    >
                      {cfg.label} {mainRatios[key]}%
                    </span>
                  )
                })}
              </div>
            )}
            {compareRatios && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-muted-foreground w-4 shrink-0 font-medium">
                  B
                </span>
                {MACRO_KEYS.map((key) => {
                  const cfg = MACRO_DISPLAY[key]
                  return (
                    <span
                      key={key}
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: cfg.bgTint, color: cfg.color }}
                    >
                      {cfg.label} {compareRatios[key]}%
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* 三欄營養素表 */}
        {isLoading && (
          <div className="px-3 py-3 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Fragment key={j}>
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                    </Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && orderedGroups.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 text-center">
            無營養素資料
          </p>
        )}

        {!isLoading && orderedGroups.length > 0 && (
          <div className="px-3 py-3 space-y-4">
            {orderedGroups.map((group) => (
              <section key={group.key}>
                <h3 className="text-xs font-bold text-amber-800 mb-1.5 tracking-wide">
                  {NUTRIENTS_GROUP[group.key] ?? group.key}
                </h3>
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1.5">
                  {group.items.map((key) => (
                    <MobileCompareNutrientRow
                      key={key}
                      nutrientKey={key}
                      aValue={mainDisplay[key]}
                      bValue={compareDisplay[key]}
                      aCalories={mainDisplay["calories"] ?? 0}
                      bCalories={compareDisplay["calories"] ?? 0}
                      showDris={showDris}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {reportItem && (
        <ProductReportDialog
          open={reportTarget !== null}
          onOpenChange={(open) => {
            if (!open) setReportTarget(null)
          }}
          productId={reportItem.id}
          productName={reportItem.name}
        />
      )}
    </div>
  )
}

// 手機比較版面的單列：左側成分名、A、B 三欄；下方再依 BioInfo 顯示 A/B 各自的 DRIs 行。
function MobileCompareNutrientRow({
  nutrientKey,
  aValue,
  bValue,
  aCalories,
  bCalories,
  showDris,
}: {
  nutrientKey: string
  aValue: number | undefined
  bValue: number | undefined
  aCalories: number
  bCalories: number
  showDris: boolean
}) {
  const label = NUTRIENT_LABELS[nutrientKey] ?? nutrientKey
  const unit = NUTRIENT_UNITS[nutrientKey] ?? ""

  const { submittedValues } = useBioInfo()
  const hasBioInfo = !!submittedValues.gender && submittedValues.age > 0

  const a = useDRIsCalculation(nutrientKey, aValue ?? 0, null, aCalories)
  const b = useDRIsCalculation(nutrientKey, bValue ?? 0, null, bCalories)

  const aDriParts =
    showDris && hasBioInfo && aValue !== undefined && a.drisContent && a.drisContent.length > 0
      ? formatDriParts(a.drisContent, unit, aValue, a.calculatedValue)
      : []
  const bDriParts =
    showDris && hasBioInfo && bValue !== undefined && b.drisContent && b.drisContent.length > 0
      ? formatDriParts(b.drisContent, unit, bValue, b.calculatedValue)
      : []

  const showDriRow = aDriParts.length > 0 || bDriParts.length > 0

  return (
    <Fragment>
      <span className="text-sm text-foreground/80 leading-tight py-0.5">
        {label}
      </span>
      <span className="text-sm font-medium tabular-nums text-right whitespace-nowrap py-0.5">
        {formatValue(aValue)}
        {aValue !== undefined && unit && (
          <span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>
        )}
      </span>
      <span className="text-sm font-medium tabular-nums text-right whitespace-nowrap py-0.5">
        {formatValue(bValue)}
        {bValue !== undefined && unit && (
          <span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>
        )}
      </span>
      {showDriRow && (
        <Fragment>
          <span aria-hidden />
          <span className="text-[10px] text-muted-foreground tabular-nums text-right leading-snug pb-1 flex flex-col gap-0.5">
            {aDriParts.length > 0
              ? aDriParts.map((part, i) => <span key={i}>{part}</span>)
              : <span>—</span>}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums text-right leading-snug pb-1 flex flex-col gap-0.5">
            {bDriParts.length > 0
              ? bDriParts.map((part, i) => <span key={i}>{part}</span>)
              : <span>—</span>}
          </span>
        </Fragment>
      )}
    </Fragment>
  )
}
