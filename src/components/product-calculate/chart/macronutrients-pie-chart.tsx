import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"
import { IngredientsData } from "@/types"
import { useMemo } from "react"
import { LabelList, Pie, PieChart } from "recharts"

const pieChartConfig: ChartConfig = {
  carbohydrates: {
    label: "Carbs",
    color: "red",
  },
  protein: {
    label: "Protein",
    color: "blue",
  },
  fat: {
    label: "Fat",
    color: "green",
  },
}

export function MacronutrientsPieChart({ ingredientsData }: { ingredientsData: IngredientsData }) {
  const pieChartData = useMemo(() => {
    const { calories = 0, carbohydrates = 0, protein = 0, fat = 0, dietary_fiber = 0 } = ingredientsData

    if (calories === 0) return []
    if (carbohydrates === 0 && protein === 0 && fat === 0) return []
    const adjustedCarbohydrates = carbohydrates - dietary_fiber
    const carbohydratesPercentage = ((adjustedCarbohydrates * 4 + dietary_fiber * 2) / calories) * 100
    const proteinPercentage = ((protein * 4) / calories) * 100
    const fatPercentage = ((fat * 9) / calories) * 100
    return [
      { macronutrients: "carbohydrates", percentage: carbohydratesPercentage, fill: "#765337" },
      { macronutrients: "protein", percentage: proteinPercentage, fill: "#8f633d" },
      { macronutrients: "fat", percentage: fatPercentage, fill: "#ad7c48" },
    ]
  }, [ingredientsData])

  if (pieChartData.length === 0) return null

  return (
    <div className="w-full flex flex-col">
      <Alert>
        <AlertDescription>以下為目前選取的營養品<b>『三大營養素』之比例</b></AlertDescription>
      </Alert>
      <ChartContainer config={pieChartConfig} className="w-full h-[250px]">
        <PieChart>
          <Pie data={pieChartData} dataKey="percentage" nameKey="macronutrients">
            <LabelList
              dataKey="macronutrients"
              className="fill-background"
              stroke="none"
              fontSize={12}
              formatter={(value: keyof typeof pieChartConfig) => {
                const percentage = pieChartData.find((item) => item.macronutrients === value)?.percentage
                return `${pieChartConfig[value]?.label} ${Math.round(Number(percentage))}%`
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  )
}