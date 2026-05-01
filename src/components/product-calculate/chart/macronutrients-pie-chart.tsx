import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { IngredientsData } from "@/types"
import { useMemo } from "react"
import { Cell, Pie, PieChart } from "recharts"
import { calcMacroRatios } from "@/utils/nutrition-calculations"

const pieChartConfig: ChartConfig = {
  carbohydrates: {
    label: "碳水化合物",
    color: "#2f6f92",
  },
  protein: {
    label: "蛋白質",
    color: "#d47a4a",
  },
  fat: {
    label: "脂肪",
    color: "#6f8f3a",
  },
}

type MacronutrientKey = "carbohydrates" | "protein" | "fat"

type PieChartItem = {
  macronutrients: MacronutrientKey
  percentage: number
}

export function MacronutrientsPieChart({
  ingredientsData,
}: {
  ingredientsData: IngredientsData
}) {
  const pieChartData = useMemo(() => {
    const ratios = calcMacroRatios(ingredientsData)
    if (!ratios) return []

    return ([
      { macronutrients: "carbohydrates", percentage: ratios.carb },
      { macronutrients: "protein",       percentage: ratios.protein },
      { macronutrients: "fat",           percentage: ratios.fat },
    ] as PieChartItem[]).filter(item => item.percentage > 0)
  }, [ingredientsData])

  if (pieChartData.length === 0) return null

  return (
    <div className="w-full flex flex-col gap-1">
      <p className="text-xs text-muted-foreground px-0.5">三大營養素熱量占比</p>

      <ChartContainer config={pieChartConfig} className="w-full h-[220px]">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name) => {
                  const key = name as MacronutrientKey
                  return (
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        {pieChartConfig[key]?.label}
                      </span>
                      <span className="font-medium tabular-nums text-foreground">
                        {Number(value).toFixed(1)}%
                      </span>
                    </div>
                  )
                }}
              />
            }
          />
          <Pie
            data={pieChartData}
            dataKey="percentage"
            nameKey="macronutrients"
            innerRadius={56}
            outerRadius={84}
            paddingAngle={3}
            cornerRadius={6}
            stroke="none"
            isAnimationActive
            animationDuration={700}
          >
            {pieChartData.map(entry => (
              <Cell
                key={entry.macronutrients}
                fill={`var(--color-${entry.macronutrients})`}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="grid grid-cols-3 divide-x divide-border/60 text-center items-center">
        {pieChartData.map(item => (
          <div key={item.macronutrients} className="flex flex-col items-center gap-1 py-2 px-1">
            <div className="flex items-center justify-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: pieChartConfig[item.macronutrients].color }}
                aria-hidden
              />
              <span className="text-xs text-muted-foreground text-center whitespace-nowrap">
                {pieChartConfig[item.macronutrients].label}
              </span>
            </div>
            <span className="text-sm font-bold tabular-nums text-center">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}