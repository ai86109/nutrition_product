"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react'
import { ApiProductData, ApiProductListData, BrandOption, ProductContextType } from '@/types'

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children, allProducts }: { children: ReactNode, allProducts: ApiProductListData[] }) {
  const [productList, setProductList] = useState<string[]>([])
  const [productDetails, setProductDetails] = useState<Record<string, ApiProductData>>({})
  const [loadingProductIds, setLoadingProductIds] = useState<Set<string>>(new Set())

  const brandOptions = useMemo(() => {
    const brands = new Map<string, number>()

    allProducts.forEach((product: ApiProductListData) => {
      if (product.brand) {
        brands.set(product.brand, (brands.get(product.brand) || 0) + 1)
      }
    })

    const sortedBrands: BrandOption[] = Array.from(brands.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([brand]) => ({ id: brand, name: brand }))

    return [{ id: '全部', name: '全部' }, ...sortedBrands]
  }, [allProducts])

  const fetchProductDetail = useCallback(async (id: string) => {
    if (productDetails[id] || loadingProductIds.has(id)) return

    setLoadingProductIds(prev => new Set(prev).add(id))
    try {
      const res = await fetch(`/api/products/${id}`)
      if (!res.ok) throw new Error(`Failed to fetch product ${id}`)
      const data: ApiProductData = await res.json()
      setProductDetails(prev => ({ ...prev, [id]: data }))
    } catch (error) {
      console.error(`Error fetching product detail (${id}):`, error)
    } finally {
      setLoadingProductIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, [productDetails, loadingProductIds])

  return (
    <ProductContext.Provider value={{
      allProducts,
      productList,
      setProductList,
      brandOptions,
      productDetails,
      loadingProductIds,
      fetchProductDetail,
    }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProduct(): ProductContextType {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider')
  }
  return context
}

/**
 * 非強制版：不在 ProductProvider 內（例如 /profile）也能呼叫，拿不到時回傳 undefined。
 * 給「有 context 就用、沒有也能優雅降級」的元件用（例如自訂營養品表單的品牌建議）。
 */
export function useProductOptional(): ProductContextType | undefined {
  return useContext(ProductContext)
}