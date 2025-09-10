"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export type ProductData = {
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
    potassium: number
    sodium: number
    fiber: number
  }
}

type BrandOption = {
  id: string
  name: string
}

export type ProductContextType = {
  allProducts: ProductData[]
  setAllProducts: (products: ProductData[]) => void
  productList: string[]
  setProductList: React.Dispatch<React.SetStateAction<string[]>> 
  brandOptions: BrandOption[]
  setBrandOptions: (options: BrandOption[]) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [allProducts, setAllProducts] = useState<ProductData[]>([])
  const [productList, setProductList] = useState<string[]>([])
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([])

  const fetchProductsData = async (): Promise<void> => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products data')
      }

      const result: ProductData[] = await response.json() || []
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
      let sortedBrands: BrandOption[] = Array.from(brands.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([brand]) => ({ id: brand, name: brand }))

      // Add "All" option at the beginning
      sortedBrands = [{ id: '全部', name: '全部' }, ...sortedBrands]
      
      setBrandOptions(sortedBrands)
      
    } catch (error) {
      console.error('Error fetching products data:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
      }

      setAllProducts([])
    }
  }

  useEffect(() => {
    fetchProductsData()
  }, [])

  return (
    <ProductContext.Provider value={{
      allProducts,
      setAllProducts,
      productList,
      setProductList,
      brandOptions,
      setBrandOptions
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