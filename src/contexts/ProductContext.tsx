"use client"

import { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { ApiProductData, BrandOption, ProductContextType } from '@/types'

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children, allProducts }: { children: ReactNode, allProducts: ApiProductData[] }) {
  // local state
  const [productList, setProductList] = useState<string[]>([])

  // fetched state
  const brandOptions = useMemo(() => {
    const brands = new Map<string, number>()

    allProducts.forEach((product: ApiProductData) => {
      if (product.brand) {
        brands.set(product.brand, (brands.get(product.brand) || 0) + 1)
      }
    })

    const sortedBrands: BrandOption[] = Array.from(brands.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([brand]) => ({ id: brand, name: brand }))

    // Add "All" option at the beginning
    return [{ id: '全部', name: '全部' }, ...sortedBrands]
  }, [allProducts])

  return (
    <ProductContext.Provider value={{
      allProducts,
      productList,
      setProductList,
      brandOptions,
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