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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations"
import type { IngredientsData } from "@/types/nutrition"

interface ChartSectionProps {
  ingredientsData: IngredientsData
}

export default function ChartSection({ ingredientsData }: ChartSectionProps): React.ReactElement {
  const { submittedValues, tdeeFactors, tdee, proteinRange } = useBioInfo()
  const { calculateTDEE, calculateProtein, calculateIBW, rounding } = useNutritionCalculations()
  const isTdeeInvalid = isNaN(Number(tdee)) || Number(tdee) <= 0;

  // bar chart
  const barChartConfig: ChartConfig = {
    percentage: {
      label: "percentage",
      color: "hsl(var(#1e1e1e))",
    },
  }
  
  const caloriesChartData = () => {
    const { calories } = ingredientsData
    if (calories <= 0) return []
    if (isTdeeInvalid) return []    
    
    const caloriePercentage = rounding((calories / Number(tdee)) * 100, 1)
    const displayBarPercentage = caloriePercentage > 100 ? 100 : caloriePercentage
    return [
      { label: "calories", percentage: displayBarPercentage, target: 100, text: `${caloriePercentage}%` },
    ]
  }

  const proteinChartData = () => {
    const { protein } = ingredientsData
    if (protein <= 0) return []
    const { min, max } = proteinRange
    if (![min, max].every(val => Number(val) > 0)) return []
    
    const minProteinRequirement = Math.min(Number(min), Number(max))
    const proteinPercentage = rounding((protein / minProteinRequirement) * 100, 1)
    const displayBarPercentage = proteinPercentage > 100 ? 100 : proteinPercentage
    return [
      { label: "protein", percentage: displayBarPercentage, target: 100, text: `${proteinPercentage}%` },
    ]
  }

  const pieChartConfig: ChartConfig = {
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
  }

  const pieChartData = () => {
    const { carbohydrate, protein, fat } = ingredientsData

    if (carbohydrate === 0 && protein === 0 && fat === 0) return []
    const totalCalories = carbohydrate * 4 + protein * 4 + fat * 9
    const carbohydratePercentage = ((carbohydrate * 4) / totalCalories) * 100
    const proteinPercentage = ((protein * 4) / totalCalories) * 100
    const fatPercentage = ((fat * 9) / totalCalories) * 100
    return [
      { macronutrients: "carbohydrate", percentage: carbohydratePercentage, fill: "#765337" },
      { macronutrients: "protein", percentage: proteinPercentage, fill: "#8f633d" },
      { macronutrients: "fat", percentage: fatPercentage, fill: "#ad7c48" },
    ]
  }

  const micronutrients = () => {
    const { phosphorus, potassium, sodium, fiber } = ingredientsData
    return { phosphorus, potassium, sodium, fiber }
  }

  return(
    <CardContent className="flex flex-col lg:flex-row">
      <div className="min-w-[250px] max-w-full lg:max-w-[400px]">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>熱量</TableCell>
              <TableCell>{rounding(ingredientsData.calories)} Kcal</TableCell>
              <TableCell>
                <ChartContainer config={barChartConfig} className="h-[80px]">
                  <BarChart accessibilityLayer data={caloriesChartData()} layout="vertical">
                    <XAxis type="number" dataKey="target" hide />
                    <YAxis
                      dataKey="label"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                      hide
                    />
                    <Bar dataKey="percentage" fill="#ad7c48" radius={4}>
                      <LabelList
                        dataKey="text"
                        position={caloriesChartData()[0]?.percentage < 37 ? "right" : "insideRight"}
                        offset={8}
                        fill={caloriesChartData()[0]?.percentage < 37 ? "black" : "white"}
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </TableCell>
            </TableRow>
            {/* {ingredientsData.calories > 0 && (
              <>
                {submittedValues.weight > 0 && (
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>{rounding(ingredientsData.calories / submittedValues.weight)} kcal/kg PBW</TableCell>
                  </TableRow>
                )}
                {calculateIBW() > 0 && (
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>{rounding(ingredientsData.calories / calculateIBW())} kcal/kg IBW</TableCell>
                  </TableRow>
                )}
              </>)} */}
            <TableRow>
              <TableCell>蛋白質</TableCell>
              <TableCell>{rounding(ingredientsData.protein)} g</TableCell>
              <TableCell>
                <ChartContainer config={barChartConfig} className="h-[80px]">
                  <BarChart accessibilityLayer data={proteinChartData()} layout="vertical">
                    <XAxis type="number" dataKey="target" hide />
                    <YAxis
                      dataKey="label"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                      hide
                    />
                    <Bar dataKey="percentage" fill="#ad7c48" radius={4}>
                      <LabelList
                        dataKey="text"
                        position={proteinChartData()[0]?.percentage < 37 ? "right" : "insideRight"}
                        offset={8}
                        fill={proteinChartData()[0]?.percentage < 37 ? "black" : "white"}
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>碳水化合物</TableCell>
              <TableCell>{rounding(ingredientsData.carbohydrate)} g</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>脂肪</TableCell>
              <TableCell>{rounding(ingredientsData.fat)} g</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>磷</TableCell>
              <TableCell>{rounding(micronutrients().phosphorus)} mg</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>鉀</TableCell>
              <TableCell>{rounding(micronutrients().potassium)} mg</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>鈉</TableCell>
              <TableCell>{rounding(micronutrients().sodium)} mg</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>纖維</TableCell>
              <TableCell>{rounding(micronutrients().fiber)} g</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-start justify-center w-full mt-4 lg:w-[250px] lg:mt-0 lg:ml-4">
        {pieChartData().length > 0 &&
          <div className="w-full flex flex-col">
            <Alert>
              <AlertDescription>以下為目前選取的營養品<b>『三大營養素』之比例</b></AlertDescription>
            </Alert>
            <ChartContainer config={pieChartConfig} className="h-[250px]">
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
            </ChartContainer>
          </div>
        }
      </div>
    </CardContent>
  )
}