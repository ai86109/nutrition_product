import { toast } from "sonner";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserSetting } from '@/hooks/useUserSetting'
import { MAX_FAVORITES } from "@/utils/constants";

export function useFavoriteSettings() {
  const { isLoggedIn } = useAuth()
  const { updateSetting } = useUserSetting()
  const { favorites } = useUserPreferences()

  const addFavorite = async (id: string) => {
    if (!isLoggedIn) {
      toast.error("請先登入後使用收藏功能")
      return
    }
    if (favorites.includes(id)) return
    if (favorites.length >= MAX_FAVORITES) {
      toast.error(`收藏已達上限 ${MAX_FAVORITES} 筆，請先移除其他收藏`)
      return
    }

    const newFavoriteList = [...favorites, id];
    await updateSetting('favorite', newFavoriteList);
    toast.success("已加入收藏")
  }

  const removeFavorite = async (id: string) => {
    if (!isLoggedIn) {
      toast.error("請先登入後使用收藏功能")
      return
    }
    const newFavoriteList = favorites.filter(item => item !== id);
    await updateSetting('favorite', newFavoriteList);
    toast.success("已移除收藏")
  }

  const isFavorite = (id: string) => favorites.includes(id)

  const toggleFavorite = async (id: string) => {
    if (isFavorite(id)) {
      await removeFavorite(id)
    } else {
      await addFavorite(id)
    }
  }

  // 清掉「查不到對應產品」的失效收藏（產品已下架 / 自訂已刪除 / 無營養資料被排除）
  // isValid 由呼叫端提供（通常是 allProducts 建出的 productMap.has）
  const pruneOrphanFavorites = async (isValid: (id: string) => boolean) => {
    if (!isLoggedIn) return
    const cleaned = favorites.filter(isValid)
    if (cleaned.length === favorites.length) return
    const removed = favorites.length - cleaned.length
    await updateSetting('favorite', cleaned)
    toast.warning(`已移除 ${removed} 筆失效的收藏（產品已不存在）`)
  }

  return { addFavorite, removeFavorite, isFavorite, toggleFavorite, pruneOrphanFavorites }
}
