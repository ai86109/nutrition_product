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
import { createCustomProduct } from '@/lib/supabase/mutations/custom-products'
import {
  uploadCustomProductImage,
  deleteCustomProductImage,
} from '@/lib/supabase/storage/custom-product-images'
import { useAuth } from '@/contexts/AuthContext'
import { CapLimitError } from '@/lib/errors'

interface AddCustomProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 新增成功後通知外層（例如重新撈 count） */
  onCreated?: () => void
  /** 品牌建議；沒有 ProductProvider 的頁面（/profile）傳入，首頁不傳改用 context */
  brandSuggestions?: string[]
}

export default function AddCustomProductDialog({
  open,
  onOpenChange,
  onCreated,
  brandSuggestions,
}: AddCustomProductDialogProps) {
  const { session } = useAuth()
  const userId = session?.user?.id
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (payload: CustomProductFormSubmitPayload) => {
    if (!userId) {
      toast.error('請先登入後再使用自訂營養品功能')
      return
    }

    setSubmitting(true)
    let uploadedPath: string | null = null
    try {
      // 有選圖先上傳，拿到 path 再連同產品一起寫入
      if (payload.imageBlob) {
        uploadedPath = await uploadCustomProductImage(userId, payload.imageBlob)
      }
      await createCustomProduct(
        userId,
        payload.product,
        payload.variants,
        uploadedPath
      )
      toast.success('已新增自訂營養品')
      onCreated?.()
      onOpenChange(false)
      // 重整 server component 讓首頁 allProducts 包含新建的自訂產品
      router.refresh()
    } catch (err: unknown) {
      // 建立失敗時清掉剛上傳的孤兒圖
      if (uploadedPath) await deleteCustomProductImage(uploadedPath)
      if (err instanceof CapLimitError) {
        toast.error(err.message)
      } else {
        console.error('Create custom product failed:', err)
        const code = (err as { code?: string })?.code
        if (code === '23514') {
          toast.error('資料不符合限制，請檢查欄位內容')
        } else {
          toast.error('新增失敗，請稍後再試')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新增自訂的營養品</DialogTitle>
          <DialogDescription>
            未收錄或自家配方的營養品，可在這裡建立後加入計算。
          </DialogDescription>
        </DialogHeader>

        <CustomProductForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="新增"
          submittingLabel="新增中..."
          submitting={submitting}
          brandSuggestions={brandSuggestions}
        />
      </DialogContent>
    </Dialog>
  )
}
