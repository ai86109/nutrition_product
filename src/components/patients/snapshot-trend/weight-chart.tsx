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
import type { WeightPoint } from "@/hooks/useSnapshotTrendData"
import { formatFullDate, formatShortDate } from "./format"
import { EmptyState } from "./empty-state"

const COLOR = "#378ADD"

const config: ChartConfig = {
  value: { label: "體重", color: COLOR },
}

interface WeightTooltipPayload {
  ts: number
  value: number
}

function WeightTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0].payload as WeightTooltipPayload
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <div className="font-medium tabular-nums">{formatFullDate(data.ts)}</div>
      <div className="mt-0.5 tabular-nums">
        體重 {data.value} <span className="text-muted-foreground">kg</span>
      </div>
    </div>
  )
}

interface WeightChartProps {
  data: WeightPoint[]
}

export function WeightChart({ data }: WeightChartProps) {
  if (data.length === 0) return <EmptyState label="體重" />

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
          width={36}
          domain={["auto", "auto"]}
        />
        <Tooltip content={<WeightTooltip />} cursor={{ strokeDasharray: "3 3" }} />
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
