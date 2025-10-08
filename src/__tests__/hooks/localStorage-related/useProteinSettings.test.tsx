import { act, renderHook } from "@testing-library/react";
import { useProteinSettings, DEFAULT_PROTEIN_SETTINGS } from "@/hooks/localStorage-related/useProteinSettings";
import { flushSync } from "react-dom";

const STORAGE_KEY = "nutriapp.bio.protein"

describe('useProteinSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    test('default settings are used when localStorage is empty', () => {
      const { result } = renderHook(() => useProteinSettings())

      expect(result.current.proteinList).toEqual(DEFAULT_PROTEIN_SETTINGS)
    })
  })

  describe('updateChecked', () => {
    test('updates the checked status of a protein setting', () => {
      const { result } = renderHook(() => useProteinSettings())

      // Initially, all are checked
      expect(result.current.proteinList[0].checked).toBe(true)

      // Update the first item's checked status to false
      act(() => {
        result.current.updateChecked(false, 0)
      })

      expect(result.current.proteinList[0].checked).toBe(false)

      // Verify localStorage is updated
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      expect(stored[0].checked).toBe(false)
    })
  })

  describe('updateValue', () => {
    test('updates the value of a protein setting', () => {
      const { result } = renderHook(() => useProteinSettings())

      // Initially, first item's value is 0.6
      expect(result.current.proteinList[0].value).toBe(0.6)

      // Update the first item's value to 0.75
      act(() => {
        result.current.updateValue('input-0', '0.75')
      })

      expect(result.current.proteinList[0].value).toBe(0.75)

      // Verify localStorage is updated
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      expect(stored[0].value).toBe(0.75)
    })
  })

  describe('resetToDefault', () => {
    test('resets the protein settings to default', () => {
      const { result } = renderHook(() => useProteinSettings())

      // Change the first item's value and checked status
      act(() => {
        flushSync(() => result.current.updateValue('input-0', '0.75'))
        flushSync(() => result.current.updateChecked(false, 0))
      })

      expect(result.current.proteinList[0]).toEqual({ id: 1, value: 0.75, checked: false })

      // reset to default
      act(() => {
        result.current.resetToDefault()
      })

      expect(result.current.proteinList).toEqual(DEFAULT_PROTEIN_SETTINGS)

      // Verify localStorage is updated
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      expect(stored).toEqual(DEFAULT_PROTEIN_SETTINGS)
    })
  })
})
