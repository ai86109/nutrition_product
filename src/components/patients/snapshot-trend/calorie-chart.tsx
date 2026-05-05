"use client"

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipProps } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import type { CaloriePoint } from "@/hooks/useSnapshotTrendData"
import { formatFullDate } from "./format"
import { EmptyState } from "./empty-state"

const COLOR_RANGE = "#1D9E75"
const COLOR_ACTUAL = "#F59E0B"

const config: ChartConfig = {
  range: { label: "目標熱量範圍", color: COLOR_RANGE },
  actual: { label: "實際熱量", color: COLOR_ACTUAL },
}

interface CalorieTooltipPayload {
  ts: number
  min: number | null
  max: number | null
  actual: number | null
}

function CalorieTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0].payload as CalorieTooltipPayload

  // 與主畫面 CalorieHeroCard 一致的狀態文字
  let statusText: string | null = null
  if (data.actual != null && data.min != null && data.max != null) {
    const minVal = Math.min(data.min, data.max)
    const maxVal = Math.max(data.min, data.max)
    if (data.actual >= minVal && data.actual <= maxVal) {
      statusText = "符合目標範圍"
    } else {
      const isBelow = data.actual < minVal
      const deviation = Number(
        (isBelow ? minVal - data.actual : data.actual - maxVal).toFixed(1)
      )
      statusText = `${isBelow ? "低於" : "高於"}目標範圍 ${deviation} kcal`
    }
  }

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <div className="font-medium tabular-nums">{formatFullDate(data.ts)}</div>
      {data.min != null && data.max != null && (
        <div className="mt-0.5 tabular-nums">
          目標{" "}
          <span style={{ color: COLOR_RANGE }} className="font-medium">
            {data.min} ~ {data.max}
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
      {statusText && (
        <div className="mt-0.5 font-medium">{statusText}</div>
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
      <ComposedChart
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
          padding={{ left: 16, right: 16 }}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickMargin={4}
          width={48}
          domain={["auto", "auto"]}
        />
        <Tooltip content={<CalorieTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar
          dataKey="range"
          fill={COLOR_RANGE}
          fillOpacity={0.5}
          radius={[2, 2, 2, 2]}
          barSize={16}
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
      </ComposedChart>
    </ChartContainer>
  )
}
