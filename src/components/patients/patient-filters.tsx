"use client"

import { Search, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PatientFiltersProps {
  nameQuery: string
  dateFrom: string
  dateTo: string
  onNameQueryChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onReset: () => void
}

/**
 * 病人追蹤頁的篩選列：名字搜尋 + memo 建立日期區間 + 重置。
 * 僅是 UI，所有 state 由父層 (patients/page.tsx) 管理。
 */
export default function PatientFilters({
  nameQuery,
  dateFrom,
  dateTo,
  onNameQueryChange,
  onDateFromChange,
  onDateToChange,
  onReset,
}: PatientFiltersProps) {
  const hasAnyFilter =
    nameQuery !== "" || dateFrom !== "" || dateTo !== ""
  // YYYY-MM-DD 字串可直接做字典序比較
  const hasInvalidRange =
    dateFrom !== "" && dateTo !== "" && dateFrom > dateTo

  return (
    <div className="mb-4 space-y-2 rounded-lg border bg-muted/40 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* 名字搜尋 */}
        <div className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜尋病人名字"
            value={nameQuery}
            onChange={(e) => onNameQueryChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* 日期區間 */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            aria-label="memo 起始日期"
            aria-invalid={hasInvalidRange || undefined}
            className="w-[150px]"
          />
          <span className="text-sm text-muted-foreground">~</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            aria-label="memo 結束日期"
            aria-invalid={hasInvalidRange || undefined}
            className="w-[150px]"
          />
        </div>

        {/* 重置 */}
        <Button
          variant="outline"
          onClick={onReset}
          disabled={!hasAnyFilter}
          className="shrink-0"
        >
          <RotateCcw className="size-4" />
          重置
        </Button>
      </div>

      {hasInvalidRange && (
        <p className="text-xs text-red-500">
          起始日期晚於結束日期，沒有符合的紀錄
        </p>
      )}
    </div>
  )
}
