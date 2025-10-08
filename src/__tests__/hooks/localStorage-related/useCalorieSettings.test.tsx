import { DEFAULT_CALORIE_SETTINGS, useCalorieSettings } from "@/hooks/localStorage-related/useCalorieSettings"
import { renderHook } from "@testing-library/react"
import { act } from "react";

const STORAGE_KEY = "nutriapp.bio.calorie";

describe('useCalorieSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    test('default settings are used when localStorage is empty', () => {
      const { result } = renderHook(() => useCalorieSettings())

      expect(result.current.calorieFactorLists).toEqual(DEFAULT_CALORIE_SETTINGS)
    })

    test('loads settings from localStorage when available', () => {
      const storedSettings = [
        { id: 1, value: 20, checked: false },
        { id: 2, value: 25, checked: true },
        { id: 3, value: 30, checked: false },
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSettings))

      const { result } = renderHook(() => useCalorieSettings())

      expect(result.current.calorieFactorLists).toEqual(storedSettings)
    })
  })

  describe('updateChecked', () => {
    test('updates the checked status of a calorie factor', () => {
      const { result } = renderHook(() => useCalorieSettings())

      // Initially, all are checked
      expect(result.current.calorieFactorLists[0].checked).toBe(true)

      // Update the first item's checked status to false
      act(() => {
        result.current.updateChecked(false, 0)
      })

      expect(result.current.calorieFactorLists[0].checked).toBe(false)

      // Verify localStorage is updated
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      expect(stored[0].checked).toBe(false)
    })
  })

  describe('updateValue', () => {
    test('updates the value of a calorie factor', () => {
      const { result } = renderHook(() => useCalorieSettings())

      // Initially, first item's value is 25
      expect(result.current.calorieFactorLists[0].value).toBe(25)

      // Update the first item's value to 28
      act(() => {
        result.current.updateValue('input-0', '28')
      })

      expect(result.current.calorieFactorLists[0].value).toBe(28)

      // Verify localStorage is updated
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      expect(stored[0].value).toBe(28)
    })
  })
})
