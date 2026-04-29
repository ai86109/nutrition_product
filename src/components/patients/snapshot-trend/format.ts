/**
 * 把 timestamp 格式化為 X 軸的短日期 (M/D)，例如 4/15
 */
export function formatShortDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/**
 * Tooltip 用的完整日期 (YYYY-MM-DD)
 */
export function formatFullDate(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
