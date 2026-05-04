'use client'

import Lightbox from 'yet-another-react-lightbox'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

// Lightbox 自帶 CSS（在 component 層 import，避免污染全站樣式）
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/counter.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'

import type { ProductImagePublic } from '@/types/product-images'

interface ProductImageLightboxProps {
  images: ProductImagePublic[]
  /** 開啟時要展示的初始索引（從 0 開始） */
  index: number
  open: boolean
  onClose: () => void
}

/**
 * 產品圖片 Lightbox。
 *
 * Plugin 配置：
 *   - Counter   ：右上「2 / 5」
 *   - Thumbnails：底部縮略圖列（單張時自動隱藏）
 *   - Zoom      ：雙擊放大、滾輪縮放（看營養標示細節）
 */
export default function ProductImageLightbox({
  images,
  index,
  open,
  onClose,
}: ProductImageLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={images.map((img) => ({
        src: img.publicUrl,
        width: img.width ?? undefined,
        height: img.height ?? undefined,
      }))}
      plugins={[Counter, Thumbnails, Zoom]}
      // 單張時不顯示底部縮略圖列
      thumbnails={{ showToggle: images.length > 1, vignette: false }}
      // counter 預設位置在左上，這裡不改
      controller={{ closeOnBackdropClick: true }}
    />
  )
}
