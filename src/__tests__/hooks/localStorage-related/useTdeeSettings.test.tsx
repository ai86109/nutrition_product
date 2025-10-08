import { act, renderHook } from "@testing-library/react";
import { useTdeeSettings, DEFAULT_TDEE_SETTINGS } from "@/hooks/localStorage-related/useTdeeSettings";

const STORAGE_KEY = "nutriapp.bio.tdee"

describe('useTdeeSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    test('default settings are used when localStorage is empty', () => {
      const { result } = renderHook(() => useTdeeSettings())

      expect(result.current.tdeeList).toEqual(DEFAULT_TDEE_SETTINGS)
    })

    test('loads settings from localStorage when available', () => {
      const storedSettings = [
        { name: 'Custom1', activityFactor: 1.3, stressFactor: 1.4 },
        { name: 'Custom2', activityFactor: 1.5, stressFactor: 1.6 },
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSettings))

      const { result } = renderHook(() => useTdeeSettings())

      expect(result.current.tdeeList).toEqual(storedSettings)
    })
  })

  describe('addList', () => {
    test('adds a new TDEE setting to the list', () => {
      const { result } = renderHook(() => useTdeeSettings())

      const newSetting = { name: 'Custom3', activityFactor: 1.7, stressFactor: 1.8 }

      act(() => {
        result.current.addList(newSetting)
      })

      expect(result.current.tdeeList).toHaveLength(2) // Default + new
      expect(result.current.tdeeList[1]).toEqual(newSetting)

      // Verify localStorage is updated
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      expect(stored).toHaveLength(2)
      expect(stored[1]).toEqual(newSetting)
    })
  })

  describe('deleteList', () => {
    test('deletes a TDEE setting from the list by index', () => {
      const initialSettings = [
        { name: 'Custom1', activityFactor: 1.3, stressFactor: 1.4 },
        { name: 'Custom2', activityFactor: 1.5, stressFactor: 1.6 },
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSettings))

      const { result } = renderHook(() => useTdeeSettings())

      expect(result.current.tdeeList).toHaveLength(2)

      act(() => {
        result.current.deleteList(0) // Delete first item
      })

      expect(result.current.tdeeList).toHaveLength(1)
      expect(result.current.tdeeList[0]).toEqual(initialSettings[1])

      // Verify localStorage is updated
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      expect(stored).toHaveLength(1)
      expect(stored[0]).toEqual(initialSettings[1])
    })
  })
})
