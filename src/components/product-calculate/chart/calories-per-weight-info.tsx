import { useNutritionCalculations } from "@/hooks/useNutritionCalculations"

export function CaloriesPerWeightInfo({ value }: { value: number }): React.ReactElement {
  const { pbw, ibw, abw, rounding } = useNutritionCalculations()

  return (
    <div className="text-xs text-muted-foreground px-0">
      {pbw > 0 && <p>* {rounding(value / pbw)} kcal/kg PBW</p>}
      {ibw > 0 && <p>* {rounding(value / ibw)} kcal/kg IBW</p>}
      {abw > 0 && <p>* {rounding(value / abw)} kcal/kg ABW</p>}
    </div>
  )
}