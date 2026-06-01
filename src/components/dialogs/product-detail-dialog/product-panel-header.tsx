"use client"

import { useState, type ReactNode } from "react"
import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ApiProductData } from "@/types"
import type { ProductImagePublic } from "@/types/product-images"
import { getLinkPath } from "@/utils/external-links"
import ProductImageLightbox from "@/components/dialogs/product-image-lightbox"
import { cn } from "@/lib/utils"
import type { ProductDetailDialogItem } from "./types"

interface ProductPanelHeaderProps {
  item: ProductDetailDialogItem
  detail: ApiProductData | undefined
  /** 比較模式：移除按鈕；單品模式：比較搜尋觸發器 */
  slotAction?: ReactNode
  className?: string
}

/**
 * 產品面板標題區（圖片、品名、英文名、品牌、劑型徽章、slotAction）。
 * 在單品模式與比較模式（左右兩 panel + 手機 mini header）共用。
 */
export function ProductPanelHeader({
  item,
  detail,
  slotAction,
  className,
}: ProductPanelHeaderProps) {
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
            {item.productStatus === 'inactive' && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 border-transparent bg-rose-50 text-rose-600 hover:bg-rose-50"
              >
                下架
              </Badge>
            )}
            {item.productStatus === 'extension_pending' && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 border-transparent bg-violet-50 text-violet-600 hover:bg-violet-50"
              >
                展延中
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
