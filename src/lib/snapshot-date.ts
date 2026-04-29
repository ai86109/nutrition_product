/**
 * Snapshot 的 effective date 工具函式。
 *
 * 概念：每筆 snapshot 有兩個日期欄位
 *   - created_at：系統建立 timestamp（不可編輯）
 *   - snapshot_date：使用者指定的日期（YYYY-MM-DD，可為 null）
 *
 * 顯示與排序都用「effective date」：
 *   snapshot_date 有值就用它，沒有就 fallback 到 created_at 的本地日期。
 */

interface MinimalSnapshotDateFields {
  created_at: string
  snapshot_date: string | null
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

/**
 * 把 ISO timestamp 轉成本地時區的 YYYY-MM-DD
 */
function toLocalDateString(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/**
 * 取得 effective date 的 YYYY-MM-DD 字串。
 */
export function getEffectiveDate(s: MinimalSnapshotDateFields): string {
  return s.snapshot_date ?? toLocalDateString(s.created_at)
}

/**
 * 取得 effective date 的 timestamp（ms）。給圖表 X 軸與日期區間比較用。
 *
 * - snapshot_date 有值：以該日當天 00:00:00（本地時區）的 timestamp 為準
 * - 沒有值：直接用 created_at 的 timestamp
 */
export function getEffectiveDateMs(s: MinimalSnapshotDateFields): number {
  if (s.snapshot_date) {
    return new Date(`${s.snapshot_date}T00:00:00`).getTime()
  }
  return new Date(s.created_at).getTime()
}

/**
 * 比較 a, b 兩筆 snapshot 的 effective date（asc）。
 *
 * 同日（snapshot_date / fallback 後字串相同）時用 created_at timestamp 當 tiebreaker。
 */
export function compareByEffectiveDateAsc(
  a: MinimalSnapshotDateFields,
  b: MinimalSnapshotDateFields
): number {
  const aDate = getEffectiveDate(a)
  const bDate = getEffectiveDate(b)
  if (aDate < bDate) return -1
  if (aDate > bDate) return 1
  // 同一天：用實際 created_at 排序
  return (
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
}

export function compareByEffectiveDateDesc(
  a: MinimalSnapshotDateFields,
  b: MinimalSnapshotDateFields
): number {
  return -compareByEffectiveDateAsc(a, b)
}
