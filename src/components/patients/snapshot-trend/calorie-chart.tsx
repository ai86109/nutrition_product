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

const COLOR_TARGET = "#1D9E75"
const COLOR_ACTUAL = "#F59E0B"

const config: ChartConfig = {
  value: { label: "目標熱量", color: COLOR_TARGET },
  actual: { label: "實際熱量", color: COLOR_ACTUAL },
}

interface CalorieTooltipPayload {
  ts: number
  value: number | null
  actual: number | null
  pct: number | null
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
      {data.value != null && (
        <div className="mt-0.5 tabular-nums">
          目標{" "}
          <span style={{ color: COLOR_TARGET }} className="font-medium">
            {data.value}
          </span>{" "}
          <span className="text-muted-foreground">kcal</span>
        </div>
      )}
      {data.actual != null && (
        <div className="mt-0.5 tabular-nums">
          實際{" "}
          <span style={{ color: COLOR_ACTUAL }} className="font-medium">
            {data.actual}
          </span>{" "}
          <span className="text-muted-foreground">kcal</span>
        </div>
      )}
      {data.pct != null && (
        <div className="mt-0.5 tabular-nums">
          達成率{" "}
          <span className="font-medium">
            {data.pct}%
          </span>
        </div>
      )}
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
          padding={{ left: 16, right: 16 }}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickMargin={4}
          width={48}
          domain={([min, max]) => [Math.max(0, Math.floor(min * 0.9)), Math.ceil(max * 1.1)]}
        />
        <Tooltip content={<CalorieTooltip />} cursor={{ strokeDasharray: "3 3" }} />
        <Line
          type="monotone"
          dataKey="value"
          name="目標熱量"
          stroke={COLOR_TARGET}
          strokeWidth={2}
          dot={{ r: 3, fill: COLOR_TARGET, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          connectNulls={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="實際熱量"
          stroke={COLOR_ACTUAL}
          strokeWidth={2}
          strokeDasharray="4 3"
          dot={{ r: 3, fill: COLOR_ACTUAL, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          connectNulls={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
