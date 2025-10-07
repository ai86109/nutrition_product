import { useProductCalculation } from "@/hooks/useProductCalculation";
import { act, renderHook } from "@testing-library/react";
import { mockListData, mockProductContext, mockProducts } from "../utils/test-data";
import { useProduct } from "@/contexts/ProductContext";

const mockUseProduct = jest.fn()
jest.mock('@/contexts/ProductContext', () => ({
  useProduct: () => mockUseProduct()
}))

describe('useProductCalculation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseProduct.mockReturnValue(() => mockProductContext())
  })

  describe('initial state', () => {
    test('listData', () => {
      const { result } = renderHook(() => useProductCalculation())
      expect(result.current.listData).toEqual([])
    })

    test('userInputs', () => {
      const { result } = renderHook(() => useProductCalculation())
      expect(result.current.userInputs).toEqual({})
      expect(typeof result.current.setUserInputs).toBe('function')
    })
  })

  describe('add to listData', () => {
    test('add one product', () => {
      const productId = mockProducts[0].id
      mockUseProduct.mockReturnValue({
        ...mockProductContext(),
        productList: [productId]
      });

      const { result } = renderHook(() => useProductCalculation());
      expect(result.current.listData.length).toBe(1)
      expect(result.current.listData[0].id).toBe(productId)
      expect(result.current.listData).toEqual([mockListData[0]])
    })

    test('add multiple products', () => {
      const productIds = mockProducts.slice(0, 3).map(p => p.id)
      mockUseProduct.mockReturnValue({
        ...mockProductContext(),
        productList: productIds
      });

      const { result } = renderHook(() => useProductCalculation());
      expect(result.current.listData.length).toBe(3)
      expect(result.current.listData).toEqual(mockListData)
    })
  })

  describe('userInputs state', () => {
    test('use setUserInputs function updates checked state', () => {
      const productId = mockProducts[0].id
      mockUseProduct.mockReturnValue({
        ...mockProductContext(),
        productList: [productId]
      });

      const { result } = renderHook(() => useProductCalculation());
      expect(result.current.userInputs).toEqual({})

      act(() => {
        result.current.setUserInputs((prev) => ({ ...prev, [productId]: { ...prev[productId], checked: false } }))
      })
      expect(result.current.userInputs).toEqual({ [productId]: { checked: false } })
    })

    test('use setUserInputs function updates quantity state', () => {
      const productId = mockProducts[0].id
      mockUseProduct.mockReturnValue({
        ...mockProductContext(),
        productList: [productId]
      });

      const { result } = renderHook(() => useProductCalculation());
      expect(result.current.userInputs).toEqual({})

      act(() => {
        result.current.setUserInputs((prev) => ({ ...prev, [productId]: { ...prev[productId], quantity: 3 } }))
      })
      expect(result.current.userInputs).toEqual({ [productId]: { quantity: 3 } })
    })

    test('use setUserInputs function updates product type state', () => {
      const productId = mockProducts[2].id
      mockUseProduct.mockReturnValue({
        ...mockProductContext(),
        productList: [productId]
      });
      const { result } = renderHook(() => useProductCalculation());
      expect(result.current.userInputs).toEqual({})

      act(() => {
        result.current.setUserInputs((prev) => ({ ...prev, [productId]: { ...prev[productId], selectedId: 'pack-2' } }))
      })
      expect(result.current.userInputs).toEqual({ [productId]: { selectedId: 'pack-2' } })
    })

    test('use setUserInputs function updates multiple states', () => {
      const productId = mockProducts[0].id
      mockUseProduct.mockReturnValue({
        ...mockProductContext(),
        productList: [productId]
      });

      const { result } = renderHook(() => useProductCalculation());
      expect(result.current.userInputs).toEqual({})

      act(() => {
        result.current.setUserInputs((prev) => ({ ...prev, [productId]: { ...prev[productId], checked: false, quantity: 2 } }))
      })
      expect(result.current.userInputs).toEqual({ [productId]: { checked: false, quantity: 2 } })
    })
  })

  describe('remove from listData', () => {
    test('remove product and its userInputs', () => {
      const productIds = mockProducts.slice(0, 3).map(p => p.id)
      mockUseProduct.mockReturnValue({
        ...mockProductContext(),
        productList: productIds
      });

      const { result } = renderHook(() => useProductCalculation());
      expect(result.current.listData.length).toBe(3)
      expect(result.current.listData).toEqual(mockListData)
      expect(result.current.userInputs).toEqual({})

      act(() => {
        result.current.setUserInputs((prev) => ({
          ...prev,
          [productIds[0]]: { ...prev[productIds[0]], checked: true, quantity: 1 },
          [productIds[1]]: { ...prev[productIds[1]], checked: false, quantity: 2 },
          [productIds[2]]: { ...prev[productIds[2]], checked: true, quantity: 3 },
        }))
      })
      expect(result.current.userInputs).toEqual({
        [productIds[0]]: { checked: true, quantity: 1 },
        [productIds[1]]: { checked: false, quantity: 2 },
        [productIds[2]]: { checked: true, quantity: 3 },
      })

      // removing the second product
      const newProductList = productIds.filter(id => id !== productIds[1])
      mockUseProduct.mockReturnValue({
        ...mockProductContext(),
        productList: newProductList
      });

      const { result: updatedResult } = renderHook(() => useProductCalculation());
      expect(updatedResult.current.listData.length).toBe(2)
      expect(updatedResult.current.listData.map(p => p.id)).toEqual([productIds[0], productIds[2]])
    })
  })
});
