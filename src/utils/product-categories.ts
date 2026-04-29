/**
 * 營養品配方種類的 single source of truth。
 * 對應 DB `products.categories` 欄位（text[]），值為英文 enum，前端顯示時轉中文。
 *
 * 未來新增 category 時，只要改這一個檔案：
 *   - 加進 PRODUCT_CATEGORY_KEYS（保持 `as const` 的元組型別）
 *   - 在 PRODUCT_CATEGORY_LABELS 補對應的中文 label
 */

export const PRODUCT_CATEGORY_KEYS = ['balanced', 'concentrated'] as const

export type ProductCategory = (typeof PRODUCT_CATEGORY_KEYS)[number]

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  balanced: '均衡配方',
  concentrated: '濃縮配方',
}

/**
 * 把單一 category key 轉成中文 label。未知 key（DB 髒資料或將來新增還沒同步前端）
 * 直接回傳原值，行為跟舊的 categoryProcessor 一致。
 */
export function getCategoryLabel(key: string): string {
  return PRODUCT_CATEGORY_LABELS[key as ProductCategory] ?? key
}
