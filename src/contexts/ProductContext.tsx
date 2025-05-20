"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

export type ProductContextType = {
  productList: string[]
  setProductList: (list: string[]) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [productList, setProductList] = useState([])

  return (
    <ProductContext.Provider value={{
      productList,
      setProductList,
    }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProduct() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useNutrition must be used within a ProductContext')
  }
  return context
}