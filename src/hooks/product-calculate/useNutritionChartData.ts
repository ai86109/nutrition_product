import { useCallback, useMemo } from "react"
import { useBioInfo } from "@/contexts/BioInfoContext"
import { useBioInfoCalculations } from "../useBioInfoCalculations"

export function useNutritionChartData() {
  const { rounding } = useBioInfoCalculations()
  const { tdee, proteinRange } = useBioInfo()

  const safeProteinRange = proteinRange || { min: '0', max: '0' }
  
  const getPercentage = useCallback((value: number): number => {
    return rounding(value * 100, 1)
  }, [rounding])

  const validationState = useMemo(() => ({
    isTdeeValid: !isNaN(Number(tdee)) && Number(tdee) > 0,
    isProteinRangeValid: [safeProteinRange.min, safeProteinRange.max].every(val => Number(val) > 0)
  }), [tdee, safeProteinRange])

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
    if (!validationState.isTdeeValid) return []
    return createChartData(calories, Number(tdee), "calories")
  }, [createChartData, tdee, validationState.isTdeeValid])

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