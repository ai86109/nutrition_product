import { renderHook } from "@testing-library/react";
import { useNutritionChartData } from "@/hooks/useNutritionChartData";

const mockUseBioInfo = jest.fn()
jest.mock('@/contexts/BioInfoContext', () => ({
  useBioInfo: () => mockUseBioInfo()
}));

describe('useNutritionChartData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseBioInfo.mockReturnValue({
      tdee: '',
      proteinRange: { min: '', max: '' }
    })
  })

  describe('validationState', () => {
    describe('isTdeeValid', () => {
      test('valid when tdee is a positive number string', () => {
        mockUseBioInfo.mockReturnValue({
          tdee: '2000',
        })
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.isTdeeValid).toBe(true)
      })

      test('tdee is empty string', () => {
        mockUseBioInfo.mockReturnValue({
          tdee: '',
        })
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.isTdeeValid).toBe(false)
      })

      test('invalid when tdee is zero or negative number string', () => {
        mockUseBioInfo.mockReturnValue({
          tdee: '0',
        })
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.isTdeeValid).toBe(false)

        mockUseBioInfo.mockReturnValue({
          tdee: '-1500',
        })
        const { result: result2 } = renderHook(() => useNutritionChartData())
        expect(result2.current.isTdeeValid).toBe(false)
      })

      test('invalid when tdee is non-numeric string', () => {
        mockUseBioInfo.mockReturnValue({
          tdee: 'abc',
        })
        const { result } = renderHook(() => useNutritionChartData())
        expect(result.current.isTdeeValid).toBe(false)
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
    test('returns empty array if isTdeeValid is false', () => {
      const invalidTdeeValues = ['', '0', '-2000', 'abc'];
      
      invalidTdeeValues.forEach(tdee => {
        mockUseBioInfo.mockReturnValue({ tdee });
        const { result } = renderHook(() => useNutritionChartData());
        expect(result.current.getCaloriesChartData(1500)).toEqual([]);
      });
    })

    test('returns correct chart data when calories are below TDEE', () => {
      mockUseBioInfo.mockReturnValue({
        tdee: '2000',
      })
      const { result } = renderHook(() => useNutritionChartData())
      expect(result.current.getCaloriesChartData(1500)).toEqual([{
        label: 'calories',
        percentage: 75,
        target: 100,
        text: '75%'
      }])
    })

    test('returns correct chart data when calories exceed TDEE', () => {
      mockUseBioInfo.mockReturnValue({
        tdee: '2000',
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
        tdee: '2000',
      })
      const { result } = renderHook(() => useNutritionChartData())
      expect(result.current.getCaloriesChartData(0)).toEqual([])
      expect(result.current.getCaloriesChartData(-500)).toEqual([])
    })

    test('returns empty array when calories is a non-numeric value', () => {
      const nonNumericValues = [NaN, Infinity, -Infinity]
      mockUseBioInfo.mockReturnValue({
        tdee: '2000',
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
