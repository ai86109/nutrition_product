'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DauPoint } from '@/lib/supabase/queries/admin-activity'

interface DauChartProps {
  data: DauPoint[]
}

function formatTickDate(raw: string) {
  // raw: 'YYYY-MM-DD'，X 軸只顯示 'MM/DD'
  const [, m, d] = raw.split('-')
  return `${m}/${d}`
}

function formatTooltipDate(raw: string) {
  return raw
}

export function DauChart({ data }: DauChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        沒有資料
      </div>
    )
  }

  const maxDau = Math.max(...data.map((d) => d.dau), 1)
  // Y 軸給一點 headroom
  const yMax = Math.ceil(maxDau * 1.2)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatTickDate}
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          domain={[0, yMax]}
          tick={{ fontSize: 12 }}
          width={40}
        />
        <Tooltip
          labelFormatter={formatTooltipDate}
          formatter={(value: number) => [`${value} 人`, 'DAU']}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="dau"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
