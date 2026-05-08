"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import type { IngredientsData } from "@/types"
import type { ProcessedSpec } from "@/types/api"
import ProductReportDialog from "@/components/dialogs/product-report-dialog"
import { cn } from "@/lib/utils"
import { applyKcalScaling } from "./helpers"
import type { OrderedGroup } from "./types"
import { MacroRatioLine } from "./macro-ratio-line"
import {
  NutrientGroupBlock,
  NutritionSkeleton,
} from "./nutrient-row"
import { KcalUnitDisplay } from "./kcal-unit-display"
import { DrisToggle } from "./dris-toggle"
import { ReportTrigger } from "./report-trigger"

interface ProductPanelContentProps {
  isLoading: boolean
  orderedGroups: OrderedGroup[]
  ingredients: IngredientsData
  isCompareMode: boolean
  unitLabel: string
  isKcalMode: boolean
  kcalInput: string
  onToggleKcal: () => void
  onKcalInputChange: (value: string) => void
  spec?: ProcessedSpec[]
  type?: string
  selectedSpecKey: string | null
  onSelectedSpecKeyChange: (key: string) => void
  showDris: boolean
  onShowDrisChange: (next: boolean) => void
  /** 用於錯誤回報 dialog 自動帶入產品識別 */
  productId: string
  productName: string
  className?: string
}

/**
 * 桌機版的單一 panel 內容（單品模式 / 比較模式各一）：
 *   標題列（單位切換）→ kcal 對應單位 → 回報入口 + DRIs 開關 → 三大營養素 chips → 各群組營養素表
 */
export function ProductPanelContent({
  isLoading,
  orderedGroups,
  ingredients,
  isCompareMode,
  unitLabel,
  isKcalMode,
  kcalInput,
  onToggleKcal,
  onKcalInputChange,
  spec,
  type,
  selectedSpecKey,
  onSelectedSpecKeyChange,
  showDris,
  onShowDrisChange,
  productId,
  productName,
  className,
}: ProductPanelContentProps) {
  const [reportOpen, setReportOpen] = useState(false)

  const singleColumn = isCompareMode
  const calories = ingredients["calories"] ?? 0

  // 依 kcal 模式縮放所有營養素數值（共用 helper，與手機比較版面一致）
  const displayIngredients = useMemo(
    () => applyKcalScaling(ingredients, isKcalMode, kcalInput),
    [ingredients, isKcalMode, kcalInput]
  )

  // "100 ml" → "ml"、"100 g" → "g"，作為切回原單位的按鈕文字
  const unitShort = unitLabel.split(" ").slice(1).join(" ")

  return (
    <div className={cn("px-5 py-4", className)}>
      <div className={cn("flex items-center justify-between", isKcalMode ? "mb-1.5" : "mb-3")}>
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
          ) : (
            <span className="text-xs text-muted-foreground">每 {unitLabel}</span>
          )}
          <div className="relative group/tip">
            <button
              type="button"
              onClick={onToggleKcal}
              disabled={calories <= 0}
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded border transition-colors",
                "border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                calories <= 0 && "opacity-40 cursor-not-allowed"
              )}
            >
              {isKcalMode ? unitShort : "kcal"}
            </button>
            <span
              role="tooltip"
              className={cn(
                "pointer-events-none absolute right-0 top-full mt-1.5 z-10",
                "px-2 py-0.5 rounded bg-foreground text-background text-xs whitespace-nowrap shadow-sm",
                "opacity-0 group-hover/tip:opacity-100",
                "transition-opacity",
                calories <= 0 && "hidden"
              )}
            >
              切換單位
            </span>
          </div>
        </div>
      </div>

      {isKcalMode && (
        <KcalUnitDisplay
          spec={spec}
          type={type ?? ""}
          caloriesPer100={calories}
          kcalInput={kcalInput}
          selectedKey={selectedSpecKey}
          onSelectedKeyChange={onSelectedSpecKeyChange}
          className="mb-1 justify-end"
        />
      )}

      <div className="flex items-center justify-between mb-3 gap-2">
        <ReportTrigger onClick={() => setReportOpen(true)} />
        <DrisToggle showDris={showDris} onShowDrisChange={onShowDrisChange} />
      </div>

      {isLoading && <NutritionSkeleton singleColumn={singleColumn} />}

      {!isLoading && orderedGroups.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">無營養素資料</p>
      )}

      {!isLoading && orderedGroups.length > 0 && (
        <div className="space-y-4">
          <MacroRatioLine ingredients={ingredients} />
          {orderedGroups.map((group) => (
            <NutrientGroupBlock
              key={group.key}
              groupKey={group.key}
              items={group.items}
              ingredients={displayIngredients}
              singleColumn={singleColumn}
              caloriesValue={displayIngredients["calories"] ?? 0}
              showDris={showDris}
            />
          ))}
        </div>
      )}

      <ProductReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        productId={productId}
        productName={productName}
      />
    </div>
  )
}
