import Link from "next/link"
import { Star, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ApiProductData } from "@/types"
import { getLinkPath } from "@/utils/external-links"
import { useProduct } from "@/contexts/ProductContext"
import { useAuth } from "@/contexts/AuthContext"
import { useHistorySettings } from "@/hooks/localStorage-related/useHistorySettings"
import { useFavoriteSettings } from "@/hooks/localStorage-related/useFavoriteSettings"
import { cn } from "@/lib/utils"

export default function ProductListItem({ item }: { item: ApiProductData }) {
  const { isLoggedIn } = useAuth()
  const { productList, setProductList } = useProduct()
  const { addList } = useHistorySettings()
  const { isFavorite, toggleFavorite } = useFavoriteSettings()

  const isAdded = productList.includes(item.id)
  const isFaved = isFavorite(item.id)

  const handleAddToCalculate = (): void => {
    if (isAdded) return
    setProductList((prev: string[]) => [...prev, item.id])
    if (isLoggedIn) addList(item.id)
  }

  const handleToggleFavorite = (): void => {
    toggleFavorite(item.id)
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border/60 last:border-b-0 hover:bg-muted/40 transition-colors">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={getLinkPath(item.id)} target="_blank" className="block">
          <p className="text-sm font-medium truncate">{item.name}</p>
          {item.engName && (
            <p className="text-xs text-muted-foreground truncate">{item.engName}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground">{item.brand}</span>
            {item.type && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 border-transparent",
                  item.type === "液劑" && "bg-blue-50 text-blue-600 hover:bg-blue-50",
                  item.type === "粉劑" && "bg-amber-50 text-amber-600 hover:bg-amber-50"
                )}
              >
                {item.type}
              </Badge>
            )}
            {item.categories?.map((category) => (
              <Badge key={category} variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {category}
              </Badge>
            ))}
          </div>
        </Link>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 cursor-pointer",
            isFaved && "bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100 hover:text-amber-600"
          )}
          onClick={handleToggleFavorite}
          aria-label={isFaved ? "取消收藏" : "加入收藏"}
          title={isFaved ? "取消收藏" : "加入收藏"}
        >
          <Star className={cn("h-4 w-4", isFaved && "fill-current")} />
        </Button>
        <Button
          variant={isAdded ? "secondary" : "outline"}
          size="icon"
          className={cn(
            "h-8 w-8 cursor-pointer",
            isAdded && "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15"
          )}
          onClick={handleAddToCalculate}
          aria-label={isAdded ? "已加入計算" : "加入計算"}
          title={isAdded ? "已加入計算" : "加入計算"}
        >
          {isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
