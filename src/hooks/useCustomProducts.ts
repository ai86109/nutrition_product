"use client"

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  listActiveCustomProducts,
  countActiveCustomProducts,
} from '@/lib/supabase/queries/custom-products'
import {
  createCustomProduct,
  updateCustomProduct,
  softDeleteCustomProduct,
  restoreCustomProduct,
} from '@/lib/supabase/mutations/custom-products'
import type {
  CustomProductInput,
  CustomProductVariantInput,
  CustomProductWithVariants,
} from '@/types/custom-product'

/**
 * 自訂營養品的 client-side 操作 hook。
 *
 * - 載入時 fetch 一次未刪除的清單；mutation 之後手動 refresh
 * - `count` 是衍生狀態，給 UI 顯示「n / MAX_CUSTOM_PRODUCTS」用
 * - 所有 mutation 都會把 CapLimitError 往上拋給 caller toast；caller 也要負責呼叫 refresh
 * - 未登入時 loading 結束後 list 為空，count 為 0
 */
export function useCustomProducts() {
  const { isLoggedIn } = useAuth()
  const [products, setProducts] = useState<CustomProductWithVariants[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const list = await listActiveCustomProducts()
      setProducts(list)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (
      userId: string,
      product: CustomProductInput,
      variants: CustomProductVariantInput[]
    ) => {
      const created = await createCustomProduct(userId, product, variants)
      await refresh()
      return created
    },
    [refresh]
  )

  const update = useCallback(
    async (
      id: string,
      product: CustomProductInput,
      variants: CustomProductVariantInput[]
    ) => {
      const updated = await updateCustomProduct(id, product, variants)
      await refresh()
      return updated
    },
    [refresh]
  )

  const remove = useCallback(
    async (id: string) => {
      await softDeleteCustomProduct(id)
      await refresh()
    },
    [refresh]
  )

  const restore = useCallback(
    async (userId: string, id: string) => {
      await restoreCustomProduct(userId, id)
      await refresh()
    },
    [refresh]
  )

  return {
    products,
    count: products.length,
    loading,
    refresh,
    create,
    update,
    remove,
    restore,
  }
}

/**
 * 輕量版：只要拿目前未刪除自訂產品的「筆數」，不需要完整列表。
 *
 * 用途：UI 顯示 cap 提示（n/3）、進入新增 dialog 前的快速 cap 預檢。
 * mutation 內部仍會做權威性 cap 檢查。
 */
export function useCustomProductCount() {
  const { isLoggedIn } = useAuth()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setCount(0)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const n = await countActiveCustomProducts()
      setCount(n)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { count, loading, refresh }
}
