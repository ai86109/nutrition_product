import { useMemo } from 'react'
import { type ApiProductData } from '@/types/api'

export type BrandOption = {
  id: string
  name: string
}

export function useBrandOptions(allProducts: ApiProductData[]) {
  return useMemo(() => {
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
}
