import { useCallback, useMemo } from "react"
import { useBioInfo } from "@/contexts/BioInfoContext"
import { useBioInfoCalculations } from "../useBioInfoCalculations"

const DEFAULT_RANGE = { min: '0', max: '0' } as const

export function useNutritionChartData() {
  const { rounding } = useBioInfoCalculations()
  const { calorieRange, proteinRange } = useBioInfo()

  const safeCalorieRange = calorieRange || DEFAULT_RANGE
  const safeProteinRange = proteinRange || DEFAULT_RANGE

  const getPercentage = useCallback((value: number): number => {
    return rounding(value * 100, 1)
  }, [rounding])

  const validationState = useMemo(() => ({
    isCalorieRangeValid: [safeCalorieRange.min, safeCalorieRange.max].every(val => Number(val) > 0),
    isProteinRangeValid: [safeProteinRange.min, safeProteinRange.max].every(val => Number(val) > 0)
  }), [safeCalorieRange, safeProteinRange])

  const createChartData = useCallback((
    value: number,
    target: number,
    type: "calories" | "protein"
  ) => {
    if (value <= 0 || isNaN(value) || !isFinite(Math.abs(value))) return []

    const percentage = getPercentage(value / target)
    const displayBarPercentage = Math.min(percentage, 100)

    return [{
      label: type,
      percentage: displayBarPercentage,
      target: 100,
      text: `${percentage}%`
    }]
  }, [getPercentage])

  const getCaloriesChartData = useCallback((calories: number) => {
    if (!validationState.isCalorieRangeValid) return []
    // 以最小值作為計算基準（與 meal-servings 一致）
    const minCalorieRequirement = Math.min(Number(safeCalorieRange.min), Number(safeCalorieRange.max))
    return createChartData(calories, minCalorieRequirement, "calories")
  }, [createChartData, safeCalorieRange, validationState.isCalorieRangeValid])

  const getProteinChartData = useCallback((protein: number) => {
    if (!validationState.isProteinRangeValid) return []

    const minProteinRequirement = Math.min(Number(safeProteinRange.min), Number(safeProteinRange.max))
    return createChartData(protein, minProteinRequirement, "protein")
  }, [createChartData, safeProteinRange.max, safeProteinRange.min, validationState.isProteinRangeValid])

  return {
    ...validationState,
    getCaloriesChartData,
    getProteinChartData
  }
}