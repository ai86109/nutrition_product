/**
 * 三大營養素的顯示設定（顏色、標籤、淡色背景）。
 *
 * 一處設定共用：
 *   - product-detail-dialog 的 MacroRatioLine 三個 chips
 *   - product-calculate/chart 的 MacronutrientsPieChart 圓餅圖
 */
export const MACRO_DISPLAY = {
  carb: {
    label: "醣類",
    /** 圓餅圖等需要完整名稱時用 */
    labelLong: "碳水化合物",
    color: "#2f6f92",
    /** chips 等小元件用的 10% alpha 背景 */
    bgTint: "rgba(47,111,146,0.10)",
  },
  protein: {
    label: "蛋白質",
    labelLong: "蛋白質",
    color: "#d47a4a",
    bgTint: "rgba(212,122,74,0.10)",
  },
  fat: {
    label: "脂肪",
    labelLong: "脂肪",
    color: "#6f8f3a",
    bgTint: "rgba(111,143,58,0.10)",
  },
} as const

export type MacroKey = keyof typeof MACRO_DISPLAY

/** 三大營養素 key 的固定順序：醣類 → 蛋白質 → 脂肪 */
export const MACRO_KEYS: readonly MacroKey[] = ["carb", "protein", "fat"] as const
