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

  return { addFavorite, removeFavorite, isFavorite, toggleFavorite }
}
