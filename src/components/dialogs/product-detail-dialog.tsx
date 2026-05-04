"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useProduct } from "@/contexts/ProductContext"
import { ApiProductData, ApiProductListData, IngredientsData } from "@/types"
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
    <div className="relative group/tip hidden md:block shrink-0">
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
  className,
}: ProductPanelContentProps) {
  const singleColumn = isCompareMode
  const calories = ingredients["calories"] ?? 0

  // 依 kcal 模式縮放所有營養素數值
  const displayIngredients = useMemo((): IngredientsData => {
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
  }, [isKcalMode, kcalInput, ingredients, calories])

  // "100 ml" → "ml"、"100 g" → "g"，作為切回原單位的按鈕文字
  const unitShort = unitLabel.split(" ").slice(1).join(" ")

  return (
    <div className={cn("px-5 py-4", className)}>
      <div className="flex items-center justify-between mb-3">
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
          // ── 比較模式：header 並排（等高）+ 內容共用一個 scroll 容器 ──
          <div className="flex flex-col overflow-hidden">
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
                className="flex-1 border-t border-border/60 md:border-t-0 md:border-l md:border-border/60"
              />
            </div>
          </div>
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
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
