"use client"

import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react"
import { Columns2, ExternalLink, X as XIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useProduct } from "@/contexts/ProductContext"
import { ApiProductData, ApiProductListData, IngredientsData } from "@/types"
import type { ProcessedSpec } from "@/types/api"
import type { ProductImagePublic } from "@/types/product-images"
import { getLinkPath } from "@/utils/external-links"
import ProductImageLightbox from "@/components/dialogs/product-image-lightbox"
import {
  NUTRIENTS_GROUP,
  MACRO_NUTRIENTS,
  MACRO_MINERALS,
  TRACE_MINERALS,
  VITAMINS,
  NUTRIENT_LABELS,
  NUTRIENT_UNITS,
  UNIT_MAPPINGS,
  CALC_UNIT_MAPPINGS,
} from "@/utils/constants"
import { calcMacroRatios } from "@/utils/nutrition-calculations"
import { cn } from "@/lib/utils"

// 接受 search 列表 (ApiProductListData) 與計算區 (ProductData) 共用的最小欄位集
export interface ProductDetailDialogItem {
  id: string
  name: string
  engName: string
  brand: string
  type?: string
  categories?: string[]
  productStatus?: string | null
}

interface ProductDetailDialogProps {
  item: ProductDetailDialogItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

type OrderedGroup = { key: string; items: string[] }

const buildOrderedGroups = (validKeys: string[]): OrderedGroup[] => {
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

const validKeysOf = (ingredients: IngredientsData): string[] =>
  Object.keys(ingredients).filter((key) => {
    const value = ingredients[key]
    return value !== undefined && value >= 0
  })

const formatValue = (raw: number | undefined): string => {
  if (raw === undefined || Number.isNaN(raw)) return "-"
  return Number(raw.toFixed(2)).toString()
}

// 依 kcal 模式縮放所有營養素數值；與 ProductPanelContent 內部使用的邏輯一致，
// 抽出來讓手機比較版面也能共用。
const applyKcalScaling = (
  ingredients: IngredientsData,
  isKcalMode: boolean,
  kcalInput: string
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


const MACRO_CHIPS = [
  { key: "carb",    label: "醣類",   bg: "rgba(47,111,146,0.10)",  color: "#2f6f92" },
  { key: "protein", label: "蛋白質", bg: "rgba(212,122,74,0.10)",  color: "#d47a4a" },
  { key: "fat",     label: "脂肪",   bg: "rgba(111,143,58,0.10)",  color: "#6f8f3a" },
] as const

function MacroRatioLine({ ingredients }: { ingredients: IngredientsData }) {
  const ratios = calcMacroRatios(ingredients)
  if (!ratios) return null
  return (
    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
      {MACRO_CHIPS.map(({ key, label, bg, color }) => (
        <span
          key={key}
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: bg, color }}
        >
          {label} {ratios[key]}%
        </span>
      ))}
    </div>
  )
}

const getUnitLabel = (type: string) =>
  type === "液劑" ? "100 ml" : type === "粉劑" ? "100 g" : "100 g/ml"

function NutrientRow({ nutrientKey, value }: { nutrientKey: string; value: number | undefined }) {
  const label = NUTRIENT_LABELS[nutrientKey] ?? nutrientKey
  const unit = NUTRIENT_UNITS[nutrientKey] ?? ""

  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5 border-b border-border/40 last:border-b-0">
      <span className="text-sm text-foreground/80">{label}</span>
      <span className="text-sm font-medium tabular-nums whitespace-nowrap">
        {formatValue(value)}
        {value !== undefined && unit && (
          <span className="text-xs text-muted-foreground ml-1">{unit}</span>
        )}
      </span>
    </div>
  )
}

function NutrientGroupBlock({
  groupKey,
  items,
  ingredients,
  singleColumn,
}: {
  groupKey: string
  items: string[]
  ingredients: IngredientsData
  singleColumn: boolean
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
          <NutrientRow key={key} nutrientKey={key} value={ingredients[key]} />
        ))}
      </div>
    </section>
  )
}

function NutritionSkeleton({ singleColumn }: { singleColumn: boolean }) {
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

// ─── 比較搜尋觸發器 ────────────────────────────────────────────────────────────

interface CompareTriggerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  query: string
  setQuery: (q: string) => void
  options: ApiProductListData[]
  onSelect: (product: ApiProductListData) => void
}

function CompareTrigger({ open, onOpenChange, query, setQuery, options, onSelect }: CompareTriggerProps) {
  return (
    <div className="relative group/tip shrink-0">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-state={open ? "open" : "closed"}
            className={cn(
              "inline-flex items-center justify-center rounded-md p-1",
              "text-muted-foreground hover:text-foreground hover:bg-muted",
              "data-[state=open]:bg-muted data-[state=open]:text-foreground",
              "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label="與其他營養品比較"
          >
            <Columns2 className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={6}
          className="w-[300px] p-0 overflow-hidden"
        >
          <div className="p-2 border-b border-border/60">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋營養品名稱..."
              className="h-8 text-sm"
            />
          </div>
          {/* onWheel stopPropagation 防止 Dialog scroll lock 攔截滾輪事件 */}
          <ul
            className="max-h-[280px] overflow-y-auto py-1"
            onWheel={(e) => e.stopPropagation()}
          >
            {options.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                找不到符合的營養品
              </li>
            )}
            {options.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect(p)}
                  className="w-full text-left px-3 py-2 hover:bg-muted/60 focus:bg-muted/60 focus:outline-none transition-colors"
                >
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  {p.engName && (
                    <p className="text-xs text-muted-foreground truncate">{p.engName}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {p.brand && <span className="text-[10px] text-muted-foreground">{p.brand}</span>}
                    {p.type && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-4 border-transparent",
                          p.type === "液劑" && "bg-blue-50 text-blue-600 hover:bg-blue-50",
                          p.type === "粉劑" && "bg-amber-50 text-amber-600 hover:bg-amber-50"
                        )}
                      >
                        {p.type}
                      </Badge>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

      {/* CSS-only tooltip。popover 開啟時隱藏。 */}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute right-0 bottom-full mb-1.5 z-10",
          "px-2 py-0.5 rounded bg-foreground text-background text-xs whitespace-nowrap shadow-sm",
          "opacity-0 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100",
          "transition-opacity",
          open && "!opacity-0"
        )}
      >
        與其他營養品比較
      </span>
    </div>
  )
}

// ─── 移除比較面板按鈕（膠囊型，與 dialog 關閉叉叉明顯區分）────────────────────

function PanelRemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full shrink-0",
        "border border-border/60 px-1.5 h-4",
        "text-[10px] text-muted-foreground",
        "hover:border-destructive/60 hover:text-destructive hover:bg-destructive/5",
        "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      aria-label={label}
      title={label}
    >
      <XIcon className="h-2.5 w-2.5" />
      移除
    </button>
  )
}

// ─── 產品面板標題區（名稱、英文名、品牌、劑型徽章、slotAction）────────────────

interface ProductPanelHeaderProps {
  item: ProductDetailDialogItem
  detail: ApiProductData | undefined
  /** 比較模式：移除按鈕；單品模式：比較搜尋觸發器 */
  slotAction?: ReactNode
  className?: string
}

function ProductPanelHeader({ item, detail, slotAction, className }: ProductPanelHeaderProps) {
  const effectiveType = item.type ?? detail?.type ?? ""
  const effectiveCategories = item.categories ?? detail?.categories ?? []
  const fdaUrl = getLinkPath(item.id)
  const images: ProductImagePublic[] = detail?.images ?? []
  const hasImages = images.length > 0

  // Lightbox state（每個 panel 各自一份，比較模式下兩邊互不干擾）
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx)
    setLightboxOpen(true)
  }

  return (
    <div className={cn("px-5 pt-5 pb-3", className)}>
      <div className="flex gap-3">
        {/* 左側 cover 縮圖（無圖時不渲染，header 寬度自然回填） */}
        {hasImages && (
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className={cn(
              "relative shrink-0",
              "w-12 h-12 sm:w-16 sm:h-16",
              "rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "hover:opacity-90 transition-opacity"
            )}
            aria-label={`查看 ${item.name} 的圖片，共 ${images.length} 張`}
            title="點擊查看圖片"
          >
            {/* 內層 wrapper 才做 overflow-hidden，讓外層的徽章能超出邊界顯示 */}
            <div className="w-full h-full rounded-md overflow-hidden border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0].publicUrl}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
            {images.length > 1 && (
              <span
                className={cn(
                  "absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1",
                  "rounded-full bg-foreground text-background",
                  "text-[10px] font-bold leading-none flex items-center justify-center",
                  "tabular-nums shadow-sm"
                )}
              >
                {images.length}
              </span>
            )}
          </button>
        )}

        {/* 右側標題區 */}
        <div className="flex-1 min-w-0 space-y-2">
          <h2 className="text-base sm:text-lg leading-snug text-pretty font-semibold text-left">
            {item.name}
            {item.productStatus !== 'inactive' && (
              <a
                href={fdaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center justify-center rounded-md p-0.5 ml-1 align-middle",
                  "text-muted-foreground hover:text-foreground hover:bg-muted",
                  "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
                aria-label="開啟衛福部頁面"
                title="開啟衛福部頁面"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </h2>
          {item.engName && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-snug text-left">
              {item.engName}
            </p>
          )}
          {/* 劑型徽章列：slotAction 置於最右側（ml-auto） */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {item.brand && <span className="text-xs text-muted-foreground">{item.brand}</span>}
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
            {slotAction && <div className="ml-auto shrink-0">{slotAction}</div>}
          </div>
        </div>
      </div>

      {/* Lightbox：依 detail.images 渲染。Lightbox 內部用 portal，位置不影響 header layout */}
      {hasImages && (
        <ProductImageLightbox
          images={images}
          index={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}

// ─── kcal-對應-單位顯示（240ml ≈ 1罐（以 1罐=240ml）） ─────────────────────────
//
// 計算邏輯：
//   factor = kcal / caloriesPer100
//   mass   = factor * 100        // g（粉劑）或 ml（液劑）
//   count  = mass / volume       // volume = 選定變體的「每單位 g/ml」
//
// 變體：來自 ApiProductData.spec[]。每筆 { unit, defaultAmount, volume }，
//       同一個 unit 下可能有多筆（不同匙規）。多變體時用 Select 切換，
//       單一變體則純文字顯示。

interface SpecVariantOption {
  key: string
  unit: string
  defaultAmount: number
  volume: number
}

const buildSpecVariantOptions = (spec: ProcessedSpec[] | undefined): SpecVariantOption[] => {
  if (!spec || spec.length === 0) return []
  const counters: Record<string, number> = {}
  return spec
    .map((s) => {
      const unit = s.unit ?? ""
      const defaultAmount = Number(s.defaultAmount)
      const volume = Number(s.volume)
      if (!unit || !isFinite(defaultAmount) || !isFinite(volume) || volume <= 0) {
        return null
      }
      const slug = UNIT_MAPPINGS[unit] ?? unit
      counters[slug] = (counters[slug] ?? 0) + 1
      return {
        key: `${slug}-${counters[slug]}`,
        unit,
        defaultAmount,
        volume,
      } as SpecVariantOption
    })
    .filter((v): v is SpecVariantOption => v !== null)
}

// 把同 unit 的變體聚合成 Select 用的群組
const groupSpecVariants = (
  options: SpecVariantOption[]
): { unit: string; items: SpecVariantOption[] }[] => {
  const groups: { unit: string; items: SpecVariantOption[] }[] = []
  for (const o of options) {
    const last = groups[groups.length - 1]
    if (last && last.unit === o.unit) last.items.push(o)
    else groups.push({ unit: o.unit, items: [o] })
  }
  return groups
}

// 顯示用的小數處理：去尾零、最多保留 1 位（與 250kcal→55.1g 描述一致）
const formatAmount = (value: number): string => {
  if (!isFinite(value) || isNaN(value)) return "-"
  return Number(value.toFixed(1)).toString()
}

// 根據劑型決定 mass 顯示單位（ml / g / g/ml fallback）
const getMassUnit = (type: string): string =>
  type === "液劑" ? "ml" : type === "粉劑" ? "g" : "g/ml"

interface KcalUnitDisplayProps {
  spec: ProcessedSpec[] | undefined
  type: string
  caloriesPer100: number
  kcalInput: string
  selectedKey: string | null
  onSelectedKeyChange: (key: string) => void
  className?: string
}

function KcalUnitDisplay({
  spec,
  type,
  caloriesPer100,
  kcalInput,
  selectedKey,
  onSelectedKeyChange,
  className,
}: KcalUnitDisplayProps) {
  const variants = useMemo(() => buildSpecVariantOptions(spec), [spec])
  const groups = useMemo(() => groupSpecVariants(variants), [variants])

  const kcal = parseFloat(kcalInput)
  if (!kcal || kcal <= 0 || isNaN(kcal)) return null
  if (!caloriesPer100 || caloriesPer100 <= 0) return null

  const massUnit = getMassUnit(type)
  const mass = (kcal / caloriesPer100) * 100

  // 找到目前選定的變體；若 selectedKey 不在 variants 內（例如剛切換產品）就退回第一筆
  const selected =
    variants.find((v) => v.key === selectedKey) ?? variants[0] ?? null

  // 沒有任何變體 → 只顯示 mass，無 count、無括號
  if (!selected) {
    return (
      <div className={cn("text-xs text-muted-foreground", className)}>
        ≈ {formatAmount(mass)}
        {massUnit}
      </div>
    )
  }

  const count = mass / selected.volume
  const refTotal = selected.defaultAmount * selected.volume
  const refUnit = CALC_UNIT_MAPPINGS[selected.unit] ?? massUnit
  const isMultiVariant = variants.length > 1

  // 共用：括號內單一變體時的純文字
  const refText = (v: SpecVariantOption) =>
    `${formatAmount(v.defaultAmount)}${v.unit}=${formatAmount(
      v.defaultAmount * v.volume
    )}${CALC_UNIT_MAPPINGS[v.unit] ?? getMassUnit(type)}`

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground",
        className
      )}
    >
      <span className="tabular-nums">
        {formatAmount(mass)}
        {massUnit}
      </span>
      <span>≈</span>
      <span className="tabular-nums">
        {formatAmount(count)}
        {selected.unit}
      </span>
      {isMultiVariant ? (
        <span className="flex items-center gap-1">
          <span>（以</span>
          <Select value={selected.key} onValueChange={onSelectedKeyChange}>
            <SelectTrigger
              size="sm"
              className="h-6 px-2 py-0 text-xs gap-1 w-auto min-w-0"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) =>
                groups.length > 1 ? (
                  <SelectGroup key={g.unit}>
                    <SelectLabel>{g.unit}</SelectLabel>
                    {g.items.map((v) => (
                      <SelectItem key={v.key} value={v.key}>
                        {refText(v)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ) : (
                  g.items.map((v) => (
                    <SelectItem key={v.key} value={v.key}>
                      {refText(v)}
                    </SelectItem>
                  ))
                )
              )}
            </SelectContent>
          </Select>
          <span>）</span>
        </span>
      ) : (
        <span>
          （以 {formatAmount(selected.defaultAmount)}
          {selected.unit}={formatAmount(refTotal)}
          {refUnit}）
        </span>
      )}
    </div>
  )
}

// ─── 產品面板營養素內容區 ──────────────────────────────────────────────────────

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
  className?: string
}

function ProductPanelContent({
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
  className,
}: ProductPanelContentProps) {
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
          className="mb-3 justify-end"
        />
      )}

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
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 手機比較版面 ─────────────────────────────────────────────────────────────
// 桌機版維持原本左右兩個獨立 panel；手機版改成統一的「成分名 | A | B」三欄比較表，
// 上方兩個 mini header 並排，sticky 列僅固定純品名（不含其他資訊）。

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
}

function MobileCompareView({
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
}: MobileCompareViewProps) {
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

        {/* 三大營養素佔比（兩品分行顯示，便於比較） */}
        {!isLoading && showRatios && (
          <div className="px-3 py-2 space-y-1.5 border-b border-border/40">
            {mainRatios && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-muted-foreground w-4 shrink-0 font-medium">
                  A
                </span>
                {MACRO_CHIPS.map(({ key, label, bg, color }) => (
                  <span
                    key={key}
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: bg, color }}
                  >
                    {label} {mainRatios[key]}%
                  </span>
                ))}
              </div>
            )}
            {compareRatios && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-muted-foreground w-4 shrink-0 font-medium">
                  B
                </span>
                {MACRO_CHIPS.map(({ key, label, bg, color }) => (
                  <span
                    key={key}
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: bg, color }}
                  >
                    {label} {compareRatios[key]}%
                  </span>
                ))}
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
                  {group.items.map((key) => {
                    const label = NUTRIENT_LABELS[key] ?? key
                    const unit = NUTRIENT_UNITS[key] ?? ""
                    const aValue = mainDisplay[key]
                    const bValue = compareDisplay[key]
                    return (
                      <Fragment key={key}>
                        <span className="text-sm text-foreground/80 leading-tight py-0.5">
                          {label}
                        </span>
                        <span className="text-sm font-medium tabular-nums text-right whitespace-nowrap py-0.5">
                          {formatValue(aValue)}
                          {aValue !== undefined && unit && (
                            <span className="text-[10px] text-muted-foreground ml-0.5">
                              {unit}
                            </span>
                          )}
                        </span>
                        <span className="text-sm font-medium tabular-nums text-right whitespace-nowrap py-0.5">
                          {formatValue(bValue)}
                          {bValue !== undefined && unit && (
                            <span className="text-[10px] text-muted-foreground ml-0.5">
                              {unit}
                            </span>
                          )}
                        </span>
                      </Fragment>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 主 Dialog ────────────────────────────────────────────────────────────────

export function ProductDetailDialog({ item, open, onOpenChange }: ProductDetailDialogProps) {
  const { allProducts, productDetails, loadingProductIds, fetchProductDetail } = useProduct()

  // mainItem 可在比較模式關閉「左邊」時被替換為原本的 compareItem
  const [mainItem, setMainItem] = useState<ProductDetailDialogItem>(item)
  const [compareItem, setCompareItem] = useState<ProductDetailDialogItem | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // 兩個面板共用的單位模式狀態
  const [isKcalMode, setIsKcalMode] = useState(false)
  const [kcalInput, setKcalInput] = useState("100")

  // 各 panel 各自的「以 X = Y」參考單位選擇（key 來自 buildSpecVariantOptions）
  const [mainSelectedSpecKey, setMainSelectedSpecKey] = useState<string | null>(null)
  const [compareSelectedSpecKey, setCompareSelectedSpecKey] = useState<string | null>(null)

  const isCompareMode = compareItem !== null

  // 開啟 dialog（或切換 item）時重置內部狀態
  useEffect(() => {
    if (open) {
      setMainItem(item)
      setCompareItem(null)
      setSearchOpen(false)
      setSearchQuery("")
      setIsKcalMode(false)
      setKcalInput("100")
      setMainSelectedSpecKey(null)
      setCompareSelectedSpecKey(null)
    }
    // 只在 open 切換或 item.id 變動時重置
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item.id])

  const handleToggleKcal = () => {
    setIsKcalMode((prev) => {
      if (!prev) setKcalInput("100")
      return !prev
    })
  }

  // fetch 詳細資料
  useEffect(() => {
    if (open) fetchProductDetail(mainItem.id)
  }, [open, mainItem.id, fetchProductDetail])

  useEffect(() => {
    if (open && compareItem) fetchProductDetail(compareItem.id)
  }, [open, compareItem, fetchProductDetail])

  // mainItem / compareItem 切換時清掉舊的 spec 選擇，讓 KcalUnitDisplay 退回新 spec 第一筆
  useEffect(() => {
    setMainSelectedSpecKey(null)
  }, [mainItem.id])

  useEffect(() => {
    setCompareSelectedSpecKey(null)
  }, [compareItem?.id])

  const mainDetail = productDetails[mainItem.id]
  const compareDetail = compareItem ? productDetails[compareItem.id] : undefined
  const mainLoading = loadingProductIds.has(mainItem.id) && !mainDetail
  const compareLoading = compareItem
    ? loadingProductIds.has(compareItem.id) && !compareDetail
    : false

  const mainIngredients = mainDetail?.ingredientsPer100 ?? {}
  const compareIngredients = compareDetail?.ingredientsPer100 ?? {}

  // 計算單位標籤
  const mainEffectiveType = mainItem.type ?? mainDetail?.type ?? ""
  const compareEffectiveType = compareItem?.type ?? compareDetail?.type ?? ""
  const mainUnitLabel = getUnitLabel(mainEffectiveType)
  const compareUnitLabel = getUnitLabel(compareEffectiveType)

  // 比較模式：用兩個營養品的營養素聯集，缺值顯示 "-"，這樣兩邊行才能對齊
  const orderedGroupsForBoth = useMemo(() => {
    if (!isCompareMode) return null
    const unionKeys = Array.from(
      new Set([...validKeysOf(mainIngredients), ...validKeysOf(compareIngredients)])
    )
    return buildOrderedGroups(unionKeys)
  }, [isCompareMode, mainIngredients, compareIngredients])

  const orderedGroupsMainOnly = useMemo(
    () => buildOrderedGroups(validKeysOf(mainIngredients)),
    [mainIngredients]
  )

  const mainGroups = isCompareMode ? orderedGroupsForBoth ?? [] : orderedGroupsMainOnly
  const compareGroups = orderedGroupsForBoth ?? []

  // 搜尋下拉選項：排除已開啟的兩個 id，依輸入字串篩選名稱
  const compareOptions = useMemo(() => {
    const exclude = new Set(
      [mainItem.id, compareItem?.id].filter((v): v is string => Boolean(v))
    )
    const q = searchQuery.trim().toLowerCase()
    return allProducts
      .filter((p) => !exclude.has(p.id))
      .filter((p) => {
        if (!q) return true
        const name = p.name?.toLowerCase() ?? ""
        const engName = p.engName?.toLowerCase() ?? ""
        return name.includes(q) || engName.includes(q)
      })
  }, [allProducts, mainItem.id, compareItem?.id, searchQuery])

  const handleSelectCompare = (selected: ApiProductListData) => {
    setCompareItem({
      id: selected.id,
      name: selected.name,
      engName: selected.engName,
      brand: selected.brand,
      type: selected.type,
      categories: selected.categories,
    })
    setSearchOpen(false)
    setSearchQuery("")
  }

  // 關閉左邊 → 把右邊推上來，退出比較模式
  const handleCloseMain = () => {
    if (compareItem) {
      setMainItem(compareItem)
      setCompareItem(null)
    }
  }

  // 關閉右邊 → 直接退出比較模式
  const handleCloseCompare = () => {
    setCompareItem(null)
  }

  const dialogTitleText =
    isCompareMode && compareItem
      ? `${mainItem.name} 與 ${compareItem.name} 比較`
      : mainItem.name

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden",
          "sm:max-w-xl",
          isCompareMode && "md:max-w-4xl lg:max-w-5xl"
        )}
      >
        {/* radix 要求 DialogTitle，比較模式下兩邊各自有 h2，這裡 sr-only 統合 */}
        <DialogTitle className="sr-only">{dialogTitleText}</DialogTitle>

        {isCompareMode ? (
          <>
            {/* 桌機版：左右兩個獨立 panel（維持原本版面，僅以 hidden md:flex 限定顯示） */}
            <div className="hidden md:flex md:flex-col overflow-hidden">
              {/* 兩個 header 是同一個 flex-row 的直接子元素，自動等高 */}
              <div className="flex flex-col md:flex-row border-b border-border/60">
                <ProductPanelHeader
                  item={mainItem}
                  detail={mainDetail}
                  slotAction={
                    <PanelRemoveButton
                      onClick={handleCloseMain}
                      label="關閉此營養品（退出比較）"
                    />
                  }
                  className="flex-1 md:border-r md:border-border/60"
                />
                <ProductPanelHeader
                  item={compareItem}
                  detail={compareDetail}
                  slotAction={
                    <PanelRemoveButton
                      onClick={handleCloseCompare}
                      label="關閉此營養品（退出比較）"
                    />
                  }
                  className="flex-1 border-t border-border/60 md:border-t-0"
                />
              </div>
              {/* 單一 scroll 容器：兩側內容一起滾動 */}
              <div className="flex flex-col md:flex-row overflow-y-auto max-h-[60vh]">
                <ProductPanelContent
                  isLoading={mainLoading}
                  orderedGroups={mainGroups}
                  ingredients={mainIngredients}
                  isCompareMode={true}
                  unitLabel={mainUnitLabel}
                  isKcalMode={isKcalMode}
                  kcalInput={kcalInput}
                  onToggleKcal={handleToggleKcal}
                  onKcalInputChange={setKcalInput}
                  spec={mainDetail?.spec}
                  type={mainItem.type ?? mainDetail?.type ?? ""}
                  selectedSpecKey={mainSelectedSpecKey}
                  onSelectedSpecKeyChange={setMainSelectedSpecKey}
                  className="flex-1"
                />
                <ProductPanelContent
                  isLoading={compareLoading}
                  orderedGroups={compareGroups}
                  ingredients={compareIngredients}
                  isCompareMode={true}
                  unitLabel={compareUnitLabel}
                  isKcalMode={isKcalMode}
                  kcalInput={kcalInput}
                  onToggleKcal={handleToggleKcal}
                  onKcalInputChange={setKcalInput}
                  spec={compareDetail?.spec}
                  type={compareItem.type ?? compareDetail?.type ?? ""}
                  selectedSpecKey={compareSelectedSpecKey}
                  onSelectedSpecKeyChange={setCompareSelectedSpecKey}
                  className="flex-1 border-t border-border/60 md:border-t-0 md:border-l md:border-border/60"
                />
              </div>
            </div>

            {/* 手機版：統一「成分名 | A | B」三欄比較表（sticky 純品名列） */}
            <MobileCompareView
              mainItem={mainItem}
              compareItem={compareItem}
              mainDetail={mainDetail}
              compareDetail={compareDetail}
              mainLoading={mainLoading}
              compareLoading={compareLoading}
              mainIngredients={mainIngredients}
              compareIngredients={compareIngredients}
              mainUnitLabel={mainUnitLabel}
              compareUnitLabel={compareUnitLabel}
              orderedGroups={orderedGroupsForBoth ?? []}
              isKcalMode={isKcalMode}
              kcalInput={kcalInput}
              onToggleKcal={handleToggleKcal}
              onKcalInputChange={setKcalInput}
              onCloseMain={handleCloseMain}
              onCloseCompare={handleCloseCompare}
              mainSelectedSpecKey={mainSelectedSpecKey}
              compareSelectedSpecKey={compareSelectedSpecKey}
              onMainSelectedSpecKeyChange={setMainSelectedSpecKey}
              onCompareSelectedSpecKeyChange={setCompareSelectedSpecKey}
            />
          </>
        ) : (
          // ── 單品模式：header + 獨立 scroll 內容 ──
          <div className="flex flex-col overflow-hidden">
            <ProductPanelHeader
              item={mainItem}
              detail={mainDetail}
              slotAction={
                <CompareTrigger
                  open={searchOpen}
                  onOpenChange={setSearchOpen}
                  query={searchQuery}
                  setQuery={setSearchQuery}
                  options={compareOptions}
                  onSelect={handleSelectCompare}
                />
              }
              className="border-b border-border/60"
            />
            <div className="overflow-y-auto max-h-[65vh]">
              <ProductPanelContent
                isLoading={mainLoading}
                orderedGroups={mainGroups}
                ingredients={mainIngredients}
                isCompareMode={false}
                unitLabel={mainUnitLabel}
                isKcalMode={isKcalMode}
                kcalInput={kcalInput}
                onToggleKcal={handleToggleKcal}
                onKcalInputChange={setKcalInput}
                spec={mainDetail?.spec}
                type={mainItem.type ?? mainDetail?.type ?? ""}
                selectedSpecKey={mainSelectedSpecKey}
                onSelectedSpecKeyChange={setMainSelectedSpecKey}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
