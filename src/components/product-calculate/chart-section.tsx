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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ChartSectionProps {
  ingredientsData: IngredientsData
}

function ProteinRangeBlock({ protein }: { protein: number }) {
  const { proteinRange } = useBioInfo()
  const { min, max } = proteinRange
  const minValue = Number(Math.min(Number(min), Number(max)))
  const maxValue = Number(Math.max(Number(min), Number(max)))

  let proteinRangeText = '符合'
  let isIncludedInRange = true
  const isProteinInRange: boolean = protein >= minValue && protein <= maxValue
  if (!isProteinInRange) {
    if (protein < minValue) proteinRangeText = `低於`
    else if (protein > maxValue) proteinRangeText = `高於`

    isIncludedInRange = false
  }
  return (
    <p className={`text-xs font-bold ${isIncludedInRange ? 'text-green-700' : 'text-red-700'}`}>{proteinRangeText}蛋白質範圍</p>
  )
}

export default function ChartSection({ ingredientsData }: ChartSectionProps): React.ReactElement {
  const { tdee, proteinRange } = useBioInfo()
  const { calculatePBW, calculateIBW, calculateABW, rounding } = useNutritionCalculations()
  const isTdeeInvalid = isNaN(Number(tdee)) || Number(tdee) <= 0;
  const PBW = calculatePBW()
  const IBW = calculateIBW()
  const ABW = calculateABW()
  const { min, max } = proteinRange
  const isProteinRangeValid = [min, max].every(val => Number(val) > 0)

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
    if (!isProteinRangeValid) return []
    
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
      <Table className="min-w-[250px] max-w-[400px]">
        <TableBody>
          <TableRow>
            <TableCell className="font-bold">
              <span>熱量</span>
              <Popover>
                <PopoverTrigger asChild>
                  <span className="material-icons cursor-pointer" style={{ fontSize: '14px', height: '14px' }}>info</span>
                </PopoverTrigger>
                <PopoverContent className="w-auto">
                  <p className="text-sm">百分比 = 營養品熱量 / 輸入的熱量</p>
                </PopoverContent>
              </Popover>
            </TableCell>
            <TableCell>{rounding(ingredientsData.calories)} Kcal</TableCell>
            {caloriesChartData().length > 0 && (
              <TableCell>
                <ChartContainer config={barChartConfig} className="w-[120px] h-[40px]">
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
                    <Bar dataKey="percentage" fill="#ad7c48" radius={4} className="font-bold">
                      <LabelList
                        dataKey="text"
                        position={caloriesChartData()[0]?.percentage < 45 ? "right" : "insideRight"}
                        offset={8}
                        fill={caloriesChartData()[0]?.percentage < 45 ? "black" : "white"}
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </TableCell>
            )}
          </TableRow>
          {ingredientsData.calories > 0 && PBW > 0 && (
            <TableRow>
              <TableCell></TableCell>
              <TableCell className="text-xs text-muted-foreground px-0">
                {PBW > 0 && <p>* {rounding(ingredientsData.calories / PBW)} kcal/kg PBW</p>}
                {IBW > 0 && <p>* {rounding(ingredientsData.calories / IBW)} kcal/kg IBW</p>}
                {ABW > 0 && <p>* {rounding(ingredientsData.calories / ABW)} kcal/kg ABW</p>}
              </TableCell>
            </TableRow>
          )}

          <TableRow>
            <TableCell className="font-bold">
              <span>蛋白質</span>
              <Popover>
                <PopoverTrigger asChild>
                  <span className="material-icons cursor-pointer" style={{ fontSize: '14px', height: '14px' }}>info</span>
                </PopoverTrigger>
                <PopoverContent className="w-auto">
                  <p className="text-sm">百分比 = 營養品蛋白質 / 輸入的最小蛋白質</p>
                </PopoverContent>
              </Popover>
            </TableCell>
            <TableCell>
              <p>{rounding(ingredientsData.protein)} g</p>
              {isProteinRangeValid && ingredientsData.protein > 0 && (
                <ProteinRangeBlock protein={ingredientsData.protein} />
              )}
            </TableCell>
            {proteinChartData().length > 0 && (
              <TableCell>
                <ChartContainer config={barChartConfig} className="w-[120px] h-[40px]">
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
                    <Bar dataKey="percentage" fill="#ad7c48" radius={4} className="font-bold">
                      <LabelList
                        dataKey="text"
                        position={proteinChartData()[0]?.percentage < 45 ? "right" : "insideRight"}
                        offset={8}
                        fill={proteinChartData()[0]?.percentage < 45 ? "black" : "white"}
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </TableCell>
            )}
          </TableRow>

          <TableRow>
            <TableCell className="font-bold max-w-[45px] overflow-hidden text-ellipsis sm:max-w-auto">碳水化合物</TableCell>
            <TableCell>{rounding(ingredientsData.carbohydrate)} g</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-bold">脂肪</TableCell>
            <TableCell>{rounding(ingredientsData.fat)} g</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-bold">磷</TableCell>
            <TableCell>{rounding(micronutrients().phosphorus)} mg</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-bold">鉀</TableCell>
            <TableCell>{rounding(micronutrients().potassium)} mg</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-bold">鈉</TableCell>
            <TableCell>{rounding(micronutrients().sodium)} mg</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-bold">纖維</TableCell>
            <TableCell>{rounding(micronutrients().fiber)} g</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="flex flex-col items-start justify-center w-full mt-4 lg:w-[250px] lg:mt-0 lg:ml-4">
        {pieChartData().length > 0 &&
          <div className="w-full flex flex-col">
            <Alert>
              <AlertDescription>以下為目前選取的營養品<b>『三大營養素』之比例</b></AlertDescription>
            </Alert>
            <ChartContainer config={pieChartConfig} className="w-full h-[250px]">
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