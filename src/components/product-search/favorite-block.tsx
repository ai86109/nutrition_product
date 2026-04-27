import { useMemo } from "react"
import { Star } from "lucide-react"
import { useUserPreferences } from "@/contexts/UserPreferencesContext"
import { useAuth } from "@/contexts/AuthContext"
import { useProduct } from "@/contexts/ProductContext"
import ProductListItem from "./product-list-item"
import { ApiProductData } from "@/types"

export default function FavoriteBlock() {
  const { isLoggedIn } = useAuth()
  const { favorites } = useUserPreferences()
  const { allProducts } = useProduct()

  const productMap = useMemo(
    () => new Map(allProducts.map((p) => [p.id, p])),
    [allProducts]
  )

  // Most recently favorited appears first
  const favoriteList = useMemo(
    () =>
      [...favorites]
        .reverse()
        .map((id) => productMap.get(id))
        .filter((item): item is ApiProductData => Boolean(item)),
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
