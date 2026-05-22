"use client"

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import AddCustomProductDialog from '@/components/custom-products/add-custom-product-dialog'
import EditCustomProductDialog from '@/components/custom-products/edit-custom-product-dialog'
import ImportCustomProductsDialog from '@/components/custom-products/import-custom-products-dialog'
import { useCustomProducts } from '@/hooks/useCustomProducts'
import { useProductBrandNames } from '@/hooks/useProductBrandNames'
import {
  createCustomProductImageSignedUrls,
  downloadCustomProductImageAsDataUrl,
} from '@/lib/supabase/storage/custom-product-images'
import {
  toExportItem,
  buildCustomProductExportFile,
  singleExportFilename,
  allExportFilename,
  downloadJsonFile,
} from '@/lib/custom-products/export'
import {
  MAX_CUSTOM_PRODUCTS,
  CUSTOM_PRODUCT_REQUIRED_NUTRIENTS,
  NUTRIENT_LABELS,
  NUTRIENT_UNITS,
} from '@/utils/constants'
import type {
  CustomProductForm,
  CustomProductWithVariants,
} from '@/types/custom-product'

const FORM_LABELS: Record<CustomProductForm, string> = {
  liquid: '液劑',
  powder: '粉劑',
  solid: '固態',
}

export default function MyCustomProductsList() {
  const { products, count, loading, refresh, remove } = useCustomProducts()

  // 品牌建議：目錄品牌（依出現次數）+ 使用者自己已建立的自訂品牌，去重後傳給表單
  const catalogBrands = useProductBrandNames()
  const brandSuggestions = useMemo(() => {
    const set = new Set<string>()
    for (const name of catalogBrands) {
      const t = name.trim()
      if (t) set.add(t)
    }
    for (const p of products) {
      const t = p.brand?.trim()
      if (t) set.add(t)
    }
    return Array.from(set)
  }, [catalogBrands, products])

  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<CustomProductWithVariants | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  // 私有 bucket：為有圖的產品批次產生簽名 URL（productId -> signedUrl）
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  useEffect(() => {
    const withImages = products.filter((p) => p.image_path)
    if (withImages.length === 0) {
      setImageUrls({})
      return
    }
    let active = true
    const paths = withImages.map((p) => p.image_path as string)
    createCustomProductImageSignedUrls(paths).then((pathToUrl) => {
      if (!active) return
      const map: Record<string, string> = {}
      for (const p of withImages) {
        const url = p.image_path ? pathToUrl[p.image_path] : undefined
        if (url) map[p.id] = url
      }
      setImageUrls(map)
    })
    return () => {
      active = false
    }
  }, [products])

  const atCap = count >= MAX_CUSTOM_PRODUCTS

  const handleAddClick = () => {
    if (atCap) {
      toast.error(
        `自訂營養品已達上限 ${MAX_CUSTOM_PRODUCTS} 筆，請先刪除其他自訂產品`
      )
      return
    }
    setAddOpen(true)
  }

  const handleDelete = async (p: CustomProductWithVariants) => {
    const ok = window.confirm(
      `確定要刪除自訂營養品「${p.name_zh}」？\n刪除後不會再出現在搜尋與計算，但已存入病人紀錄的歷史快照仍會保留。`
    )
    if (!ok) return

    setDeletingId(p.id)
    try {
      await remove(p.id)
      toast.success('已刪除自訂營養品')
    } catch (err) {
      console.error('Delete custom product failed:', err)
      toast.error('刪除失敗，請稍後再試')
    } finally {
      setDeletingId(null)
    }
  }

  const exportProducts = async (
    items: CustomProductWithVariants[],
    filename: string
  ) => {
    if (items.length === 0) return
    setExporting(true)
    try {
      // 有圖的先抓 base64 一起嵌入；沒圖的就不帶
      const exportItems = await Promise.all(
        items.map(async (p) => {
          const imageBase64 = p.image_path
            ? await downloadCustomProductImageAsDataUrl(p.image_path)
            : null
          return toExportItem(p, imageBase64)
        })
      )
      downloadJsonFile(filename, buildCustomProductExportFile(exportItems))
      toast.success('已匯出 JSON')
    } catch (err) {
      console.error('Export custom products failed:', err)
      toast.error('匯出失敗，請稍後再試')
    } finally {
      setExporting(false)
    }
  }

  const handleExportOne = (p: CustomProductWithVariants) =>
    exportProducts([p], singleExportFilename(p.name_zh))
  const handleExportAll = () => exportProducts(products, allExportFilename())

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full max-w-[260px]" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* header：count + 新增 */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          已建立 {count} / {MAX_CUSTOM_PRODUCTS} 筆
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setImportOpen(true)}
            title="從 .nutribase.json 匯入"
          >
            <Upload className="size-3.5" />
            匯入
          </Button>
          {products.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportAll}
              disabled={exporting}
              title="把全部自訂營養品匯出成 JSON"
            >
              <Download className="size-3.5" />
              匯出全部
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddClick}
            className={atCap ? 'opacity-60' : ''}
            title={atCap ? `已達上限 ${MAX_CUSTOM_PRODUCTS} 筆` : '新增自訂的營養品'}
          >
            <Plus className="size-3.5" />
            新增自訂營養品
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-md border bg-white p-8 text-center text-sm text-muted-foreground">
          你還沒有自訂營養品。點「新增自訂營養品」建立第一筆，建立後即可在搜尋、計算與收藏中使用。
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id} className="rounded-md border bg-white p-4 space-y-2">
              {/* 標題列：縮圖 / 名稱 / 劑型 / 操作 */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  {imageUrls[p.id] && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={imageUrls[p.id]}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-md border object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{p.name_zh}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {FORM_LABELS[p.form]}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.brand}
                      {p.name_en ? ` · ${p.name_en}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleExportOne(p)}
                    disabled={exporting || deletingId === p.id}
                    aria-label="匯出"
                  >
                    <Download className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setEditing(p)}
                    disabled={deletingId === p.id}
                    aria-label="編輯"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(p)}
                    disabled={deletingId === p.id}
                    aria-label="刪除"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* 包裝規格 */}
              <div className="flex flex-wrap gap-1.5">
                {p.variants.map((v) => (
                  <Badge
                    key={v.id}
                    variant="outline"
                    className="text-[11px] font-normal"
                  >
                    {v.quantity} {v.unit} × {v.volume} {p.weight_unit}
                    {v.is_default && (
                      <span className="ml-1 text-primary">（預設）</span>
                    )}
                  </Badge>
                ))}
              </div>

              {/* 營養成分摘要（每 standard_weight 的四項基本營養素） */}
              <div className="text-xs text-muted-foreground">
                每 {p.standard_weight} {p.weight_unit}：
                {CUSTOM_PRODUCT_REQUIRED_NUTRIENTS.map((k, i) => {
                  const entry = p.nutrition_facts[k]
                  const label = NUTRIENT_LABELS[k] ?? k
                  const unit = NUTRIENT_UNITS[k] ?? ''
                  return (
                    <span key={k}>
                      {i > 0 ? '、' : ''}
                      {label} {entry ? entry.value : '-'} {unit}
                    </span>
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddCustomProductDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={refresh}
        brandSuggestions={brandSuggestions}
      />
      <EditCustomProductDialog
        product={editing}
        open={editing !== null}
        onOpenChange={(o) => {
          if (!o) setEditing(null)
        }}
        onUpdated={refresh}
        brandSuggestions={brandSuggestions}
        initialImageUrl={editing ? imageUrls[editing.id] : undefined}
      />
      <ImportCustomProductsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        existingProducts={products}
        onImported={refresh}
      />
    </div>
  )
}
