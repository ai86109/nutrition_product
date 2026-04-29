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
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { MealsPoint } from "@/hooks/useSnapshotTrendData"
import { formatNumber } from "@/lib/utils"
import { formatFullDate, formatShortDate } from "./format"
import { EmptyState } from "./empty-state"

const COLOR = "#D85A30"

const config: ChartConfig = {
  value: { label: "每日餐數", color: COLOR },
}

interface MealsTooltipProps extends TooltipProps<number, string> {
  onViewRecord?: (snapshotId: string) => void
}

function MealsTooltip({ active, payload, onViewRecord }: MealsTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0].payload as MealsPoint
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <div className="font-medium tabular-nums">
        {formatFullDate(data.ts)} ·{" "}
        <span className="text-foreground">{data.value} 餐/天</span>
      </div>

      {data.products.length > 0 && (
        <ul className="mt-2 space-y-1.5 border-t pt-2">
          {data.products.map((p, i) => {
            const formLabel = p.form ? ` (${p.form})` : ""
            const servingDetail =
              p.serving_amount > 0 && p.serving_unit
                ? ` (${formatNumber(p.serving_amount)}${p.serving_unit})`
                : ""
            return (
              <li key={`${p.product_id}-${i}`}>
                <div>
                  {p.name_zh}
                  {formLabel}
                </div>
                <div className="text-muted-foreground tabular-nums">
                  {p.quantity} × {p.serving_label}
                  {servingDetail}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {onViewRecord && (
        <div className="mt-2 border-t pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onViewRecord(data.snapshotId)
            }}
          >
            查看此筆紀錄
            <ArrowRight className="ml-1 size-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

interface MealsChartProps {
  data: MealsPoint[]
  onViewRecord?: (snapshotId: string) => void
}

export function MealsChart({ data, onViewRecord }: MealsChartProps) {
  if (data.length === 0) return <EmptyState label="每日餐數" />

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
          width={32}
          allowDecimals={false}
          domain={["dataMin", "dataMax"]}
        />
        <Tooltip
          content={<MealsTooltip onViewRecord={onViewRecord} />}
          cursor={{ strokeDasharray: "3 3" }}
          /* 讓使用者能把游標移進 tooltip 點按鈕，不會立即關閉 */
          wrapperStyle={{ pointerEvents: "auto" }}
        />
        <Line
          type="stepAfter"
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
