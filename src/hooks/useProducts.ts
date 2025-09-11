import { useMemo } from 'react'
import useSWR from 'swr'

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

export type BrandOption = {
  id: string
  name: string
}

const fetcher = async (url: string): Promise<ProductData[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch products data')
  }

  return response.json()
}

export function useProducts() {
  const { data, error, isLoading } = useSWR('/api/products', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60 * 1000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    fallbackData: [],
  })

  return {
    allProducts: data || [],
    isLoading,
    isError: error,
  }
}

export function useBrandOptions() {
  const { allProducts } = useProducts()

  return useMemo(() => {
    const brands = new Map<string, number>()

    allProducts.forEach((product: ProductData) => {
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
}
