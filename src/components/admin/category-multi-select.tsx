'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { updateProductCategories } from '@/lib/supabase/mutations/admin-products'
import {
  PRODUCT_CATEGORY_KEYS,
  PRODUCT_CATEGORY_LABELS,
  type ProductCategory,
} from '@/utils/product-categories'

interface CategoryMultiSelectProps {
  licenseNo: string
  currentCategories: ProductCategory[]
  disabled?: boolean
}

export default function CategoryMultiSelect({
  licenseNo,
  currentCategories,
  disabled,
}: CategoryMultiSelectProps) {
  const [categories, setCategories] = useState<ProductCategory[]>(currentCategories)
  const [loading, setLoading] = useState(false)

  async function handleToggle(value: ProductCategory) {
    const next = categories.includes(value)
      ? categories.filter((c) => c !== value)
      : [...categories, value]

    const previous = categories
    setCategories(next)
    setLoading(true)

    try {
      await updateProductCategories(licenseNo, next)
    } catch (error) {
      console.error('Failed to update categories:', error)
      setCategories(previous)
      alert('更新配方種類失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const label =
    categories.length === 0
      ? '未設定'
      : categories.map((c) => PRODUCT_CATEGORY_LABELS[c] ?? c).join('、')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || loading}
          className="w-[160px] justify-between font-normal"
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="w-4 h-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-2" align="start">
        <div className="flex flex-col gap-1">
          {PRODUCT_CATEGORY_KEYS.map((value) => {
            const checked = categories.includes(value)
            return (
              <label
                key={value}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => handleToggle(value)}
                  disabled={loading}
                />
                <span className="text-sm">{PRODUCT_CATEGORY_LABELS[value]}</span>
              </label>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
