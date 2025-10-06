import { ProductProvider, useProduct } from "@/contexts/ProductContext";
import { ApiProductData } from "@/types";
import { renderHook } from "@testing-library/react";
import { mockProducts } from "../utils/test-data";

const createWrapper = (products: ApiProductData[] = mockProducts) => {
  return ({ children }: { children: React.ReactNode }) => (
    <ProductProvider allProducts={products}>{children}</ProductProvider>
  )
}

describe('ProductContext', () => {
  describe('ProductProvider', () => {
    test('provides context values to children', () => {
      const { result } = renderHook(() => useProduct(), { wrapper: createWrapper() });

      expect(result.current.allProducts).toEqual(mockProducts);
      expect(result.current.productList).toEqual([]);
      expect(result.current.setProductList).toBeInstanceOf(Function);
      expect(result.current.brandOptions).toEqual([
        { id: '全部', name: '全部' },
        { id: '雀巢', name: '雀巢' },
        { id: '亞培', name: '亞培' }
      ]);
    })
  })

  describe('allProducts', () => {
    test('handle empty product', () => {
      const { result } = renderHook(() => useProduct(), { wrapper: createWrapper([]) });
  
      expect(result.current.allProducts).toEqual([]);
      expect(result.current.brandOptions).toEqual([
        { id: '全部', name: '全部' },
      ]);
    })
  })

  describe('brands', () => {
    test('handle products without brand', () => {
      const productsWithoutBrand = [
        { ...mockProducts[0], brand: '' },
        { ...mockProducts[1], brand: undefined },
      ]
  
      const { result } = renderHook(() => useProduct(), { wrapper: createWrapper(productsWithoutBrand as ApiProductData[]) });
  
      expect(result.current.brandOptions).toEqual([
        { id: '全部', name: '全部' },
      ]);
    })

    test('brand options ordering by product count (descending)', () => {
      const productsWithSameBrand = [
        { ...mockProducts[0] },
        { ...mockProducts[1] },
        { ...mockProducts[1], id: '1139093029' },
      ]
  
      const { result } = renderHook(() => useProduct(), { wrapper: createWrapper(productsWithSameBrand) });
  
      expect(result.current.brandOptions).toEqual([
        { id: '全部', name: '全部' },
        { id: '亞培', name: '亞培' },
        { id: '雀巢', name: '雀巢' },
      ]);
    });
  })
})