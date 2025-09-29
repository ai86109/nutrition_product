import { ChartContainer, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts"

const barChartConfig: ChartConfig = {
  percentage: {
    label: "percentage",
    color: "hsl(var(#1e1e1e))",
  },
}

interface NutritionBarChartProps {
  data: { label: string; percentage: number; target: number; text: string }[]
}

export function NutritionBarChart({ data }: NutritionBarChartProps) {
  if (data.length === 0) return null

  return (
    <ChartContainer config={barChartConfig} className="w-[120px] h-[40px]">
      <BarChart accessibilityLayer data={data} layout="vertical">
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
            position={data[0]?.percentage < 45 ? "right" : "insideRight"}
            offset={8}
            fill={data[0]?.percentage < 45 ? "black" : "white"}
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}