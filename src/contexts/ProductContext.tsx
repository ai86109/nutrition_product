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
  brandOptions: { id: string; name: string }[]
  setBrandOptions: (options: { id: string; name: string }[]) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [allProducts, setAllProducts] = useState([])
  const [productList, setProductList] = useState([])
  const [brandOptions, setBrandOptions] = useState([])

  const fetchProductsData = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products data')
      }

      const result = await response.json() || []
      setAllProducts(result)
      // set brand
      const brands = new Map<string, number>()
      result.forEach((product: ProductData) => {
        if (product.brand) {
          if (!brands.has(product.brand)) {
            brands.set(product.brand, 1)
          } else {
            brands.set(product.brand, brands.get(product.brand)! + 1)
          }
        }
      })
      const sortedBrands = Array.from(brands.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([brand]) => ({ id: brand, name: brand }))
      
      setBrandOptions(sortedBrands)
      
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
      brandOptions,
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