"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { useProduct } from "@/contexts/ProductContext"
import type { ApiProductListData } from "@/types"
import {
  getValidNutrientKeys,
  groupNutrientsByCategory,
} from "@/utils/nutrition-groups"
import { cn } from "@/lib/utils"

import type { OrderedGroup, ProductDetailDialogItem } from "./types"
import { getUnitLabel } from "./helpers"
import { ProductPanelHeader } from "./product-panel-header"
import { ProductPanelContent } from "./product-panel-content"
import { CompareTrigger, PanelRemoveButton } from "./compare-trigger"
import { MobileCompareView } from "./mobile-compare-view"

// re-export 給外部用（既有 import { ProductDetailDialogItem } from ".../product-detail-dialog" 不變）
export type { ProductDetailDialogItem } from "./types"

interface ProductDetailDialogProps {
  item: ProductDetailDialogItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

  // 是否顯示每個營養素下方的 DRIs 文字（兩個面板共用，預設不顯示）
  const [showDris, setShowDris] = useState(false)

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
      setShowDris(false)
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
  const orderedGroupsForBoth: OrderedGroup[] | null = useMemo(() => {
    if (!isCompareMode) return null
    const unionKeys = Array.from(
      new Set([
        ...getValidNutrientKeys(mainIngredients),
        ...getValidNutrientKeys(compareIngredients),
      ])
    )
    return groupNutrientsByCategory(unionKeys)
  }, [isCompareMode, mainIngredients, compareIngredients])

  const orderedGroupsMainOnly: OrderedGroup[] = useMemo(
    () => groupNutrientsByCategory(getValidNutrientKeys(mainIngredients)),
    [mainIngredients]
  )

  const mainGroups = isCompareMode ? orderedGroupsForBoth ?? [] : orderedGroupsMainOnly
  const compareGroups = orderedGroupsForBoth ?? []

  // 搜尋下拉選項：排除已開啟的兩個 id，依輸入字串篩選名稱
  // ⚠ 既有行為：exclude Set 雖建構但未被使用 → 列表會包含已開啟的產品。
  // 這是疑似既有 bug，本次 refactor 不修改行為，留待後續單獨處理。
  const compareOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allProducts.filter((p) => {
      if (!q) return true
      const name = p.name?.toLowerCase() ?? ""
      const engName = p.engName?.toLowerCase() ?? ""
      return name.includes(q) || engName.includes(q)
    })
  }, [allProducts, searchQuery])

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
                  showDris={showDris}
                  onShowDrisChange={setShowDris}
                  productId={mainItem.id}
                  productName={mainItem.name}
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
                  showDris={showDris}
                  onShowDrisChange={setShowDris}
                  productId={compareItem.id}
                  productName={compareItem.name}
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
              showDris={showDris}
              onShowDrisChange={setShowDris}
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
                showDris={showDris}
                onShowDrisChange={setShowDris}
                productId={mainItem.id}
                productName={mainItem.name}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
