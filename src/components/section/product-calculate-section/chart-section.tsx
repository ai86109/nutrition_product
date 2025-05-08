"use client"

import { useBioInfo } from "@/contexts/BioInfoContext"
import { Bar, BarChart, XAxis, YAxis, LabelList, Pie, PieChart } from "recharts"
import { ChartContainer, ChartConfig } from "@/components/ui/chart"

export default function ChartSection({ ingredientsData }) {
  const { submittedValues, tdeeFactors, proteinFactors } = useBioInfo()

  const calculateIdealWeight = () => {
    const { height } = submittedValues
    if (height === 0) return 0
    return Math.abs(Number((((height / 100) ** 2) * 22).toFixed(2))) || 0
  }

  const calculateTDEE = () => {
    const { height, weight, age, gender } = submittedValues
    const { activityFactor, stressFactor } = tdeeFactors
    if (height === 0 || weight === 0 || age === 0) return 0

    const idealWeight = calculateIdealWeight()
    const manBEE = 13.7 * idealWeight + 5 * height - 6.8 * age + 66
    const womanBEE = 9.6 * idealWeight + 1.8 * height - 4.7 * age + 655
    const BEE = gender === "man" ? manBEE : womanBEE
    const TDEE = BEE * activityFactor * stressFactor
    return TDEE.toFixed(2)
  }

  const calculateProtein = () => {
    const idealWeight = calculateIdealWeight()
    const { min, max } = proteinFactors
    const minValue = Math.min(min * idealWeight, max * idealWeight).toFixed(2)
    const maxValue = Math.max(min * idealWeight, max * idealWeight).toFixed(2)

    return { minValue, maxValue }
  }

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
      label: "Carbohydrate",
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
    console.log(ingredientsData)
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
    // if (phosphorus === 0 && kalium === 0 && sodium === 0 && fiber === 0) return []
    return { phosphorus, kalium, sodium, fiber }
  }

  return(
    <div>
      <p>圖表</p>
      {/* 該病人一日所需熱量/蛋白質的地方，這樣選擇營養品之後，可以讓我知道
      熱量（大卡、大卡/公斤體重）
      蛋白質（克、克/公斤體重）
      -三大營養素百分比
      -礦物質毫克（磷、鉀、鈉）
      -纖維 */}

      <p>calories:{ingredientsData.calories} Kcal / {calculateTDEE()} Kcal</p>
      <p>protein:{ingredientsData.protein}g ({calculateProtein().minValue}g - {calculateProtein().maxValue}g)</p>

      {chartData().length > 0 && <ChartContainer config={barChartConfig}>
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

      {pieChartData().length > 0 && <ChartContainer config={pieChartConfig}>
        <PieChart>
          <Pie data={pieChartData()} dataKey="percentage" nameKey="macronutrients">
            <LabelList
              dataKey="macronutrients"
              className="fill-background"
              stroke="none"
              fontSize={12}
              formatter={(value: keyof typeof pieChartConfig) =>
                pieChartConfig[value]?.label
              }
            />
          </Pie>
        </PieChart>
      </ChartContainer>}

      <div>
        <p>磷：{micronutrients().phosphorus}</p>
        <p>鉀：{micronutrients().kalium}</p>
        <p>鈉：{micronutrients().sodium}</p>
        <p>纖維：{micronutrients().fiber}</p>
      </div>
    </div>
  )
}