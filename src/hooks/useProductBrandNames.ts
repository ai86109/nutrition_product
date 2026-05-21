"use client"

import { useEffect, useState } from 'react'
import { listProductBrandNames } from '@/lib/supabase/queries/product-brands'

/**
 * 載入目錄品牌名單（去重、依出現次數排序），給沒有 ProductProvider 的頁面用
 * （例如 /profile 的自訂營養品表單品牌建議）。
 *
 * - 只在 mount 時抓一次
 * - 失敗時回空陣列（query 內已 log）
 * - unmount 後不 setState，避免 race
 */
export function useProductBrandNames(): string[] {
  const [brands, setBrands] = useState<string[]>([])

  useEffect(() => {
    let active = true
    listProductBrandNames().then((list) => {
      if (active) setBrands(list)
    })
    return () => {
      active = false
    }
  }, [])

  return brands
}
