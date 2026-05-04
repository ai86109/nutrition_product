'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { compressImage, formatBytes } from '@/lib/image-compression'
import { createClient } from '@/utils/supabase/client'
import { getProductImages } from '@/lib/supabase/queries/product-images'
import {
  addProductImage,
  deleteProductImage,
  reorderProductImages,
} from '@/lib/supabase/mutations/admin-product-images'
import type { ProductImageWithUrl } from '@/types/product-images'
import { PRODUCT_IMAGE_MAX_COUNT } from '@/types/product-images'

const BUCKET = 'product-images'

interface AdminProductImagesSheetProps {
  licenseNo: string
  productName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UploadProgress {
  current: number
  total: number
  stage: 'compress' | 'upload' | 'done'
}

export default function AdminProductImagesSheet({
  licenseNo,
  productName,
  open,
  onOpenChange,
}: AdminProductImagesSheetProps) {
  const [images, setImages] = useState<ProductImageWithUrl[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 載入圖片清單
  const loadImages = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getProductImages(licenseNo)
      setImages(list)
    } catch (err) {
      console.error('Failed to load product images:', err)
      alert('載入圖片清單失敗，請重新開啟此面板')
    } finally {
      setLoading(false)
    }
  }, [licenseNo])

  // 開啟 sheet 或切換產品時載入
  useEffect(() => {
    if (open) {
      loadImages()
    } else {
      // 關閉時重置 state（避免下次開啟瞬間看到舊資料）
      setImages([])
      setUploadProgress(null)
    }
  }, [open, loadImages])

  const remainingSlots = PRODUCT_IMAGE_MAX_COUNT - images.length
  const canUpload = remainingSlots > 0 && !uploadProgress

  // 處理檔案選擇
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    if (uploadProgress) return // 防止重入

    const fileArr = Array.from(files)

    // 前端先擋：超過上限的部分截掉
    const acceptCount = Math.min(fileArr.length, remainingSlots)
    if (acceptCount === 0) {
      alert(`已達 ${PRODUCT_IMAGE_MAX_COUNT} 張上限`)
      return
    }
    if (acceptCount < fileArr.length) {
      alert(
        `目前只能再上傳 ${remainingSlots} 張，已自動取前 ${acceptCount} 張處理`
      )
    }

    const toUpload = fileArr.slice(0, acceptCount)
    const supabase = createClient()

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i]

      try {
        // 1. 壓縮
        setUploadProgress({ current: i + 1, total: toUpload.length, stage: 'compress' })
        const { blob, width, height, byteSize } = await compressImage(file)

        // 2. 上傳 storage
        setUploadProgress({ current: i + 1, total: toUpload.length, stage: 'upload' })
        const storagePath = `${licenseNo}/${crypto.randomUUID()}.webp`
        const { error: storageError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, blob, {
            contentType: 'image/webp',
            upsert: false,
          })

        if (storageError) throw storageError

        // 3. 寫 DB row（SQL 端會再次檢查 5 張上限，雙保險）
        try {
          await addProductImage({
            licenseNo,
            storagePath,
            width,
            height,
            byteSize,
          })
        } catch (dbError) {
          // DB 寫入失敗 → 立即清掉剛剛上傳的 storage 物件，避免孤兒檔
          await supabase.storage.from(BUCKET).remove([storagePath])
          throw dbError
        }
      } catch (err) {
        console.error(`Upload failed for ${file.name}:`, err)
        const msg = err instanceof Error ? err.message : '未知錯誤'
        alert(`上傳「${file.name}」失敗：${msg}`)
        // 失敗後中斷批次，不繼續處理剩下的
        break
      }
    }

    setUploadProgress({ current: toUpload.length, total: toUpload.length, stage: 'done' })
    await loadImages()
    setUploadProgress(null)

    // 清空 input value，讓使用者可以再次選同樣的檔案
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // 拖曳排序
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = images.findIndex((i) => i.id === active.id)
    const newIndex = images.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const previous = images
    const reordered: ProductImageWithUrl[] = arrayMove(images, oldIndex, newIndex)
    setImages(reordered) // optimistic

    try {
      await reorderProductImages(
        licenseNo,
        reordered.map((i) => i.id)
      )
    } catch (err) {
      console.error('Reorder failed:', err)
      alert('重新排序失敗，已還原順序')
      setImages(previous)
    }
  }

  async function handleDelete(image: ProductImageWithUrl) {
    if (!confirm('確定刪除這張圖片？')) return

    const previous = images
    setImages((curr) => curr.filter((i) => i.id !== image.id)) // optimistic

    try {
      await deleteProductImage(image.id)
    } catch (err) {
      console.error('Delete failed:', err)
      alert('刪除失敗，已還原')
      setImages(previous)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg flex flex-col gap-0 p-0"
      >
        <SheetHeader className="border-b">
          <SheetTitle className="text-base">{productName}</SheetTitle>
          <SheetDescription>
            產品圖片管理（上限 {PRODUCT_IMAGE_MAX_COUNT} 張，自動壓縮為 WebP）
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <ImagesSkeleton />
          ) : images.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              尚無圖片，點下方按鈕上傳
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map((i) => i.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-2 gap-3">
                  {images.map((image, idx) => (
                    <SortableThumb
                      key={image.id}
                      image={image}
                      index={idx}
                      onDelete={() => handleDelete(image)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="border-t p-4 space-y-3">
          {uploadProgress && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {uploadProgress.stage === 'compress' && '壓縮中'}
                {uploadProgress.stage === 'upload' && '上傳中'}
                {uploadProgress.stage === 'done' && '完成中'}
                {' '}
                {uploadProgress.current}/{uploadProgress.total}
              </span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={!canUpload}
            className="w-full"
          >
            <ImagePlus className="h-4 w-4" />
            {remainingSlots > 0
              ? `上傳圖片（還可上傳 ${remainingSlots} 張）`
              : '已達上限'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── 縮圖卡片（可拖曳） ─────────────────────────────────────────────────────

interface SortableThumbProps {
  image: ProductImageWithUrl
  index: number
  onDelete: () => void
}

function SortableThumb({ image, index, onDelete }: SortableThumbProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group rounded-md overflow-hidden border bg-muted',
        isDragging && 'opacity-50 ring-2 ring-primary'
      )}
    >
      {/* 拖曳把手覆蓋整張縮圖 */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="block w-full aspect-square cursor-grab active:cursor-grabbing"
        aria-label={`第 ${index + 1} 張，按住拖曳排序`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.publicUrl}
          alt={`product image ${index + 1}`}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      </button>

      {/* 左上角序號 */}
      <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white tabular-nums">
        {index + 1}
      </span>

      {/* 右上角刪除 */}
      <button
        type="button"
        onClick={onDelete}
        className={cn(
          'absolute top-1 right-1 p-1 rounded bg-black/60 text-white',
          'opacity-0 group-hover:opacity-100 focus:opacity-100',
          'transition-opacity hover:bg-destructive'
        )}
        aria-label="刪除這張圖片"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {/* 底部資訊：尺寸 / 大小 */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent text-[10px] text-white px-1.5 py-1 leading-tight">
        {image.width && image.height && (
          <div className="tabular-nums">
            {image.width}×{image.height}
          </div>
        )}
        {image.byte_size != null && (
          <div className="tabular-nums opacity-80">
            {formatBytes(image.byte_size)}
          </div>
        )}
      </div>
    </div>
  )
}

function ImagesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="aspect-square w-full" />
      ))}
    </div>
  )
}
