"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import CustomProductForm, {
  type CustomProductFormSubmitPayload,
} from './custom-product-form'
import { updateCustomProduct } from '@/lib/supabase/mutations/custom-products'
import type { CustomProductWithVariants } from '@/types/custom-product'

interface EditCustomProductDialogProps {
  /** 要編輯的產品；null 時不渲染表單（dialog 關閉狀態）。 */
  product: CustomProductWithVariants | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 更新成功後通知外層（例如重新撈清單） */
  onUpdated?: () => void
  /** 品牌建議；沒有 ProductProvider 的頁面（/profile）傳入 */
  brandSuggestions?: string[]
}

export default function EditCustomProductDialog({
  product,
  open,
  onOpenChange,
  onUpdated,
  brandSuggestions,
}: EditCustomProductDialogProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (payload: CustomProductFormSubmitPayload) => {
    if (!product) return

    setSubmitting(true)
    try {
      await updateCustomProduct(product.id, payload.product, payload.variants)
      toast.success('已更新自訂營養品')
      onUpdated?.()
      onOpenChange(false)
      // 重整 server component 讓首頁 allProducts 反映更新後的資料
      router.refresh()
    } catch (err: unknown) {
      console.error('Update custom product failed:', err)
      const code = (err as { code?: string })?.code
      if (code === '23514') {
        toast.error('資料不符合限制，請檢查欄位內容')
      } else {
        toast.error('更新失敗，請稍後再試')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>編輯自訂的營養品</DialogTitle>
          <DialogDescription>
            修改後會同步套用到搜尋、計算與收藏；已存入病人紀錄的歷史快照不受影響。
          </DialogDescription>
        </DialogHeader>

        {product && (
          // key 確保切換不同產品時表單重新初始化（CustomProductForm 的 state 只在 mount 時讀 initial）
          <CustomProductForm
            key={product.id}
            initial={product}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            submitLabel="儲存"
            submittingLabel="儲存中..."
            submitting={submitting}
            brandSuggestions={brandSuggestions}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
