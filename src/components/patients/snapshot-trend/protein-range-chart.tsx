"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipProps } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import type { ProteinPoint } from "@/hooks/useSnapshotTrendData"
import { formatFullDate } from "./format"
import { EmptyState } from "./empty-state"

const COLOR = "#7F77DD"

const config: ChartConfig = {
  range: { label: "蛋白質範圍", color: COLOR },
}

interface ProteinTooltipPayload {
  ts: number
  min: number
  max: number
}

function ProteinTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0].payload as ProteinTooltipPayload
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <div className="font-medium tabular-nums">{formatFullDate(data.ts)}</div>
      <div className="mt-0.5 tabular-nums">
        蛋白質 {data.min} ~ {data.max}{" "}
        <span className="text-muted-foreground">g</span>
      </div>
    </div>
  )
}

interface ProteinRangeChartProps {
  data: ProteinPoint[]
}

export function ProteinRangeChart({ data }: ProteinRangeChartProps) {
  if (data.length === 0) return <EmptyState label="蛋白質範圍" />

  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-[180px] w-full"
    >
      <BarChart
        data={data}
        margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          type="category"
          tick={{ fontSize: 11 }}
          tickMargin={6}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickMargin={4}
          width={36}
          domain={["auto", "auto"]}
        />
        <Tooltip content={<ProteinTooltip />} cursor={{ fill: "transparent" }} />
        <Bar
          dataKey="range"
          fill={COLOR}
          fillOpacity={0.6}
          radius={[2, 2, 2, 2]}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  )
}
