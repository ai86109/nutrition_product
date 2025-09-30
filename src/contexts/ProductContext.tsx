"use client"

import { useBrandOptions, BrandOption } from '@/hooks/useProducts'
import { createContext, useContext, useState, ReactNode } from 'react'
import { type ApiProductData } from '@/types/api'

export type ProductContextType = {
  allProducts: ApiProductData[]
  productList: string[]
  setProductList: React.Dispatch<React.SetStateAction<string[]>> 
  brandOptions: BrandOption[]
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children, allProducts }: { children: ReactNode, allProducts: ApiProductData[] }) {
  // local state
  const [productList, setProductList] = useState<string[]>([])

  // fetched state
  const brandOptions = useBrandOptions(allProducts)

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

export function useProductContext(): ProductContextType {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider')
  }
  return context
}