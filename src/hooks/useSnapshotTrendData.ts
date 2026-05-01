import { useMemo } from "react"
import type {
  PatientSnapshot,
  SnapshotSelectedProduct,
} from "@/types/patient"
import {
  compareByEffectiveDateAsc,
  getEffectiveDate,
  getEffectiveDateMs,
} from "@/lib/snapshot-date"

/**
 * 把多筆 snapshot 轉成趨勢圖與配方紀錄所需的 chart-ready 資料。
 *
 * - 輸入順序不限（queries 拿回來是 effective date desc，這裡內部用 compareByEffectiveDateAsc 排）
 * - 各指標分別過濾 null：某筆 snapshot 沒有體重，weight 序列就跳過該筆
 * - 蛋白質範圍要 min 和 max 都是有效數字才算一筆
 * - 時間軸用 effective date：snapshot_date 有值用它；沒有 fallback 到 created_at::date
 * - productHistory：含配方的 snapshot，按 effective date 降序（最新在前）
 */

export interface TrendPointBase {
  snapshotId: string
  /** Effective date timestamp (ms) — 給 Recharts numeric XAxis 用 */
  ts: number
  /** YYYY-MM-DD — 給 tooltip / tick 顯示用（本地時區） */
  date: string
}

export interface WeightPoint extends TrendPointBase {
  value: number
  edema?: boolean | null
  edema_note?: string | null
}

export interface CaloriePoint extends TrendPointBase {
  value: number | null
  actual: number | null
  /** 實際 / 目標 × 100，兩者皆有時才有值 */
  pct: number | null
}

export interface ProteinPoint extends TrendPointBase {
  min: number
  max: number
  /** [min, max] — 直接給 Recharts Bar 的 dataKey 當 floating bar 用 */
  range: [number, number]
}

/** 配方變化紀錄：每筆含配方的 snapshot 對應一筆，按 effective date 降序（最新在前） */
export interface ProductHistoryPoint {
  snapshotId: string
  /** YYYY-MM-DD */
  date: string
  products: SnapshotSelectedProduct[]
}

/** 壓瘡紀錄：每筆有壓瘡的 snapshot 對應一筆，按 effective date 降序（最新在前） */
export interface PressureSorePoint {
  snapshotId: string
  /** YYYY-MM-DD */
  date: string
  note: string | null
}

export interface SnapshotTrendData {
  weight: WeightPoint[]
  calorie: CaloriePoint[]
  protein: ProteinPoint[]
  /** 含配方的 snapshot，按 effective date 降序（最新在前） */
  productHistory: ProductHistoryPoint[]
  /** 有壓瘡的 snapshot，按 effective date 降序（最新在前） */
  pressureSoreHistory: PressureSorePoint[]
  /** 全部 snapshot 中最早與最晚的 effective date；無資料時為 null */
  dateRange: { from: string; to: string } | null
  /** 輸入 snapshot 總數（不過濾） */
  totalCount: number
}

function isValidNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v)
}

export function useSnapshotTrendData(
  snapshots: PatientSnapshot[]
): SnapshotTrendData {
  return useMemo(() => {
    const sorted = [...snapshots].sort(compareByEffectiveDateAsc)

    const weight: WeightPoint[] = []
    const calorie: CaloriePoint[] = []
    const protein: ProteinPoint[] = []
    const productHistory: ProductHistoryPoint[] = []
    const pressureSoreHistory: PressureSorePoint[] = []

    sorted.forEach((s) => {
      const ts = getEffectiveDateMs(s)
      const date = getEffectiveDate(s)
      const base = { snapshotId: s.id, ts, date }

      const w = s.bio_info?.weight
      if (isValidNumber(w)) {
        weight.push({
          ...base,
          value: w,
          edema: s.bio_info?.edema,
          edema_note: s.bio_info?.edema_note,
        })
      }

      const c = s.calorie_target
      const ca = s.actual_calorie
      if (isValidNumber(c) || isValidNumber(ca)) {
        const pct =
          isValidNumber(c) && isValidNumber(ca) && c > 0
            ? Math.round((ca / c) * 100)
            : null
        calorie.push({
          ...base,
          value: isValidNumber(c) ? c : null,
          actual: isValidNumber(ca) ? ca : null,
          pct,
        })
      }

      const pr = s.protein_range
      if (pr && isValidNumber(pr.min) && isValidNumber(pr.max)) {
        protein.push({
          ...base,
          min: pr.min,
          max: pr.max,
          range: [pr.min, pr.max],
        })
      }

      const prods = s.selected_products ?? []
      if (prods.length > 0) {
        productHistory.unshift({ snapshotId: s.id, date, products: prods })
      }

      if (s.bio_info?.pressure_sore) {
        pressureSoreHistory.unshift({
          snapshotId: s.id,
          date,
          note: s.bio_info.pressure_sore_note ?? null,
        })
      }
    })

    const dateRange =
      sorted.length > 0
        ? {
            from: getEffectiveDate(sorted[0]),
            to: getEffectiveDate(sorted[sorted.length - 1]),
          }
        : null

    return {
      weight,
      calorie,
      protein,
      productHistory,
      pressureSoreHistory,
      dateRange,
      totalCount: sorted.length,
    }
  }, [snapshots])
}
