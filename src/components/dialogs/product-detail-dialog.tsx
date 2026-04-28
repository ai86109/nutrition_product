"use client"

import { useEffect, useMemo } from "react"
import { ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useProduct } from "@/contexts/ProductContext"
import { IngredientsData } from "@/types"
import { getLinkPath } from "@/utils/external-links"
import {
  NUTRIENTS_GROUP,
  MACRO_NUTRIENTS,
  MACRO_MINERALS,
  TRACE_MINERALS,
  VITAMINS,
  NUTRIENT_LABELS,
  NUTRIENT_UNITS,
} from "@/utils/constants"
import { cn } from "@/lib/utils"

// 接受 search 列表 (ApiProductListData) 與計算區 (ProductData) 共用的最小欄位集
// type/categories 在計算區的 ProductData 沒有完整提供，會 fallback 到 productDetails[id]
export interface ProductDetailDialogItem {
  id: string
  name: string
  engName: string
  brand: string
  type?: string
  categories?: string[]
}

interface ProductDetailDialogProps {
  item: ProductDetailDialogItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

const buildOrderedGroups = (ingredients: IngredientsData) => {
  const validKeys = Object.keys(ingredients).filter((key) => {
    const value = ingredients[key]
    return value !== undefined && value >= 0
  })

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
        !VITAMINS.includes(k)
    )
    .sort()

  return [
    { key: "macroNutrients", items: macroNutrientsList },
    { key: "macroMinerals", items: macroMineralsList },
    { key: "traceMinerals", items: traceMineralsList },
    { key: "vitamins", items: vitaminsList },
    { key: "others", items: otherNutrientsList },
  ].filter((g) => g.items.length > 0)
}

const formatValue = (raw: number | undefined): string => {
  if (raw === undefined || Number.isNaN(raw)) return "-"
  // 跟 product-processor 一致，最多兩位小數，去掉多餘 0
  return Number(raw.toFixed(2)).toString()
}

function NutrientRow({ nutrientKey, value }: { nutrientKey: string; value: number | undefined }) {
  const label = NUTRIENT_LABELS[nutrientKey] ?? nutrientKey
  const unit = NUTRIENT_UNITS[nutrientKey] ?? ""

  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5 border-b border-border/40 last:border-b-0">
      <span className="text-sm text-foreground/80">{label}</span>
      <span className="text-sm font-medium tabular-nums whitespace-nowrap">
        {formatValue(value)}
        {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
      </span>
    </div>
  )
}

function NutrientGroupBlock({
  groupKey,
  items,
  ingredients,
}: {
  groupKey: string
  items: readonly string[] | string[]
  ingredients: IngredientsData
}) {
  return (
    <section>
      <h3 className="text-xs font-bold text-amber-800 mb-1.5 tracking-wide">
        {NUTRIENTS_GROUP[groupKey] ?? groupKey}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        {items.map((key) => (
          <NutrientRow key={key} nutrientKey={key} value={ingredients[key]} />
        ))}
      </div>
    </section>
  )
}

function NutritionSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
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

export function ProductDetailDialog({ item, open, onOpenChange }: ProductDetailDialogProps) {
  const { productDetails, loadingProductIds, fetchProductDetail } = useProduct()
  const detail = productDetails[item.id]
  const isLoading = loadingProductIds.has(item.id) && !detail

  // 打開 dialog 才 fetch
  useEffect(() => {
    if (open) {
      fetchProductDetail(item.id)
    }
  }, [open, item.id, fetchProductDetail])

  const ingredients = detail?.ingredientsPer100 ?? {}
  const orderedGroups = useMemo(() => buildOrderedGroups(ingredients), [ingredients])

  // type/categories fallback：計算區沒帶 type，搜尋列表沒缺，但 fetch 後 detail 一定有
  const effectiveType = item.type ?? detail?.type ?? ""
  const effectiveCategories = item.categories ?? detail?.categories ?? []

  // 單位標示：液劑 → 100ml，粉劑 → 100g
  const unitLabel =
    effectiveType === "液劑" ? "100 ml" : effectiveType === "粉劑" ? "100 g" : "100 g/ml"
  const fdaUrl = getLinkPath(item.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 space-y-2 text-left">
          <div className="flex items-start gap-2 pr-6">
            <DialogTitle className="text-base sm:text-lg leading-snug text-pretty text-left">
              {item.name}
            </DialogTitle>
            <a
              href={fdaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "shrink-0 inline-flex items-center justify-center rounded-md p-1 mt-0.5",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
                "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              aria-label="開啟衛福部頁面"
              title="開啟衛福部頁面"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          {item.engName && (
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-snug text-left">
              {item.engName}
            </DialogDescription>
          )}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {item.brand && (
              <span className="text-xs text-muted-foreground">{item.brand}</span>
            )}
            {effectiveType && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 border-transparent",
                  effectiveType === "液劑" && "bg-blue-50 text-blue-600 hover:bg-blue-50",
                  effectiveType === "粉劑" && "bg-amber-50 text-amber-600 hover:bg-amber-50"
                )}
              >
                {effectiveType}
              </Badge>
            )}
            {effectiveCategories.map((category) => (
              <Badge key={category} variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {category}
              </Badge>
            ))}
          </div>
        </DialogHeader>

        <div className="px-6 py-4 max-h-[65vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">營養素成分</h2>
            <span className="text-xs text-muted-foreground">每 {unitLabel}</span>
          </div>

          {isLoading && <NutritionSkeleton />}

          {!isLoading && orderedGroups.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">
              無營養素資料
            </p>
          )}

          {!isLoading && orderedGroups.length > 0 && (
            <div className="space-y-4">
              {orderedGroups.map((group) => (
                <NutrientGroupBlock
                  key={group.key}
                  groupKey={group.key}
                  items={group.items}
                  ingredients={ingredients}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
