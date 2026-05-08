"use client"

import { CardContent } from "@/components/ui/card"
import { IngredientsData, ProductData } from "@/types"
import { MacronutrientsPieChart } from "./chart/macronutrients-pie-chart"
import { NutritionTable } from "./chart/nutrition-table"

export default function ChartSection({
  ingredientsData,
  listData,
}: {
  ingredientsData: IngredientsData
  listData: ProductData[]
}): React.ReactElement {
  const checkedItems = listData.filter((item) => item.checked)
  const singleProduct = checkedItems.length === 1 ? checkedItems[0] : null

  return(
    <CardContent className="flex flex-col lg:flex-row">
      <NutritionTable
        ingredientsData={ingredientsData}
        productId={singleProduct?.id}
        productName={singleProduct?.name}
      />

      <div className="flex flex-col items-start w-full mt-4 lg:w-[250px] lg:mt-0 lg:ml-4">
        <MacronutrientsPieChart ingredientsData={ingredientsData} />
      </div>
    </CardContent>
  )
}
