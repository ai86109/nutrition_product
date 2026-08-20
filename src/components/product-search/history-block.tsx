import { useEffect, useMemo, useRef } from "react"
import { History } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useUserPreferences } from "@/contexts/UserPreferencesContext"
import { useProduct } from "@/contexts/ProductContext"
import ProductListItem from "./product-list-item"
import { ApiProductListData } from "@/types"
import { useHistorySettings } from "@/hooks/localStorage-related/useHistorySettings"

export default function HistoryBlock() {
  const { isLoggedIn } = useAuth()
  const { history } = useUserPreferences()
  const { allProducts } = useProduct()

  const productMap = useMemo(
    () => new Map(allProducts.map((p) => [p.id, p])),
    [allProducts]
  )

  const { pruneOrphanHistory } = useHistorySettings()
  const didPruneRef = useRef(false)

  // allProducts 載入完成後，清掉查不到對應產品的失效紀錄（整個過程只跑一次）
  useEffect(() => {
    if (!isLoggedIn) return
    if (allProducts.length === 0) return // 尚未載入 / SSR 取回空陣列時不動作，避免誤刪
    if (didPruneRef.current) return
    if (!history.some((id) => !productMap.has(id))) return
    didPruneRef.current = true
    void pruneOrphanHistory((id) => productMap.has(id))
  }, [isLoggedIn, allProducts.length, history, productMap, pruneOrphanHistory])

  // Reverse so that the most recently added items appear first
  const historyList = useMemo(
    () =>
      [...history]
        .reverse()
        .map((id) => productMap.get(id))
        .filter((item): item is ApiProductListData => Boolean(item)),
    [history, productMap]
  )

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
        <History className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm">登入後即可使用最近使用功能</p>
      </div>
    )
  }

  if (historyList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
        <History className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm">尚無最近使用紀錄</p>
        <p className="text-xs">加入過的營養品會顯示在這裡</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {historyList.map((item) => (
        <ProductListItem key={item.id} item={item} />
      ))}
    </div>
  )
}
