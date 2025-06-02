"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type ProductData = {
  id: string
  name: string
  engName: string
  brand: string
  type: string
  defaultAmount: string
  reviewStatus: string
  categories: string[]
  spec: {
    defaultAmount: string
    volume: string
    type: string
    unit: string
  }[]
  ingredients: {
    calories: number
    carbohydrate: number
    protein: number
    fat: number
    phosphorus: number
    kalium: number
    sodium: number
    fiber: number
  }
}

export type ProductContextType = {
  allProducts: ProductData[]
  setAllProducts: (products: ProductData[]) => void
  productList: string[]
  setProductList: (list: string[]) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [allProducts, setAllProducts] = useState([])
  const [productList, setProductList] = useState([])

  const fetchProductsData = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products data')
      }

      const result = await response.json() || []
      setAllProducts(result)
    } catch (error) {
      console.error('Error fetching products data:', error)
      setAllProducts([])
    }
  }

  useEffect(() => {
    fetchProductsData()
  }, [])

  return (
    <ProductContext.Provider value={{
      allProducts,
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