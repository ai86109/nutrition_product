"use client"

import type { PressureSorePoint } from "@/hooks/useSnapshotTrendData"

interface PressureSoreTableProps {
  data: PressureSorePoint[]
}

export function PressureSoreTable({ data }: PressureSoreTableProps) {
  if (data.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        尚無壓瘡紀錄
      </p>
    )
  }

  return (
    <div className="divide-y">
      {data.map((point) => (
        <div key={point.snapshotId} className="py-2 first:pt-1 last:pb-1">
          <span className="text-sm font-medium tabular-nums">{point.date}</span>
          {point.note && (
            <span className="ml-2 text-sm text-muted-foreground">{point.note}</span>
          )}
        </div>
      ))}
    </div>
  )
}
