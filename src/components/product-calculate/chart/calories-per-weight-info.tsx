import { useNutritionCalculations } from "@/hooks/useNutritionCalculations"

export function CaloriesPerWeightInfo({ value }: { value: number }): React.ReactElement {
  const { calculatePBW, calculateIBW, calculateABW, rounding } = useNutritionCalculations()
  const PBW = calculatePBW()
  const IBW = calculateIBW()
  const ABW = calculateABW()

  return (
    <div className="text-xs text-muted-foreground px-0">
      {PBW > 0 && <p>* {rounding(value / PBW)} kcal/kg PBW</p>}
      {IBW > 0 && <p>* {rounding(value / IBW)} kcal/kg IBW</p>}
      {ABW > 0 && <p>* {rounding(value / ABW)} kcal/kg ABW</p>}
    </div>
  )
}