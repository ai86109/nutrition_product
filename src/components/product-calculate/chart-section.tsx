"use client"

import { CardContent } from "@/components/ui/card"
import { IngredientsData } from "@/types"
import { MacronutrientsPieChart } from "./chart/macronutrients-pie-chart"
import { NutritionTable } from "./chart/nutrition-table"

export default function ChartSection({ ingredientsData }: { ingredientsData: IngredientsData }): React.ReactElement {
  return(
    <CardContent className="flex flex-col lg:flex-row">
      <NutritionTable ingredientsData={ingredientsData} />

      <div className="flex flex-col items-start justify-center w-full mt-4 lg:w-[250px] lg:mt-0 lg:ml-4">
        <MacronutrientsPieChart ingredientsData={ingredientsData} />
      </div>
    </CardContent>
  )
}