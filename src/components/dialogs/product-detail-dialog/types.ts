// dialog 內部共用 types

/**
 * 接受 search 列表 (ApiProductListData) 與計算區 (ProductData) 共用的最小欄位集。
 * 主 ProductDetailDialog props 與所有子 component 用 panel item 都依此型別傳遞。
 */
export interface ProductDetailDialogItem {
  id: string
  name: string
  engName: string
  brand: string
  type?: string
  categories?: string[]
  productStatus?: string | null
}

/** 在主 dialog 與 ProductPanelContent / MobileCompareView 之間傳遞的營養素群組結構 */
export type OrderedGroup = { key: string; items: string[] }
