"use client"

import { useProducts, useBrandOptions, ProductData, BrandOption } from '@/hooks/useProducts'
import { createContext, useContext, useState, ReactNode } from 'react'

export type ProductContextType = {
  allProducts: ProductData[]
  isLoading: boolean
  isError: Error | undefined
  productList: string[]
  setProductList: React.Dispatch<React.SetStateAction<string[]>> 
  brandOptions: BrandOption[]
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  // local state
  const [productList, setProductList] = useState<string[]>([])

  // fetched state
  const { allProducts, isLoading, isError } = useProducts()
  const brandOptions = useBrandOptions()

  return (
    <ProductContext.Provider value={{
      allProducts,
      isLoading,
      isError,
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
    throw new Error('useNutrition must be used within a ProductContext')
  }
  return context
}