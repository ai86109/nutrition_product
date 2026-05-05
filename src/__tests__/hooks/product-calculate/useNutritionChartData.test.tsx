import { renderHook } from "@testing-library/react";
import { useNutritionChartData } from "@/hooks/product-calculate/useNutritionChartData";

const mockUseBioInfo = jest.fn()
jest.mock('@/contexts/BioInfoContext', () => ({
  useBioInfo: () => mockUseBioInfo()
}));

describe('useNutritionChartData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseBioInfo.mockReturnValue({
      calorieRange: { min: '', max: '' },
      proteinRange: { min: '', max: '' }
    })
  })

  describe('validationState', () => {
    describe('isCalorieRangeValid', () => {
      test('valid when both min and max are positive number strings', () => {
        mockUseBioInfo.mockReturnValue({
          calorieRange: { min: '1500', max: '2000' },
        })
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.isCalorieRangeValid).toBe(true)
      })

      test('invalid when calorie range is empty strings', () => {
        mockUseBioInfo.mockReturnValue({
          calorieRange: { min: '', max: '' },
        })
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.isCalorieRangeValid).toBe(false)
      })

      test('invalid when min or max is zero or negative', () => {
        mockUseBioInfo.mockReturnValue({
          calorieRange: { min: '0', max: '2000' },
        })
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.isCalorieRangeValid).toBe(false)

        mockUseBioInfo.mockReturnValue({
          calorieRange: { min: '-1500', max: '2000' },
        })
        const { result: result2 } = renderHook(() => useNutritionChartData())
        expect(result2.current.isCalorieRangeValid).toBe(false)
      })

      test('invalid when calorie range contains non-numeric string', () => {
        mockUseBioInfo.mockReturnValue({
          calorieRange: { min: 'abc', max: '2000' },
        })
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.isCalorieRangeValid).toBe(false)
      })
    })

    describe('isProteinRangeValid', () => {
      test('valid when both min and max are positive number strings', () => {
        mockUseBioInfo.mockReturnValue({
          proteinRange: { min: '50', max: '100' }
        })
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.isProteinRangeValid).toBe(true)
      })

      test('invalid when either min or max is zero, negative, empty, or non-numeric', () => {
        const testCases = [
          { min: '0', max: '100' },
          { min: '-20', max: '100' },
          { min: '50', max: '0' },
          { min: '50', max: '-30' },
          { min: '', max: '100' },
          { min: '50', max: '' },
          { min: 'abc', max: '100' },
          { min: '50', max: 'xyz' },
        ]

        testCases.forEach(({ min, max }) => {
          mockUseBioInfo.mockReturnValue({
            proteinRange: { min, max }
          })
          const { result } = renderHook(() => useNutritionChartData())
          expect(result.current.isProteinRangeValid).toBe(false)
        })
      })

      test('invalid when proteinRange is missing', () => {
        mockUseBioInfo.mockReturnValue({
          proteinRange: undefined
        })
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.isProteinRangeValid).toBe(false)
      })

      test('invalid when proteinRange has empty min and max', () => {
        mockUseBioInfo.mockReturnValue({
          proteinRange: { min: '', max: '' }
        })
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.isProteinRangeValid).toBe(false)
      })

      test('invalid when proteinRange has non-numeric min and max', () => {
        mockUseBioInfo.mockReturnValue({
          proteinRange: { min: 'abc', max: 'xyz' }
        })
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.isProteinRangeValid).toBe(false)
      })
    })
  })

  describe('getCaloriesChartData', () => {
    test('returns empty array if isCalorieRangeValid is false', () => {
      const invalidRanges = [
        { min: '', max: '' },
        { min: '0', max: '2000' },
        { min: '-2000', max: '2500' },
        { min: 'abc', max: '2000' },
      ];

      invalidRanges.forEach(calorieRange => {
        mockUseBioInfo.mockReturnValue({ calorieRange });
        const { result } = renderHook(() => useNutritionChartData());
        expect(result.current.getCaloriesChartData(1500)).toEqual([]);
      });
    })

    test('returns correct chart data when calories are below calorie range min', () => {
      // min=2000, max=2500 → target = min = 2000; 1500/2000 = 75%
      mockUseBioInfo.mockReturnValue({
        calorieRange: { min: '2000', max: '2500' },
      })
      const { result } = renderHook(() => useNutritionChartData())
      expect(result.current.getCaloriesChartData(1500)).toEqual([{
        label: 'calories',
        percentage: 75,
        target: 100,
        text: '75%'
      }])
    })

    test('returns correct chart data when calories exceed calorie range min', () => {
      // min=2000, max=2500 → target = min = 2000; 3000/2000 = 150% → capped at 100
      mockUseBioInfo.mockReturnValue({
        calorieRange: { min: '2000', max: '2500' },
      })
      const { result } = renderHook(() => useNutritionChartData())
      expect(result.current.getCaloriesChartData(3000)).toEqual([{
        label: 'calories',
        percentage: 100,
        target: 100,
        text: '150%'
      }])
    })

    test('returns empty array when calories is zero or negative', () => {
      mockUseBioInfo.mockReturnValue({
        calorieRange: { min: '2000', max: '2500' },
      })
      const { result } = renderHook(() => useNutritionChartData())
      expect(result.current.getCaloriesChartData(0)).toEqual([])
      expect(result.current.getCaloriesChartData(-500)).toEqual([])
    })

    test('returns empty array when calories is a non-numeric value', () => {
      const nonNumericValues = [NaN, Infinity, -Infinity]
      mockUseBioInfo.mockReturnValue({
        calorieRange: { min: '2000', max: '2500' },
      })
      nonNumericValues.forEach(value => {
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.getCaloriesChartData(value)).toEqual([])
      })
    })
  })

  describe('getProteinChartData', () => {
    test('returns empty array if isProteinRangeValid is false', () => {
      const invalidRanges = [
        { min: '0', max: '100' },
        { min: '-20', max: '100' },
        { min: '50', max: '0' },
        { min: '50', max: '-30' },
        { min: '', max: '100' },
        { min: '50', max: '' },
        { min: 'abc', max: '100' },
        { min: '50', max: 'xyz' },
      ]

      invalidRanges.forEach(range => {
        mockUseBioInfo.mockReturnValue({ proteinRange: range });
        const { result } = renderHook(() => useNutritionChartData());
        expect(result.current.getProteinChartData(80)).toEqual([]);
      });
    })

    test('returns correct chart data when protein is below minimum requirement', () => {
      mockUseBioInfo.mockReturnValue({
        proteinRange: { min: '50', max: '100' }
      })
      const { result } = renderHook(() => useNutritionChartData())
      expect(result.current.getProteinChartData(40)).toEqual([{
        label: 'protein',
        percentage: 80,
        target: 100,
        text: '80%'
      }])
    })

    test('returns correct chart data when protein meets minimum requirement', () => {
      mockUseBioInfo.mockReturnValue({
        proteinRange: { min: '50', max: '100' }
      })
      const { result } = renderHook(() => useNutritionChartData())
      expect(result.current.getProteinChartData(50)).toEqual([{
        label: 'protein',
        percentage: 100,
        target: 100,
        text: '100%'
      }])
    })

    test('returns correct chart data when protein exceeds maximum requirement', () => {
      mockUseBioInfo.mockReturnValue({
        proteinRange: { min: '50', max: '100' }
      })
      const { result } = renderHook(() => useNutritionChartData())
      expect(result.current.getProteinChartData(150)).toEqual([{
        label: 'protein',
        percentage: 100,
        target: 100,
        text: '300%'
      }])
    })

    test('returns empty array when protein is zero or negative', () => {
      mockUseBioInfo.mockReturnValue({
        proteinRange: { min: '50', max: '100' }
      })
      const { result } = renderHook(() => useNutritionChartData())
      expect(result.current.getProteinChartData(0)).toEqual([])
      expect(result.current.getProteinChartData(-50)).toEqual([])
    })

    test('returns empty array when protein is a non-numeric value', () => {
      const nonNumericValues = [NaN, Infinity, -Infinity]
      mockUseBioInfo.mockReturnValue({
        proteinRange: { min: '50', max: '100' }
      })
      nonNumericValues.forEach(value => {
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.getProteinChartData(value)).toEqual([])
      })
    })
  })
});
