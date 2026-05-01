"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { ProductHistoryPoint } from "@/hooks/useSnapshotTrendData"
import { formatNumber } from "@/lib/utils"

interface ProductHistoryTableProps {
  data: ProductHistoryPoint[]
  onViewRecord?: (snapshotId: string) => void
}

export function ProductHistoryTable({
  data,
  onViewRecord,
}: ProductHistoryTableProps) {
  if (data.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        尚無配方紀錄
      </p>
    )
  }

  return (
    <div className="divide-y">
      {data.map((point) => (
        <div key={point.snapshotId} className="py-3 first:pt-1 last:pb-1">
          {/* 日期列 + 查看按鈕 */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium tabular-nums">
              {point.date}
            </span>
            {onViewRecord && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 shrink-0 px-2 text-xs"
                onClick={() => onViewRecord(point.snapshotId)}
              >
                查看此筆紀錄
                <ArrowRight className="ml-1 size-3" />
              </Button>
            )}
          </div>

          {/* 配方列表 */}
          <ul className="mt-1 space-y-0.5">
            {point.products.map((p, i) => {
              const formLabel = p.form ? ` (${p.form})` : ""
              const servingDetail =
                p.serving_amount > 0 && p.serving_unit
                  ? ` · ${formatNumber(p.serving_amount)}${p.serving_unit}/份`
                  : ""
              return (
                <li
                  key={`${p.product_id}-${i}`}
                  className="text-sm text-muted-foreground"
                >
                  <span className="text-foreground">{p.name_zh}</span>
                  {formLabel}
                  <span className="tabular-nums">
                    {" · "}
                    {p.quantity} × {p.serving_label}
                    {servingDetail}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
