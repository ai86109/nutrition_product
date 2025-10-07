import { useMealCalculation } from "@/hooks/useMealCalculation"
import { act, renderHook } from "@testing-library/react"

describe('useMealCalculation', () => {
  describe('initial state', () => {
    test('mealsPerDay', () => {
      const { result } = renderHook(() => useMealCalculation())
      expect(result.current.mealsPerDay).toBe(3)
    })

    test('isCalculateServings', () => {
      const { result } = renderHook(() => useMealCalculation())
      expect(result.current.isCalculateServings).toBe(false)
    })
  })

  describe('handleMealsInputChange', () => {
    test('set empty string', () => {
      const { result } = renderHook(() => useMealCalculation())
      expect(result.current.mealsPerDay).toBe(3)

      act(() => {
        result.current.handleMealsInputChange({
          target: { value: '' }
        } as React.ChangeEvent<HTMLInputElement>)
      })
      expect(result.current.mealsPerDay).toBe('')
    })

    test('set non-numeric string', () => {
      const { result } = renderHook(() => useMealCalculation())
      expect(result.current.mealsPerDay).toBe(3)

      act(() => {
        result.current.handleMealsInputChange({
          target: { value: 'abc' }
        } as React.ChangeEvent<HTMLInputElement>)
      })
      expect(result.current.mealsPerDay).toBe(0)
    })

    test('set zero', () => {
      const { result } = renderHook(() => useMealCalculation())
      expect(result.current.mealsPerDay).toBe(3)

      act(() => {
        result.current.handleMealsInputChange({
          target: { value: '0' }
        } as React.ChangeEvent<HTMLInputElement>)
      })
      expect(result.current.mealsPerDay).toBe(0)
    })

    test('set negative number', () => {
      const { result } = renderHook(() => useMealCalculation())
      expect(result.current.mealsPerDay).toBe(3)

      act(() => {
        result.current.handleMealsInputChange({
          target: { value: '-5' }
        } as React.ChangeEvent<HTMLInputElement>)
      })
      expect(result.current.mealsPerDay).toBe(0)
    })

    test('set positive number', () => {
      const { result } = renderHook(() => useMealCalculation())
      expect(result.current.mealsPerDay).toBe(3)

      act(() => {
        result.current.handleMealsInputChange({
          target: { value: '5' }
        } as React.ChangeEvent<HTMLInputElement>)
      })
      expect(result.current.mealsPerDay).toBe(5)
    })
  })

  describe('setIsCalculateServings', () => {
    test('toggle isCalculateServings', () => {
      const { result } = renderHook(() => useMealCalculation())
      expect(result.current.isCalculateServings).toBe(false)

      act(() => {
        result.current.setIsCalculateServings(true)
      })
      expect(result.current.isCalculateServings).toBe(true)

      act(() => {
        result.current.setIsCalculateServings(false)
      })
      expect(result.current.isCalculateServings).toBe(false)
    })
  })
})