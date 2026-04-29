import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 把數字四捨五入到最多 N 位小數，並去除沒意義的尾零。
 *
 * 用於顯示層消除 JS 浮點誤差（例如 58 * 1 跑出 58.001999999999995）。
 *
 * - formatNumber(58.001999999999995) → "58"
 * - formatNumber(23.5) → "23.5"
 * - formatNumber(23.456) → "23.46"
 * - formatNumber(0)  → "0"
 */
export function formatNumber(value: number, maxDecimals: number = 2): string {
  if (!Number.isFinite(value)) return String(value)
  return String(parseFloat(value.toFixed(maxDecimals)))
}
