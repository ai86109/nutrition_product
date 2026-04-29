'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateProductStatus } from '@/lib/supabase/mutations/admin-products'
import type { ProductStatus } from '@/lib/supabase/queries/admin-products'

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: '上架',
  inactive: '下架',
  extension_pending: '展延中',
}

interface ProductStatusSelectProps {
  licenseNo: string
  currentStatus: ProductStatus | null
}

export default function ProductStatusSelect({
  licenseNo,
  currentStatus,
}: ProductStatusSelectProps) {
  const [status, setStatus] = useState<ProductStatus | null>(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleChange(newStatus: ProductStatus) {
    if (newStatus === status) return
    const previous = status
    setStatus(newStatus)
    setLoading(true)

    try {
      await updateProductStatus(licenseNo, newStatus)
    } catch (error) {
      console.error('Failed to update product status:', error)
      setStatus(previous)
      alert('更新產品狀態失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select
      value={status ?? undefined}
      onValueChange={(v) => handleChange(v as ProductStatus)}
      disabled={loading}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="未設定" />
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(PRODUCT_STATUS_LABELS) as [ProductStatus, string][]).map(
          ([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  )
}
