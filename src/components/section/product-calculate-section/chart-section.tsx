"use client"

import { useBioInfo } from "@/contexts/BioInfoContext"
import { Bar, BarChart, XAxis, YAxis, LabelList, Pie, PieChart } from "recharts"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"
import { CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations"

export default function ChartSection({ ingredientsData }) {
  const { submittedValues, tdeeFactors } = useBioInfo()
  const { calculateTDEE, calculateProtein } = useNutritionCalculations()

  // bar chart
  const barChartConfig = {
    current: {
      label: "Current",
      color: "hsl(var(#1e1e1e))",
    },
  } satisfies ChartConfig

  
  const chartData = () => {
    const { calories, protein } = ingredientsData
    const { height, weight, age } = submittedValues
    const { activityFactor, stressFactor } = tdeeFactors

    if (calories === 0 && protein === 0) return []
    if (height === 0 || weight === 0 || age === 0) return []
    if (activityFactor === 0 || stressFactor === 0) return []
    const tdee = calculateTDEE()
    const minProtein = calculateProtein().minValue

    const currentCalories = ((calories / tdee) * 100).toFixed(2)
    const currentProtein = ((protein / minProtein) * 100).toFixed(2)
  
    return [
      { macronutrients: "calories", current: currentCalories, label: `${currentCalories}%` },
      { macronutrients: "protein", current: currentProtein, label: `${currentProtein}%` },
    ]
  }

  const pieChartConfig = {
    carbohydrate: {
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
  } satisfies ChartConfig

  const pieChartData = () => {
    const { carbohydrate, protein, fat } = ingredientsData

    if (carbohydrate === 0 && protein === 0 && fat === 0) return []
    const totalCalories = carbohydrate * 4 + protein * 4 + fat * 9
    const carbohydratePercentage = ((carbohydrate * 4) / totalCalories) * 100
    const proteinPercentage = ((protein * 4) / totalCalories) * 100
    const fatPercentage = ((fat * 9) / totalCalories) * 100
    return [
      { macronutrients: "carbohydrate", percentage: carbohydratePercentage, fill: "red" },
      { macronutrients: "protein", percentage: proteinPercentage, fill: "blue" },
      { macronutrients: "fat", percentage: fatPercentage, fill: "green" },
    ]
  }

  const micronutrients = () => {
    const { phosphorus, kalium, sodium, fiber } = ingredientsData
    return { phosphorus, kalium, sodium, fiber }
  }

  return(
    <CardContent className="flex">
      {/* 該病人一日所需熱量/蛋白質的地方，這樣選擇營養品之後，可以讓我知道
      熱量（大卡、大卡/公斤體重）
      蛋白質（克、克/公斤體重）
      -三大營養素百分比
      -礦物質毫克（磷、鉀、鈉）
      -纖維 */}

      <div className="min-w-[250px] max-w-[400px]">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>熱量</TableCell>
              <TableCell>{ingredientsData.calories} Kcal / {calculateTDEE()} Kcal</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>蛋白質</TableCell>
              <TableCell>{ingredientsData.protein}g ({calculateProtein().minValue}g - {calculateProtein().maxValue}g)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>碳水化合物</TableCell>
              <TableCell>{ingredientsData.carbohydrate}g</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>脂肪</TableCell>
              <TableCell>{ingredientsData.fat}g</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>磷</TableCell>
              <TableCell>{micronutrients().phosphorus}mg</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>鉀</TableCell>
              <TableCell>{micronutrients().kalium}mg</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>鈉</TableCell>
              <TableCell>{micronutrients().sodium}mg</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>纖維</TableCell>
              <TableCell>{micronutrients().fiber}g</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-center w-full">
        {chartData().length > 0 && <ChartContainer config={barChartConfig} className="h-[120px]">
          <BarChart accessibilityLayer data={chartData()} layout="vertical">
            <XAxis type="number" dataKey="current" />
            <YAxis
              dataKey="macronutrients"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <Bar dataKey="current" fill="red" radius={4}>
              <LabelList
                dataKey="label"
                position="insideRight"
                offset={8}
                fill="var(--color-mobile)"
                fontSize={12}
              />
            </Bar>
            
          </BarChart>
        </ChartContainer>}

        {pieChartData().length > 0 && <ChartContainer config={pieChartConfig} className="h-[250px]">
          <PieChart>
            <Pie data={pieChartData()} dataKey="percentage" nameKey="macronutrients">
              <LabelList
                dataKey="macronutrients"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value: keyof typeof pieChartConfig) => {
                  const percentage = pieChartData().find((item) => item.macronutrients === value)?.percentage
                  return `${pieChartConfig[value]?.label} ${Math.round(Number(percentage))}%`
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>}
      </div>
    </CardContent>
  )
}