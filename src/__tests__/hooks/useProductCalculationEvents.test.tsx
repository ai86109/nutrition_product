import { useProductCalculationEvents } from "@/hooks/useProductCalculationEvents";
import { mockProductContext, mockProducts } from "../utils/test-data";
import { act, renderHook } from "@testing-library/react";
import { useProductCalculation } from "@/hooks/useProductCalculation";

const mockUseProduct = jest.fn()
jest.mock('@/contexts/ProductContext', () => ({
  useProduct: () => mockUseProduct()
}))

describe('useProductCalculationEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseProduct.mockReturnValue(() => mockProductContext())
  })

  describe('handleCheck', () => {
    test('update userInputs with checked state', () => {
      const productId = mockProducts[0].id
      mockUseProduct.mockReturnValue({
        ...mockProductContext(),
        productList: [productId]
      });

      const { result } = renderHook(() => useProductCalculation());
      expect(result.current.userInputs).toEqual({})

      const { handleCheck } = useProductCalculationEvents(result.current.listData, result.current.setUserInputs)

      act(() => {
        handleCheck(productId, false)
      })
      expect(result.current.userInputs[productId].checked).toBe(false)
    });
  });

  describe('handleInputChange', () => {
    test('update userInputs with quantity value', () => {
      const productId = mockProducts[0].id
      mockUseProduct.mockReturnValue({
        ...mockProductContext(),
        productList: [productId]
      });

      const { result } = renderHook(() => useProductCalculation());
      expect(result.current.userInputs).toEqual({})

      const { handleInputChange } = useProductCalculationEvents(result.current.listData, result.current.setUserInputs)

      act(() => {
        handleInputChange({
          target: {
            id: productId,
            value: '200'
          }
        } as React.ChangeEvent<HTMLInputElement>)
      })
      expect(result.current.userInputs[productId].quantity).toBe('200')
    });
  });

  describe('handleValueChange', () => {
    test('update userInputs with selectedId and quantity', () => {
      const productId = mockProducts[0].id
      mockUseProduct.mockReturnValue({
        ...mockProductContext(),
        productList: [productId]
      });

      const { result } = renderHook(() => useProductCalculation());
      expect(result.current.userInputs).toEqual({})

      const { handleValueChange } = useProductCalculationEvents(result.current.listData, result.current.setUserInputs)

      act(() => {
        handleValueChange('pack-3', productId)
      })
      expect(result.current.userInputs[productId].selectedId).toBe('pack-3')
      expect(result.current.userInputs[productId].quantity).toBe(1)
    });
  });

  describe('handleRemoveProduct', () => {
    test('remove product from productList and userInputs', () => {
      const productId = mockProducts[0].id
      mockUseProduct.mockReturnValue({
        ...mockProductContext(),
        productList: [productId]
      });

      const { result } = renderHook(() => useProductCalculation());
      expect(result.current.userInputs).toEqual({})

      const { handleRemoveProduct } = useProductCalculationEvents(result.current.listData, result.current.setUserInputs)

      act(() => {
        handleRemoveProduct(productId)
      })
      expect(result.current.userInputs[productId]).toBeUndefined()
    });
  });
});
