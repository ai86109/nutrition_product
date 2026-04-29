"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipProps } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import type { CaloriePoint } from "@/hooks/useSnapshotTrendData"
import { formatFullDate, formatShortDate } from "./format"
import { EmptyState } from "./empty-state"

const COLOR = "#1D9E75"

const config: ChartConfig = {
  value: { label: "每日熱量", color: COLOR },
}

interface CalorieTooltipPayload {
  ts: number
  value: number
}

function CalorieTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0].payload as CalorieTooltipPayload
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <div className="font-medium tabular-nums">{formatFullDate(data.ts)}</div>
      <div className="mt-0.5 tabular-nums">
        熱量 {data.value} <span className="text-muted-foreground">kcal</span>
      </div>
    </div>
  )
}

interface CalorieChartProps {
  data: CaloriePoint[]
}

export function CalorieChart({ data }: CalorieChartProps) {
  if (data.length === 0) return <EmptyState label="熱量" />

  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-[180px] w-full"
    >
      <LineChart
        data={data}
        margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="ts"
          type="number"
          domain={["dataMin", "dataMax"]}
          ticks={data.map((d) => d.ts)}
          tickFormatter={formatShortDate}
          tick={{ fontSize: 11 }}
          tickMargin={6}
          minTickGap={20}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickMargin={4}
          width={48}
          domain={["auto", "auto"]}
        />
        <Tooltip content={<CalorieTooltip />} cursor={{ strokeDasharray: "3 3" }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={COLOR}
          strokeWidth={2}
          dot={{ r: 3, fill: COLOR, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
