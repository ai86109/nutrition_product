import { ProductProvider, useProduct } from "@/contexts/ProductContext";
import { ApiProductData } from "@/types";
import { renderHook } from "@testing-library/react";

const mockProducts: ApiProductData[] = [
  {
    "categories": [
      "均衡配方",
      "濃縮配方"
    ],
    "reviewStatus": "TRUE",
    "id": "1086036948",
    "name": "立攝適均康1.5熱量濃縮完整均衡營養配方香草口味",
    "engName": "RESOURCE 1.5 CAL (ACBL1001-1)",
    "brand": "雀巢",
    "type": "液劑",
    "spec": [
      {
        "type": "液劑",
        "unit": "罐",
        "defaultAmount": "1",
        "volume": "250"
      }
    ],
    "defaultAmount": "250",
    "ingredients": {
      "calories": 382.8,
      "carbohydrate": 47.5,
      "protein": 16,
      "fat": 14.8,
      "phosphorus": 192,
      "potassium": 450,
      "sodium": 250,
      "fiber": 3
    }
  },
  {
    "categories": [
      "均衡配方",
      "濃縮配方"
    ],
    "reviewStatus": "TRUE",
    "id": "1139093028",
    "name": "健力體1.2熱量濃縮含纖維質及果寡醣均衡營養配方",
    "engName": "Jevity Plus 1.2",
    "brand": "亞培",
    "type": "液劑",
    "spec": [
      {
        "type": "液劑",
        "unit": "罐",
        "defaultAmount": "1",
        "volume": "237"
      }
    ],
    "defaultAmount": "237",
    "ingredients": {
      "calories": 289,
      "carbohydrate": 40.9,
      "protein": 13.2,
      "fat": 9.3,
      "phosphorus": 190,
      "potassium": 438,
      "sodium": 299,
      "fiber": 5.2
    }
  }
]

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