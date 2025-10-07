import { useIngredientCalculation } from "@/hooks/useIngredientCalaculation";
import { renderHook } from "@testing-library/react";
import { mockListData } from "../utils/test-data";

describe('useIngredientCalculation', () => {
  describe('initial state', () => {
    test('initial calculation with empty listData', () => {
      const { result } = renderHook(() => useIngredientCalculation([]));
      expect(result.current.ingredientsData).toEqual({
        calories: 0,
        carbohydrate: 0,
        protein: 0,
        fat: 0,
        phosphorus: 0,
        potassium: 0,
        sodium: 0,
        fiber: 0,
      });
    });
  });

  describe('calculation with listData', () => {
    test('calculate ingredients with one product', () => {
      const { result } = renderHook(() => useIngredientCalculation([mockListData[0]]))
      expect(result.current.ingredientsData).toEqual({
        calories: 382.8,
        carbohydrate: 47.5,
        protein: 16,
        fat: 14.8,
        phosphorus: 192,
        potassium: 450,
        sodium: 250,
        fiber: 3,
      });
    });

    test('calculate ingredients with multiple products', () => {
      const { result } = renderHook(() => useIngredientCalculation(mockListData))
      expect(result.current.ingredientsData).toEqual({
        calories: 773.0807017543859,
        carbohydrate: 101.9578947368421,
        protein: 33.27543859649123,
        fat: 27.85263157894737,
        phosphorus: 451,
        potassium: 1014.7017543859649,
        sodium: 633.3333333333334,
        fiber: 9.733333333333333,
      });
    });

    test('calculate ingredients with unchecked product', () => {
      const uncheckedProduct = { ...mockListData[0], checked: false }
      const { result } = renderHook(() => useIngredientCalculation([uncheckedProduct, mockListData[1]]))
      expect(result.current.ingredientsData).toEqual({
        calories: 289,
        carbohydrate: 40.9,
        protein: 13.2,
        fat: 9.3,
        phosphorus: 190,
        potassium: 438,
        sodium: 299,
        fiber: 5.2,
      });
    });

    test('calculate ingredients with zero quantity', () => {
      const zeroQuantityProduct = { ...mockListData[0], quantity: 0 }
      const { result } = renderHook(() => useIngredientCalculation([zeroQuantityProduct, mockListData[1]]))
      expect(result.current.ingredientsData).toEqual({
        calories: 289,
        carbohydrate: 40.9,
        protein: 13.2,
        fat: 9.3,
        phosphorus: 190,
        potassium: 438,
        sodium: 299,
        fiber: 5.2,
      });
    });

    test('calculate ingredients with negative quantity', () => {
      const negativeQuantityProduct = { ...mockListData[0], quantity: -2 }
      const { result } = renderHook(() => useIngredientCalculation([negativeQuantityProduct, mockListData[1]]))
      expect(result.current.ingredientsData).toEqual({
        calories: 289,
        carbohydrate: 40.9,
        protein: 13.2,
        fat: 9.3,
        phosphorus: 190,
        potassium: 438,
        sodium: 299,
        fiber: 5.2,
      });
    });

    test('calculate ingredients with invalid ratio (selectedId not found)', () => {
      const invalidRatioProduct = { ...mockListData[0], select: { ...mockListData[0].select, selectedId: 'invalid-id' } }
      const { result } = renderHook(() => useIngredientCalculation([invalidRatioProduct, mockListData[1]]))
      expect(result.current.ingredientsData).toEqual({
        calories: 289,
        carbohydrate: 40.9,
        protein: 13.2,
        fat: 9.3,
        phosphorus: 190,
        potassium: 438,
        sodium: 299,
        fiber: 5.2,
      });
    });
  })
});
