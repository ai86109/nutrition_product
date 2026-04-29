"use client"

import { useEffect, useRef, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useSnapshotTrendData } from "@/hooks/useSnapshotTrendData"
import type { Patient, PatientSnapshot } from "@/types/patient"
import { WeightChart } from "./snapshot-trend/weight-chart"
import { CalorieChart } from "./snapshot-trend/calorie-chart"
import { ProteinRangeChart } from "./snapshot-trend/protein-range-chart"
import { MealsChart } from "./snapshot-trend/meals-chart"

interface SnapshotTrendSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient
  snapshots: PatientSnapshot[]
  /**
   * 點擊 meals tooltip 上「查看此筆紀錄」按鈕時呼叫。
   * 父層負責關 Sheet、展開對應 snapshot、捲動到該卡片。
   */
  onViewRecord?: (snapshotId: string) => void
}

interface ChartCellProps {
  title: string
  summary?: string
  children: React.ReactNode
}

function ChartCell({ title, summary, children }: ChartCellProps) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-baseline justify-between gap-2 px-1 pb-1">
        <h3 className="text-sm font-medium">{title}</h3>
        {summary && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {summary}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function summarize(
  values: number[],
  formatter: (n: number) => string = (n) => String(n)
): string | undefined {
  if (values.length < 2) return undefined
  const first = values[0]
  const last = values[values.length - 1]
  if (first === last) return undefined
  return `${formatter(first)} → ${formatter(last)}`
}

export function SnapshotTrendSheet({
  open,
  onOpenChange,
  patient,
  snapshots,
  onViewRecord,
}: SnapshotTrendSheetProps) {
  const trend = useSnapshotTrendData(snapshots)

  // 手機版底部拉出效果
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // 拖動收起
  const dragStartY = useRef<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY
    setDragOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return
    const delta = e.touches[0].clientY - dragStartY.current
    if (delta > 0) setDragOffset(delta)
  }

  const handleTouchEnd = () => {
    if (dragOffset > 100) {
      onOpenChange(false)
    }
    setDragOffset(0)
    dragStartY.current = null
  }

  const weightSummary = summarize(trend.weight.map((p) => p.value))
  const calorieSummary = summarize(trend.calorie.map((p) => p.value))
  const proteinSummary =
    trend.protein.length >= 2
      ? `${trend.protein[0].min}–${trend.protein[0].max} → ${trend.protein[trend.protein.length - 1].min}–${trend.protein[trend.protein.length - 1].max}`
      : undefined
  const mealsSummary = summarize(trend.meals.map((p) => p.value))

  const headerSubtitle = trend.dateRange
    ? `${patient.name} · ${trend.totalCount} 筆紀錄 · ${trend.dateRange.from} → ${trend.dateRange.to}`
    : patient.name

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "max-h-[90vh] overflow-y-auto rounded-t-2xl gap-0 pb-safe"
            : "w-full overflow-y-auto sm:max-w-2xl"
        }
        style={
          isMobile && dragOffset > 0
            ? { transform: `translateY(${dragOffset}px)`, transition: "none" }
            : undefined
        }
      >
        {/* 手機版拖動把手 */}
        {isMobile && (
          <div
            className="flex touch-none items-center justify-center py-3"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        <SheetHeader className="border-b">
          <SheetTitle>追蹤紀錄趨勢</SheetTitle>
          <SheetDescription>{headerSubtitle}</SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          <ChartCell title="體重 (kg)" summary={weightSummary}>
            <WeightChart data={trend.weight} />
          </ChartCell>

          <ChartCell title="每日熱量 (kcal)" summary={calorieSummary}>
            <CalorieChart data={trend.calorie} />
          </ChartCell>

          <ChartCell title="蛋白質範圍 (g)" summary={proteinSummary}>
            <ProteinRangeChart data={trend.protein} />
          </ChartCell>

          <ChartCell title="每日餐數" summary={mealsSummary}>
            <MealsChart data={trend.meals} onViewRecord={onViewRecord} />
          </ChartCell>
        </div>

        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          滑鼠停留資料點可看當日數值，每日餐數的 tooltip 會列出當日營養品。
        </div>
      </SheetContent>
    </Sheet>
  )
}
