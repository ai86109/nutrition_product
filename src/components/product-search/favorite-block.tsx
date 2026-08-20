import { useEffect, useMemo, useRef } from "react"
import { Star } from "lucide-react"
import { useUserPreferences } from "@/contexts/UserPreferencesContext"
import { useAuth } from "@/contexts/AuthContext"
import { useProduct } from "@/contexts/ProductContext"
import ProductListItem from "./product-list-item"
import { ApiProductListData } from "@/types"
import { useFavoriteSettings } from "@/hooks/localStorage-related/useFavoriteSettings"

export default function FavoriteBlock() {
  const { isLoggedIn } = useAuth()
  const { favorites } = useUserPreferences()
  const { allProducts } = useProduct()

  const productMap = useMemo(
    () => new Map(allProducts.map((p) => [p.id, p])),
    [allProducts]
  )

  const { pruneOrphanFavorites } = useFavoriteSettings()
  const didPruneRef = useRef(false)

  // allProducts 載入完成後，清掉查不到對應產品的失效收藏（整個過程只跑一次）
  useEffect(() => {
    if (!isLoggedIn) return
    if (allProducts.length === 0) return // 尚未載入 / SSR 取回空陣列時不動作，避免誤刪
    if (didPruneRef.current) return
    if (!favorites.some((id) => !productMap.has(id))) return
    didPruneRef.current = true
    void pruneOrphanFavorites((id) => productMap.has(id))
  }, [isLoggedIn, allProducts.length, favorites, productMap, pruneOrphanFavorites])

  // Most recently favorited appears first
  const favoriteList = useMemo(
    () =>
      [...favorites]
        .reverse()
        .map((id) => productMap.get(id))
        .filter((item): item is ApiProductListData => Boolean(item)),
    [favorites, productMap]
  )

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
        <Star className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm">登入後即可使用收藏功能</p>
      </div>
    )
  }

  if (favoriteList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
        <Star className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm">尚未收藏任何營養品</p>
        <p className="text-xs">點擊產品旁的 ★ 加入收藏</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {favoriteList.map((item) => (
        <ProductListItem key={item.id} item={item} />
      ))}
    </div>
  )
}
